const stateMachine = {
	default: {
		LOAD_WORKSPACES: "workspacesLoading"
	},
	workspacesLoading: {
		WORKSPACES_LOADED: "workspacesLoaded",
		WORKSPACES_ERRORED: "workspacesErrored"
	},
	workspacesLoaded: {
		ASSIGN_WORKSPACES: "workspacesAssigned"
	},
	workspacesErrored: {
		RELOAD_WORKSPACES: "workspacesLoading"
	},
	workspacesAssigned: {
		GIVE_FEEDBACK: "feedbackGiven",
		BACK_TO_WORKSPACES: "workspacesLoaded"
	},
	feedbackGiven: {
		SUBMIT_DELETE: "deletionSubmitted",
		BACK_TO_FEEDBACK: "workspacesAssigned"
	},
	deletionSubmitted: {
		ACCOUNT_DELETED: "accountDeleted",
		DELETION_ERRORED: "deletionErrored"
	},
	deletionErrored: {
		SUBMIT_DELETE: "deletionSubmitted",
	},
	accountDeleted: {
		REDIRECT: "default"
	}
};

export const initialDialogState = "default";
export default stateMachine;
