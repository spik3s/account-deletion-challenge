import { array, string, exact, arrayOf, shape } from "prop-types";

export const appStateType = exact({
	feedbackData: exact({
		answers: array,
		comment: string
	}),
	activeView: string,
	transferData: arrayOf(
		shape({
			fromUserId: string.isRequired,
			status: string.isRequired,
			toUserId: string.isRequired,
			workspaceId: string.isRequired,
			error: string
		})
	),
	workspacesLoadStatus: shape({
		status: string.isRequired,
		error: string
	}),
	requiredTransferWorkspaces: array,
	deleteWorkspaces: array
}).isRequired;

export const userType = exact({
	_id: string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
	name: string.isRequired,
	email: string.isRequired
}).isRequired;
