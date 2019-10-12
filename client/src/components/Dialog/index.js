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
		deleteWorkspaces: []
	};

	fetchAbortController = new AbortController();

	handleFetchErrors = response => {
		if (!response.ok) throw Error(response.status);
		return response;
	};

	componentDidMount() {
		if (this.props.user) {
			this.fetchRelatedWorkspaces();
		} else {
			this.redirectToHomepage();
		}
	}

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	// METHODS FOR NAVIGATION
	redirectToHomepage = () => {
		window.location = "http://www.example.com/";
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

	// METHODS FOR WORKSPACES
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

	transferStatusUpdate = (currentState, transferStatus) => {
		const { transferData } = currentState;
		if (
			!transferData.length ||
			!transferData.some(
				existingItem =>
					existingItem.workspaceId === transferStatus.workspaceId
			)
		) {
			return [...transferData, transferStatus];
		}

		return transferData.reduce((result, existingItem) => {
			if (existingItem.workspaceId === transferStatus.workspaceId) {
				result.push(transferStatus);
				return result;
			}
			result.push(existingItem);

			return result;
		}, []);
	};

	transferOwnershipCheck = (workspace, toUser) => {
		const { user } = this.props;
		const ownershipToCheck = {
			workspaceId: workspace.spaceId,
			fromUserId: user._id,
			toUserId: toUser._id
		};
		this.setState(
			state => ({
				transferData: this.transferStatusUpdate(state, {
					...ownershipToCheck,
					...LoadState.fetching
				})
			}),
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
							body: JSON.stringify(ownershipToCheck)
						}
					)
					.then(this.handleFetchErrors)
					.then(response => {
						if (response.status === 200) {
							this.setState(state => ({
								transferData: this.transferStatusUpdate(state, {
									...ownershipToCheck,
									...LoadState.completed
								})
							}));
						}
					})
					.catch(err => {
						if (err.name === "AbortError") {
							console.info(
								"Check Ownership Fetch request was aborted."
							);
						}

						this.setState(state => ({
							transferData: this.transferStatusUpdate(state, {
								...LoadState.initWithError(
									"Error while checking for the ownership suitability"
								),
								...ownershipToCheck
							})
						}));
					});
			}
		);
	};

	// METHODS FOR FEEDBACK SURVEY
	isChecked = itemStack => {
		return this.state.feedbackData.answers.some(el => el.key === itemStack);
	};

	onChangeFeedback = event => {
		const { type, name, value } = event.target;
		const isCheckbox = type === "checkbox";
		this.setState(state => {
			if (name === "comment") {
				return {
					feedbackData: {
						...state.feedbackData,
						comment: value
					}
				};
			}

			return {
				feedbackData: {
					...state.feedbackData,
					answers:
						isCheckbox && this.isChecked(name) // if true, means checkbox is checked, uncheck (remove)
							? state.feedbackData.answers.filter(
									item => item.key !== name
							  )
							: [
									...state.feedbackData.answers.filter(
										item => item.key !== name
									),
									{
										key: name,
										value: isCheckbox ? "" : value
									}
							  ]
				}
			};
		});
	};

	render() {
		const {
			loading,
			deleteWorkspaces,
			requiredTransferWorkspaces,
			activeModal,
			feedbackData,
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
						onOwnerSelect={this.transferOwnershipCheck}
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
						onChangeFeedback={this.onChangeFeedback}
						isChecked={this.isChecked}
					/>
				);
			case VIEWS.CONFIRM:
				return (
					<ConfirmView
						onClickBack={this.setPreviousView}
						email={user.email}
						transferData={transferData}
					/>
				);
			default:
				return null;
		}
	}
}
