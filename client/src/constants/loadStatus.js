export const PENDING = 'pending' // Nothing is loaded yet.
export const FETCHING = 'fetching' // Loading the first time or after error.
export const COMPLETED = 'completed' // Data loaded successfully.
export const OUTDATED = 'outdated' // Data is known to be outdated.
export const REFRESHING = 'refreshing' // Data is already loaded but is refreshing.
export const ERROR = 'error' // Load error.