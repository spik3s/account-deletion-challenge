import _ from "lodash";
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
      _id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchange since I assume that's the format dictated by the rest of the app
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    
		// loading: PropTypes.bool,
		// requiredTransferWorkspaces: PropTypes.array,
		// deleteWorkspaces: PropTypes.array,
		// fetchRelatedWorkspaces: PropTypes.func,
		// transferOwnershipStatus: PropTypes.object,
		// transferOwnership: PropTypes.func,
		// terminateAccount: PropTypes.func,
		// terminateAccountError: PropTypes.func,
		// terminateAccountStatus: PropTypes.object,
		// resetTerminateAccountStatus: PropTypes.func,
		// redirectToHomepage: PropTypes.func
	};

	state = {
		activeModal: "transfer",
		transferData: [],
		feedbacks: [],
		comment: "",
    email: "",
    /* State moved from MockDataProvider */
		loading: true,
		requiredTransferWorkspaces: [],
		deleteWorkspaces: [],
		transferOwnershipStatus: {
			workspaceId: null,
			toUserId: null,
			...LoadState.pending
		},
    terminateAccountStatus: {}
     /* END State moved from MockDataProvider */
	};

	componentDidMount() {
		if (LoadState.isLoaded(this.state.terminateAccountStatus)) {
			this.redirectToHomepage();
		} else {
			this.fetchRelatedWorkspaces();
		}
	}

	/* METHODS MOVED FROM MockDataProvider */

	fetchRelatedWorkspaces = async () => {
		const response = await window.fetch(
			`https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/fetchWorkspaces?userId=${this.props.user._id}`,
			{
				mode: "cors"
			}
		);
		const data = await response.json();
		this.setState({
			loading: false,
			requiredTransferWorkspaces: data.requiredTransferWorkspaces,
			deleteWorkspaces: data.deleteWorkspaces
		});
	};

	// TODO: I think we should rename this function... we don't transfer here anything, we just check if it's possible
	transferOwnership = (user, workspace) => {
		this.setState(
			{
				transferOwnershipStatus: {
					workspaceId: workspace.spaceId,
					toUserId: this.state.user._id,
					...LoadState.loading
				}
			},
			async () => {
				const response = await window.fetch(
					"https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/checkOwnership",
					{
						method: "POST",
						mode: "cors",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({
							workspaceId: workspace.spaceId,
							fromUserId: this.state.user._id,
							toUserId: user._id
						})
					}
				);
				if (response.status === 200) {
					this.setState({
						transferOwnershipStatus: {
							workspaceId: workspace.spaceId,
							toUserId: user._id,
							...LoadState.completed
						}
					});
				} else {
					this.setState({
						transferOwnershipStatus: {
							workspaceId: workspace.spaceId,
							toUserId: user._id,
							...LoadState.error
						}
					});
				}
			}
		);
	};

	terminateAccount = async payload => {
		// Note that there is 30% chance of getting error from the server
		const response = await window.fetch(
			"https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/terminateAccount",
			{
				method: "POST",
				mode: "cors",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			}
		);
		if (response.status === 200) {
			this.setState({
				terminateAccountStatus: LoadState.handleLoaded(
					this.state.terminateAccountStatus
				)
			});
		} else {
			this.setState({
				terminateAccountStatus: LoadState.handleLoadFailedWithError(
					"Error deleting account"
				)(this.state.terminateAccountStatus)
			});
		}
	};

	terminateAccountError = error => {
		this.setState({
			terminateAccountStatus: LoadState.handleLoadFailedWithError(error)(
				this.state.terminateAccountStatus
			)
		});
	};

	resetTerminateAccountStatus = () => {
		this.setState({
			terminateAccountStatus: LoadState.pending
		});
	};

	redirectToHomepage = () => {
		window.location = "http://www.example.com/";
  };
  
	/* END METHODS MOVED FROM MockDataProvider */

	getTransferData = () => {
		const {
			workspaceId,
			toUserId,
			status
		} = this.state.transferOwnershipStatus;
		const transferData = this.state.transferData;
		const updateData = _.reduce(
			transferData,
			(result, assign) => {
				if (
					assign.workspaceId === workspaceId &&
					assign.toUser._id === toUserId
				) {
					result.push(Object.assign({}, assign, { status }));
				} else {
					result.push(assign);
				}
				return result;
			},
			[]
		);
		return updateData;
	};

	assignToUser = (workspace, user) => {
		const assigns = _.reject(
			this.getTransferData(),
			assign => assign.workspaceId === workspace.spaceId
		);
		this.setState({
			transferData: [
				...assigns,
				{
					workspaceId: workspace.spaceId,
					toUser: user,
					...LoadState.pending
				}
			]
		});
	};

	getRefsValues(refs, refName) {
		const item = _.get(refs, refName, false);
		if (!item || _.isEmpty(item.refs)) return {};

		const keys = Object.keys(item.refs);
		const collection = [];
		for (const key of keys) {
			const value = item.refs[key].value;
			collection.push({ key, value });
		}
		return collection;
	}

	submitSurvey = () => {
		const feedbackRefs = this.getRefsValues(this.refs, "feedbackForm");
		const surveyPayload = {
			feedbackRefs,
			comment: ""
		};
		submitToSurveyMonkeyDeleteAccount(surveyPayload);
	};

	onSetNextPage = () => {
		if (this.state.activeModal === "transfer") {
			this.setState({ activeModal: "feedback" });
		} else if (this.state.activeModal === "feedback") {
			const feedbackRefs = this.getRefsValues(this.refs, "feedbackForm");
			// TODO: First submit the survey, if no errors, then proceed. Currently, we will be swallowing errors
			this.setState({
				activeModal: "confirm",
				feedbacks: _.map(feedbackRefs, ref => ({
					reason: ref.key,
					comment: ref.value
				}))
			});
			this.submitSurvey();
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

	onAssignToUser = (workspace, user) => {
		this.transferOwnership(user, workspace);
		this.assignToUser(workspace, user);
	};

	onChangeComment = e => {
		this.setState({ comment: e.target.value });
	};

	onDeleteAccount = async () => {
		if (this.props.user.email === this.state.email) {
			const payload = {
				transferTargets: _.map(this.getTransferData(), assign => ({
					userId: assign.toUser._id,
					spaceId: assign.workspaceId
				})),
				reason: this.state.feedbacks
			};
			this.terminateAccount(payload);
		} else {
			const error = "Invalid email";
			this.terminateAccountError(error);
		}
	};

	onTypeEmail = e => {
		this.setState({ email: e.target.value });
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
						ref="feedbackForm"
						title="Why would you leave us?"
						onSubmit={this.onSetNextPage}
						onBackButton={this.onGoToPreviousStep}
						showCommentForm
						comment={this.state.comment}
						onChangeComment={this.onChangeComment}
					/>
				);
			case "confirm":
				return (
					<ConfirmEmailModal
						onClickToDelete={this.onDeleteAccount}
						onBackButton={this.onGoToPreviousStep}
						email={this.state.email}
						onTypeEmail={this.onTypeEmail}
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
