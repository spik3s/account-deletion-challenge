import PropTypes from "prop-types";
import React from "react";

import ConfirmView from "../ConfirmView";
import TransferOwnerView from "../TransferOwnerView";
import FeedbackView from "../FeedbackView";
import * as LoadState from "../../services/LoadState";
import { isChecked } from "../../services/SurveyService";

import { fetchAbortController, get, post } from "../../utils/fetch";
import * as VIEWS from "../../constants/views";
import * as API from "../../constants/api";

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

	componentDidMount() {
		if (this.props.user) {
			this.fetchRelatedWorkspaces();
		} else {
			this.redirectToHomepage();
		}
	}

	componentWillUnmount() {
		fetchAbortController.abort();
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

		get(`${API.WORKSPACES}?userId=${user._id}`)
			.then(({ requiredTransferWorkspaces, deleteWorkspaces }) => {
				this.setState({
					loading: false,
					requiredTransferWorkspaces: requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspaces
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
				({ workspaceId }) => workspaceId === transferStatus.workspaceId
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
				post(API.CHECK_OWNERSHIP, ownershipToCheck)
					.then(({status}) => {
						if (status === 200) {
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
	onChangeFeedback = event => {
		const { type, name, value } = event.target;
		const isCheckbox = type === "checkbox";
		this.setState(({ feedbackData }) => {
			if (name === "comment") {
				return {
					feedbackData: {
						...feedbackData,
						comment: value
					}
				};
			}

			return {
				feedbackData: {
					...feedbackData,
					answers:
						isCheckbox && isChecked(name, feedbackData.answers) // if true, means checkbox is checked, uncheck (remove)
							? feedbackData.answers.filter(
									({ key }) => key !== name
							  )
							: [
									...feedbackData.answers.filter(
										({ key }) => key !== name
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
					/>
				);
			case VIEWS.CONFIRM:
				return (
					<ConfirmView
						onClickBack={this.setPreviousView}
						email={user.email}
						transferData={transferData}
						redirectToHomepage={this.redirectToHomepage}
					/>
				);
			default:
				return null;
		}
	}
}
