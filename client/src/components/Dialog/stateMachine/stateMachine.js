const stateMachine = {
	default: {
		LOAD_WORKSPACES: "workspacesLoading"
	},
	workspacesLoading: {
		WORKSPACES_LOADED: "workspacesLoaded",
		WORKSPACES_ERRORED: "workspacesErrored"
	},
	workspacesLoaded: {
		CHECKING_OWNERSHIP: "workspacesLoaded",
		OWNERSHIP_APPROVED: "workspacesLoaded",
		OWNERSHIP_ERRORED: "workspacesLoaded",
		ASSIGN_WORKSPACE: "workspacesLoaded",
		WORKSPACES_ASSIGNED: "workspacesAssigned"
	},
	workspacesErrored: {},
	workspacesAssigned: {
		TOGGLE_ANSWER_BOX: "workspacesAssigned",
		ANSWER_OTHER: "workspacesAssigned",
		GIVE_COMMENT: "workspacesAssigned",
		FEEDBACK_COMPLETED: "feedbackGiven",
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
		SUBMIT_DELETE: "deletionSubmitted"
	},
	accountDeleted: {
		REDIRECT: "default"
	}
};

export const initialDialogState = "default";
export default stateMachine;
