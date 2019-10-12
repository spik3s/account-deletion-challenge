import * as LOAD_STATE from "./constants/loadStatus"

export const pending = { status: LOAD_STATE.PENDING }
export const fetching = { status: LOAD_STATE.FETCHING }
export const completed = { status: LOAD_STATE.COMPLETED }
const outdated = { status: LOAD_STATE.OUTDATED }
const refreshing = { status: LOAD_STATE.REFRESHING }
export const error = { status: LOAD_STATE.ERROR }
export const initWithError = error => ({ status: LOAD_STATE.ERROR, error })

export const isError = state => state.status === LOAD_STATE.ERROR
export const shouldLoad = state =>
  state.status === LOAD_STATE.PENDING || state.status === LOAD_STATE.OUTDATED
export const isLoading = state =>
  // state.status === LOAD_STATE.PENDING ||
  state.status === LOAD_STATE.FETCHING ||
  state.status === LOAD_STATE.REFRESHING
export const isLoadingFirstTime = state => state.status === LOAD_STATE.FETCHING
export const isRefreshing = state => state.status === LOAD_STATE.REFRESHING
export const isLoaded = state =>
  state.status === LOAD_STATE.COMPLETED || state.status === LOAD_STATE.REFRESHING

export const handleLoaded = state => completed
export const handleOutdated = state => outdated
export const handleLoadRequested = state => {
  return state.status === LOAD_STATE.OUTDATED ? refreshing : fetching
}
export const handleLoadFailedWithError = error => {
  const nextState = initWithError(error)
  return state => nextState
}
