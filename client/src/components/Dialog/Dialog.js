import React from "react";

import ConfirmView from "./ConfirmView/";
import { DialogContext } from "./context";
import FeedbackView from "./FeedbackView";
import TransferOwnerView from "./TransferOwnerView";

import stateMachine, { initialDialogState } from "./stateMachine";
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
		feedbackData: {
			answers: [],
			comment: ""
		},
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

	onStateTransition = (nextDialogState, action) => {
		switch (nextDialogState) {
			case "workspacesLoading":
				return {
					error: ""
				};
			case "workspacesLoaded":
				if (action.type === "WORKSPACES_LOADED")
					return {
						deleteWorkspaces: action.deleteWorkspaces,
						error: "",
						requiredTransferWorkspaces:
							action.requiredTransferWorkspaces
					};
				return {};
			case "workspacesErrored":
				return {
					error: action.error
				};
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
		const nextDialogState =
			stateMachine[this.state.dialogState][action.type];
		if (!nextDialogState) return;

		this.setState({
			dialogState: nextDialogState,
			...this.onStateTransition(nextDialogState, action)
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
