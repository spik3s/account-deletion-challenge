import * as LOAD_STATE from "../constants/loadStatus"

export const pending = { status: LOAD_STATE.PENDING }
export const fetching = { status: LOAD_STATE.FETCHING }
export const completed = { status: LOAD_STATE.COMPLETED }
export const error = { status: LOAD_STATE.ERROR }

export const initWithError = error => ({ status: LOAD_STATE.ERROR, error })
export const isError = state => state.status === LOAD_STATE.ERROR
export const isLoading = state =>
state.status === LOAD_STATE.FETCHING