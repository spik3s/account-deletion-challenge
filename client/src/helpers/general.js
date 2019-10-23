export const isEmpty = array => !Array.isArray(array) || !array.length;

export const containsItemWithEqualProp = (array, item, propName) =>
	array.some(element => element[propName] === item[propName]);

export const addOrUpdate = (currentTransferData, newTransferDetails) => {
	if (
		isEmpty(currentTransferData) ||
		!containsItemWithEqualProp(
			currentTransferData,
			newTransferDetails,
			"workspaceId"
		)
	) {
		return [...currentTransferData, newTransferDetails];
	}

	return currentTransferData.reduce((newList, existingItem) => {
		// if object with workspaceId of new object already exists, replace it with new object
		if (existingItem.workspaceId === newTransferDetails.workspaceId) {
			newList.push(newTransferDetails);
			return newList;
		}
		// keep the existing objects that represent other workspaces
		newList.push(existingItem);

		return newList;
	}, []);
};
export const redirectTo = target => {
	window.location = target;
};

export const redirectOnComplete = () => {
	redirectTo("http://www.example.com/");
};
