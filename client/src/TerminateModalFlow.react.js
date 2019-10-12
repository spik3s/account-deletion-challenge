import PropTypes from "prop-types";
import React from "react";

import ConfirmEmailModal from "./ConfirmEmailModal.react";
import TransferOwnershipModal, {
	WorkspaceGroupRows
} from "./TransferOwnershipModal.react";
import FeedbackSurveyModal from "./FeedbackSurveyModal.react";
import { submitToSurveyMonkeyDeleteAccount } from "./SurveyService";
import * as LoadState from "./LoadState";
import AssignOwnership from "./AssignOwnership.react";

export default class TerminateModalFlow extends React.Component {
	static propTypes = {
		user: PropTypes.exact({
			_id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
			name: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired
		}).isRequired
	};

	state = {
		activeModal: "transfer",
		transferData: [],
		feedbackData: {
			answers: [],
			comment: ""
		},

		email: "",
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
		window
			.fetch(
				`https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/fetchWorkspaces?userId=${this.props.user._id}`,
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

	transferOwnershipCheck = (workspace, user) => {
		return new Promise((resolve, reject) => {
			this.setState(
				{
					transferOwnershipStatus: {
						workspaceId: workspace.spaceId,
						fromUserId: this.props.user._id,
						toUserId: user._id,
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
									fromUserId: this.props.user._id,
									toUserId: user._id
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
											fromUserId: this.props.user._id,
											toUserId: user._id,
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
										fromUserId: this.props.user._id,
										toUserId: user._id,
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
								{
									terminateAccountStatus: LoadState.handleLoaded(
										this.state.terminateAccountStatus
									)
								},
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


	getTransferData = () => {
		const {
			workspaceId,
			toUserId,
			status
		} = this.state.transferOwnershipStatus;
		const transferData = this.state.transferData; // this is reference, not value

		const updateData = transferData.reduce((result, assign) => {
			if (
				assign.workspaceId === workspaceId &&
				assign.toUserId === toUserId
			) {
				result.push(Object.assign({}, assign, { status }));
			} else {
				result.push(assign);
			}
			return result;
		}, []);

		return updateData;
	};

	onAssignToUser = (workspace, user) => {
		this.transferOwnershipCheck(workspace, user)
			.then(response => this.assignToUser(response))
			.catch(err =>
				console.log(
					"Promise got rejected or something bad happened:",
					err
				)
			);
	};

	assignToUser = assignObject => {
		const assigns = this.getTransferData().filter(assign => {
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
		this.setState({
			feedbackData: {
				...this.state.feedbackData,
				comment: e.target.value
			}
		});
	};

	submitSurvey = () => {
		submitToSurveyMonkeyDeleteAccount(this.state.feedbackData);
	};

	onSetNextPage = () => {
		if (this.state.activeModal === "transfer") {
			this.setState({ activeModal: "feedback" });
		} else if (this.state.activeModal === "feedback") {
			this.submitSurvey(); // TODO: Actually, this one shouldn't fire until last step? Do we need to show a confirmation or is it supposed to happen in the bg?

			// TODO: First submit the survey, if no errors, then proceed. Currently, we will be swallowing errors
			this.setState({
				activeModal: "confirm"
			});
		}
	};

	onGoToPreviousStep = () => {
		if (this.state.activeModal === "feedback") {
			this.setState({ activeModal: "transfer" });
		}
		if (this.state.activeModal === "confirm") {
			this.setState({ activeModal: "feedback" });
		}
	};

	onDeleteAccount = async () => {
		//this.state.transferData should already have everything as we do the check earlier. Double check?
		const payload = {
			transferTargets: this.state.transferData.map(assign => ({
				userId: assign.toUserId,
				spaceId: assign.workspaceId
			}))
			// reason: this.state.feedbacks // do we need this? it's not specified in the server files and we already sent it off to SM
		};

		this.terminateAccount(payload);
	};

	renderTransferModal() {
		const transferData = this.getTransferData();
		const totalAssigned = transferData.length;
		const hasErrors = transferData.some(el => el.status === "error");
		const totalWorkspaceRequiredTransfer = this.state
			.requiredTransferWorkspaces.length;
		const totalWorkspaceDelete = this.state.deleteWorkspaces.length;
		const disabledNextPage =
			totalAssigned < totalWorkspaceRequiredTransfer ||
			hasErrors ||
			this.state.loading;
		return (
			<TransferOwnershipModal
				nextPage={this.onSetNextPage}
				loading={this.state.loading}
				disabledNextPage={disabledNextPage}
			>
				<WorkspaceGroupRows
					workspaces={this.state.requiredTransferWorkspaces}
					groupTitle="The following workspaces require ownership transfer:"
					shouldDisplay={totalWorkspaceRequiredTransfer > 0}
				>
					<AssignOwnership
						user={this.props.user}
						transferData={transferData}
						onAssignToUser={this.onAssignToUser}
					/>
				</WorkspaceGroupRows>
				<WorkspaceGroupRows
					workspaces={this.state.deleteWorkspaces}
					groupTitle="The following workspaces will be deleted:"
					shouldDisplay={totalWorkspaceDelete > 0}
				/>
			</TransferOwnershipModal>
		);
	}

	render() {
		switch (this.state.activeModal) {
			case "transfer":
				return this.renderTransferModal();
			case "feedback":
				return (
					<FeedbackSurveyModal
						title="Why would you leave us?"
						feedbackData={this.state.feedbackData}
						onSubmit={this.onSetNextPage}
						onBackButton={this.onGoToPreviousStep}
						showCommentForm
						comment={this.state.comment}
						onChangeComment={this.onChangeComment}
						onChangeFeedbackText={this.onChangeFeedbackText}
						onChangeFeedbackCheckbox={this.onChangeFeedbackCheckbox}
						isChecked={this.isChecked}
					/>
				);
			case "confirm":
				return (
					<ConfirmEmailModal
						onClickToDelete={this.onDeleteAccount}
						onBackButton={this.onGoToPreviousStep}
						email={this.props.user.email}
						terminateAccountStatus={
							this.state.terminateAccountStatus
						}
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
