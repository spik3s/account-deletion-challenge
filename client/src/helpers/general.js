export const isEmpty = array => !Array.isArray(array) || !array.length;

export const containsItemWithEqualProp = (array, item, propName) =>
	array.some(element => element[propName] === item[propName]);

export const redirectTo = target => {
	window.location = target;
};

export const redirectOnComplete = () => {
	redirectTo("http://www.example.com/");
};
