import React from "react";

import ConfirmView from "./ConfirmView/";
import { DialogContext } from "./context";
import FeedbackView from "./FeedbackView";
import TransferOwnerView from "./TransferOwnerView";

import stateMachine, { initialDialogState } from "./stateMachine";
import { get } from "#src/helpers/fetch";
import { getWorkspacesApiURL, handleApiErrors } from "#src/helpers/api";
import { redirectOnComplete, addOrUpdate } from "#src/helpers/general";
import { isChecked } from "#src/helpers/surveyService";
import { userType } from "#src/types";

export default class Dialog extends React.Component {
	static propTypes = {
		user: userType
	};

	state = {
		dialogState: initialDialogState,
		transferData: [],
		feedbackDataAnswers: [],
		feedbackDataComment: "",
		requiredTransferWorkspaces: [],
		deleteWorkspaces: [],
		error: ""
	};

	fetchAbortController = new AbortController();

	componentDidMount() {
		if (this.props.user) {
			this.fetchWorkspaces();
		} else {
			redirectOnComplete();
		}
	}

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	fetchWorkspaces = () => {
		const { user } = this.props;

		this.transition({ type: "LOAD_WORKSPACES" });

		get(getWorkspacesApiURL(user._id), {
			signal: this.fetchAbortController.signal
		})
			.then(({ requiredTransferWorkspaces, deleteWorkspaces }) => {
				this.transition({
					deleteWorkspaces: deleteWorkspaces,
					requiredTransferWorkspaces: requiredTransferWorkspaces,
					type: "WORKSPACES_LOADED"
				});
			})
			.catch(err => {
				handleApiErrors(
					err,
					this.transition({
						error: "Error loading workspaces",
						type: "WORKSPACES_ERRORED"
					})
				);
			});
	};

	setDialogState = (obj, callback) => {
		this.setState(obj, callback);
	};

	onStateTransition = (currentState, nextDialogState, action) => {
		switch (nextDialogState) {
			case "workspacesLoading":
				return {
					error: ""
				};
			case "workspacesLoaded":
				if (action.type === "WORKSPACES_LOADED") {
					return {
						deleteWorkspaces: action.deleteWorkspaces,
						error: "",
						requiredTransferWorkspaces:
							action.requiredTransferWorkspaces
					};
				} else if (action.type === "CHECKING_OWNERSHIP") {
					return {
						error: "",
						transferData: addOrUpdate(
							currentState.transferData,
							action.transferDataItem
						)
					};
				} else if (action.type === "OWNERSHIP_APPROVED") {
					return {
						transferData: addOrUpdate(
							currentState.transferData,
							action.transferDataItem
						)
					};
				} else if (action.type === "OWNERSHIP_ERRORED") {
					return {
						error: action.error,
						transferData: currentState.transferData.filter(item => {
							return (
								item.workspaceId !==
								action.transferDataItem.workspaceId
							);
						})
					};
				}

				return {};
			case "workspacesErrored":
				return {
					error: action.error
				};
			case "workspacesAssigned":
				if (action.type === "GIVE_COMMENT") {
					return {
						error: "",
						feedbackDataComment: action.comment
					};
				} else if (action.type === "TOGGLE_ANSWER_BOX") {
					return {
						error: "",
						feedbackDataAnswers: isChecked(
							action.answer,
							currentState.feedbackDataAnswers
						)
							? currentState.feedbackDataAnswers.filter(
									({ key }) => key !== action.answer
							  )
							: [
									...currentState.feedbackDataAnswers,
									{
										key: action.answer
									}
							  ]
					};
				} else if (action.type === "ANSWER_OTHER") {
					return {
						error: "",
						feedbackDataAnswers: [
							...currentState.feedbackDataAnswers.filter(
								({ key }) => key !== action.answer
							),
							{
								key: action.answer,
								value: action.value
							}
						]
					};
				}
				return {};
			case "deletionSubmitted":
				return {
					error: ""
				};

			case "deletionErrored":
				return {
					error: action.error
				};

			default:
				return {};
		}
	};

	transition = action => {
		const {dialogState} = this.state;
		const nextDialogState =
			stateMachine[dialogState][action.type];
		if (!nextDialogState) return;

		this.setState({
			dialogState: nextDialogState,
			...this.onStateTransition(this.state,nextDialogState, action)
		});
	};

	render() {
		const { dialogState } = this.state;
		const { user } = this.props;

		return (
			<DialogContext.Provider
				value={{
					appState: this.state,
					setDialogState: this.setDialogState,
					transition: this.transition
				}}
			>
				{(dialogState === "workspacesLoading" ||
					dialogState === "workspacesLoaded" ||
					dialogState === "workspacesErrored") && (
					<TransferOwnerView user={user} />
				)}
				{dialogState === "workspacesAssigned" && (
					<FeedbackView showCommentForm />
				)}
				{(dialogState === "feedbackGiven" ||
					dialogState === "deletionSubmitted" ||
					dialogState === "deletionErrored") && (
					<ConfirmView email={user.email} />
				)}
				{dialogState === "accountDeleted" && (
					<div>
						<h1>Account Deleted!</h1>
						<p>You'll be redirected now...</p>
					</div>
				)}
			</DialogContext.Provider>
		);
	}
}
