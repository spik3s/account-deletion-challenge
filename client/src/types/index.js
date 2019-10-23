import { array, string, bool, exact, arrayOf, shape } from "prop-types";

export const appStateType = exact({
	feedbackData: exact({
		answers: array,
		comment: string
	}),
	dialogState: string,
	transferData: arrayOf(
		shape({
			fromUserId: string.isRequired,
			toUserId: string.isRequired,
			workspaceId: string.isRequired,
			approved: bool.isRequired
		})
	),
	error: string,
	requiredTransferWorkspaces: array,
	deleteWorkspaces: array
}).isRequired;

export const userType = exact({
	_id: string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
	name: string.isRequired,
	email: string.isRequired
}).isRequired;
