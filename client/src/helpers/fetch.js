export const handleFetchErrors = response => {
	if (!response.ok) throw Error(response.status);
	return response;
};

export const fetchAbortController = new AbortController();

export const get = (target, props) =>
	window.fetch(target, {
		method: "GET",
		mode: "cors",
		...props
	})
		.then(handleFetchErrors)
		.then(response => response.json());

export const post = (target, payload, props) =>
	window.fetch(target, {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload),
		...props
	}).then(handleFetchErrors);