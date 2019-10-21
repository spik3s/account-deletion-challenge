import { array, string, bool, exact, arrayOf, shape } from "prop-types";

export const appStateType = exact({
	feedbackData: exact({
		answers: array,
		comment: string
	}),
	activeModal: string,
	transferData: arrayOf(
		shape({
			fromUserId: string.isRequired,
			status: string.isRequired,
			toUserId: string.isRequired,
			workspaceId: string.isRequired,
			error: string
		})
	).isRequired,
	loading: bool.isRequired,
	requiredTransferWorkspaces: array.isRequired,
	deleteWorkspaces: array.isRequired
}).isRequired;

export const userType = exact({
	_id: string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
	name: string.isRequired,
	email: string.isRequired
}).isRequired;
