export const handleFetchErrors = response => {
    if (!response.ok) throw Error(response.status);
    return response;
};

export const fetchAbortController = new AbortController();