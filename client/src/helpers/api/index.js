import * as API from "#src/constants/api";

export const getWorkspacesApiURL = userId =>
	`${API.WORKSPACES}?userId=${userId}`;

export const getTerminateAccountApiURL = userId => API.TERMINATE_ACCOUNT;

export const handleApiErrors = (error, callback) => {
	if (error.name === "AbortError") {
		console.info("Fetch request was aborted.");
	} else if (callback !== undefined) {
		callback();
	}
};
