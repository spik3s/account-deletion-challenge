import PropTypes from "prop-types";
import React from "react";

import ConfirmView from "../ConfirmView";
import TransferOwnerView from "../TransferOwnerView";
import FeedbackView from "../FeedbackView";
import * as LoadState from "../../LoadState";

import * as VIEWS from "../../constants/views";

export default class Dialog extends React.Component {
	static propTypes = {
		user: PropTypes.exact({
			_id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
			name: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired
		}).isRequired
	};

	state = {
		activeModal: VIEWS.TRANSFER,
		transferData: [],
		feedbackData: {
			answers: [],
			comment: ""
		},
		loading: true,
		requiredTransferWorkspaces: [],
		deleteWorkspaces: [],
		transferOwnershipStatus: {
			workspaceId: "",
			fromUserId: "",
			toUserId: "",
			...LoadState.pending
		},
		terminateAccountStatus: {}
	};

	fetchAbortController = new AbortController();

	handleFetchErrors = response => {
		if (!response.ok) throw Error(response.status);
		return response;
	};

	componentDidMount() {
		if (LoadState.isLoaded(this.state.terminateAccountStatus)) {
			this.redirectToHomepage();
		} else {
			this.fetchRelatedWorkspaces();
		}
	}

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	fetchRelatedWorkspaces = () => {
		const { user } = this.props;

		window
			.fetch(
				`https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/fetchWorkspaces?userId=${user._id}`,
				{
					method: "GET",
					mode: "cors",
					signal: this.fetchAbortController.signal
				}
			)
			.then(this.handleFetchErrors)
			.then(response => response.json())
			.then(data => {
				this.setState({
					loading: false,
					requiredTransferWorkspaces: data.requiredTransferWorkspaces,
					deleteWorkspaces: data.deleteWorkspaces
				});
			})
			.catch(err => {
				if (err.name === "AbortError") {
					console.info("Workspaces Fetch request was aborted.");
				}

				console.error(err.message);
			});
	};

	transferOwnershipCheck = (workspace, toUser) => {
		const { user } = this.props;
		return new Promise((resolve, reject) => {
			this.setState(
				{
					transferOwnershipStatus: {
						workspaceId: workspace.spaceId,
						fromUserId: user._id,
						toUserId: toUser._id,
						...LoadState.fetching
					}
				},
				() => {
					window
						.fetch(
							"https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/checkOwnership",
							{
								method: "POST",
								mode: "cors",
								signal: this.fetchAbortController.signal,
								headers: {
									"Content-Type": "application/json"
								},
								body: JSON.stringify({
									workspaceId: workspace.spaceId,
									fromUserId: user._id,
									toUserId: toUser._id
								})
							}
						)
						.then(this.handleFetchErrors)
						.then(response => {
							if (response.status === 200) {
								this.setState(
									{
										transferOwnershipStatus: {
											workspaceId: workspace.spaceId,
											fromUserId: user._id,
											toUserId: toUser._id,
											...LoadState.completed
										}
									},
									() =>
										resolve(
											this.state.transferOwnershipStatus
										)
								);
							}
						})
						.catch(err => {
							if (err.name === "AbortError") {
								console.info(
									"Check Ownership Fetch request was aborted."
								);
							}

							this.setState(
								{
									transferOwnershipStatus: {
										workspaceId: workspace.spaceId,
										fromUserId: user._id,
										toUserId: toUser._id,
										...LoadState.error
									}
								},
								() =>
									reject(
										"Promise rejected because fetch error"
									)
							);
							console.error("Error!", err);
						});
				}
			);
		});
	};

	terminateAccount = payload => {
		// Note that there is 30% chance of getting error from the server
		this.setState(
			{
				terminateAccountStatus: LoadState.fetching
			},
			() => {
				window
					.fetch(
						"https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/terminateAccount",
						{
							method: "POST",
							mode: "cors",
							signal: this.fetchAbortController.signal,
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify(payload)
						}
					)
					.then(this.handleFetchErrors)
					.then(response => {
						if (response.status === 200) {
							this.setState(
								state => ({
									terminateAccountStatus: LoadState.handleLoaded(
										state.terminateAccountStatus
									)
								}),
								() => {
									this.redirectToHomepage();
								}
							);
						}
					})
					.catch(err => {
						if (err.name === "AbortError") {
							this.setState({
								terminateAccountStatus: LoadState.initWithError(
									"Terminate Account Fetch request was aborted."
								)
							});
						}

						this.setState({
							terminateAccountStatus: LoadState.initWithError(
								"Error deleting account"
							)
						});
					});
			}
		);
	};

