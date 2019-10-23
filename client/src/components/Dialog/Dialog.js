import React from "react";

import ConfirmView from "./ConfirmView/";
import { DialogContext } from "./context";
import FeedbackView from "./FeedbackView";
import TransferOwnerView from "./TransferOwnerView";

import stateMachine, { initialDialogState, onStateTransition } from "./stateMachine";
import { get } from "#src/helpers/fetch";
import { getWorkspacesApiURL, handleApiErrors } from "#src/helpers/api";
import { redirectOnComplete } from "#src/helpers/general";
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

	transition = action => {
		const { dialogState } = this.state;
		const nextDialogState = stateMachine[dialogState][action.type];
		if (!nextDialogState) return;

		this.setState({
			dialogState: nextDialogState,
			...onStateTransition(this.state, nextDialogState, action)
		});
	};

	render() {
		const { dialogState } = this.state;
		const { user } = this.props;

		return (
			<DialogContext.Provider
				value={{
					appState: this.state,
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
