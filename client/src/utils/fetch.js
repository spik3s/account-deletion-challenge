export const handleFetchErrors = response => {
	if (!response.ok) throw Error(response.status);
	return response;
};

export const fetchAbortController = new AbortController();

export const get = target =>
	window.fetch(target, {
		method: "GET",
		mode: "cors",
		signal: fetchAbortController.signal
	})
		.then(handleFetchErrors)
		.then(response => response.json());

export const post = (target, payload) =>
	window.fetch(target, {
		method: "POST",
		mode: "cors",
		signal: fetchAbortController.signal,
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	}).then(handleFetchErrors);