	resetTerminateAccountStatus = () => {
		this.setState({
			terminateAccountStatus: LoadState.pending
		});
	};

	redirectToHomepage = () => {
		window.location = "http://www.example.com/";
	};

	assignToUser = assignObject => {
		const { transferData } = this.state;

		const assigns = transferData.filter(assign => {
			return assign.workspaceId !== assignObject.workspaceId;
		});

		this.setState({
			transferData: [...assigns, assignObject]
		});
	};

	isChecked = itemStack => {
		return this.state.feedbackData.answers.some(el => el.key === itemStack);
	};

	onChangeFeedbackCheckbox = event => {
		const target = event.target;
		const name = target.name;

		this.setState(state => {
			if (this.isChecked(name)) {
				//remove item
				return {
					feedbackData: {
						...state.feedbackData,
						answers: state.feedbackData.answers.filter(
							item => item.key !== name
						)
					}
				};
			}
			return {
				feedbackData: {
					...state.feedbackData,
					answers: [
						...state.feedbackData.answers,
						{
							key: name,
							value: ""
						}
					]
				}
			};
		});
	};

	onChangeFeedbackText = event => {
		const target = event.target;
		const value = target.value;
		const name = target.name;

		this.setState(state => {
			return {
				feedbackData: {
					...state.feedbackData,
					answers: [
						...state.feedbackData.answers.filter(
							item => item.key !== name
						),
						{
							key: name,
							value: value
						}
					]
				}
			};
		});
	};

	onChangeComment = e => {
		const { value } = e.target;
		this.setState(state => {
			return {
				feedbackData: {
					...state.feedbackData,
					comment: value
				}
			};
		});
	};

	setNextView = () => {
		const { activeModal } = this.state;

		if (activeModal === VIEWS.TRANSFER) {
			this.setState({ activeModal: VIEWS.FEEDBACK });
		} else if (activeModal === VIEWS.FEEDBACK) {
			this.setState({
				activeModal: VIEWS.CONFIRM
			});
		}
	};

	setPreviousView = () => {
		const { activeModal } = this.state;

		if (activeModal === VIEWS.FEEDBACK) {
			this.setState({ activeModal: VIEWS.TRANSFER });
		}
		if (activeModal === VIEWS.CONFIRM) {
			this.setState({ activeModal: VIEWS.FEEDBACK });
		}
	};

	onDeleteAccount = async () => {
		const { transferData } = this.state;

		//this.state.transferData should already have everything as we do the check earlier. Double check?
		const payload = {
			transferTargets: transferData.map(assign => ({
				userId: assign.toUserId,
				spaceId: assign.workspaceId
			}))
			// reason: this.state.feedbacks // do we need this? it's not specified in the server files and we already sent it off to SM
		};

		this.terminateAccount(payload);
	};

	render() {
		const {
			loading,
			deleteWorkspaces,
			requiredTransferWorkspaces,
			activeModal,
			feedbackData,
			comment,
			terminateAccountStatus,
			transferData
		} = this.state;
		const { user } = this.props;

		switch (activeModal) {
			case VIEWS.TRANSFER:
				return (
					<TransferOwnerView
						transferData={transferData}
						user={user}
						onClickNext={this.setNextView}
						loading={loading}
						requiredTransferWorkspaces={requiredTransferWorkspaces}
						deleteWorkspaces={deleteWorkspaces}
						assignToUser={this.assignToUser}
						transferOwnershipCheck={this.transferOwnershipCheck}
					/>
				);
			case VIEWS.FEEDBACK:
				return (
					<FeedbackView
						title="Why would you leave us?"
						feedbackData={feedbackData}
						onClickNext={this.setNextView}
						onClickBack={this.setPreviousView}
						showCommentForm
						comment={comment}
						onChangeComment={this.onChangeComment}
						onChangeFeedbackText={this.onChangeFeedbackText}
						onChangeFeedbackCheckbox={this.onChangeFeedbackCheckbox}
						isChecked={this.isChecked}
					/>
				);
			case VIEWS.CONFIRM:
				return (
					<ConfirmView
						onClickToDelete={this.onDeleteAccount}
						onClickBack={this.setPreviousView}
						email={user.email}
						terminateAccountStatus={terminateAccountStatus}
						resetTerminateAccountStatus={
							this.resetTerminateAccountStatus
						}
					/>
				);
			default:
				return null;
		}
	}
}
