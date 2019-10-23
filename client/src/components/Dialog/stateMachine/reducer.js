import { addOrUpdate } from "#src/helpers/general";
import { isChecked } from "#src/helpers/surveyService";

const reducer = (currentState, nextDialogState, action) => {
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

export default reducer;
