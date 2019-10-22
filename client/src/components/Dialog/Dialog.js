import React from "react";

import ConfirmView from "./ConfirmView/";
import { DialogContext } from "./context";
import FeedbackView from "./FeedbackView";
import TransferOwnerView from "./TransferOwnerView";

import * as VIEWS from "#src/constants/views";
import * as LoadState from "#src/helpers/loadState";
import { get } from "#src/helpers/fetch";
import { getWorkspacesApiURL, handleApiErrors } from "#src/helpers/api";
import { userType } from "#src/types";

export default class Dialog extends React.Component {
	static propTypes = {
		user: userType
	};

	state = {
		activeView: VIEWS.TRANSFER,
		transferData: [],
		feedbackData: {
			answers: [],
			comment: ""
		},
		workspacesLoadStatus: LoadState.pending,
		requiredTransferWorkspaces: [],
		deleteWorkspaces: []
	};

	fetchAbortController = new AbortController();

	componentDidMount() {
		if (this.props.user) {
			this.fetchWorkspaces();
		} else {
			this.redirectToHomepage();
		}
	}

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	fetchWorkspaces = () => {
		const { user } = this.props;

		this.setState(
			{
				workspacesLoadStatus: LoadState.fetching
			},
			() => {
				get(getWorkspacesApiURL(user._id), {
					signal: this.fetchAbortController.signal
				})
					.then(
						({ requiredTransferWorkspaces, deleteWorkspaces }) => {
							this.setState({
								workspacesLoadStatus: LoadState.completed,
								requiredTransferWorkspaces: requiredTransferWorkspaces,
								deleteWorkspaces: deleteWorkspaces
							});
						}
					)
					.catch(err => {
						handleApiErrors(
							err,
							this.setState({
								workspacesLoadStatus: LoadState.initWithError(
									"Error! Couldn't load the workspaces."
								)
							})
						);
					});
			}
		);
	};

	setNextView = () => {
		const { activeView } = this.state;

		if (activeView === VIEWS.TRANSFER) {
			this.setState({ activeView: VIEWS.FEEDBACK });
		} else if (activeView === VIEWS.FEEDBACK) {
			this.setState({
				activeView: VIEWS.CONFIRM
			});
		}
	};

	setPreviousView = () => {
		const { activeView } = this.state;

		if (activeView === VIEWS.FEEDBACK) {
			this.setState({ activeView: VIEWS.TRANSFER });
		}
		if (activeView === VIEWS.CONFIRM) {
			this.setState({ activeView: VIEWS.FEEDBACK });
		}
	};

	setDialogState = (obj, callback) => {
		this.setState(obj, callback);
	};

	render() {
		const { activeView } = this.state;
		const { user } = this.props;

		return (
			<DialogContext.Provider
				value={{
					appState: this.state,
					setDialogState: this.setDialogState
				}}
			>
				{activeView === VIEWS.TRANSFER && (
					<TransferOwnerView
						user={user}
						onClickNext={this.setNextView}
					/>
				)}
				{activeView === VIEWS.FEEDBACK && (
					<FeedbackView
						onClickNext={this.setNextView}
						onClickBack={this.setPreviousView}
						showCommentForm
					/>
				)}
				{activeView === VIEWS.CONFIRM && (
					<ConfirmView
						onClickBack={this.setPreviousView}
						email={user.email}
					/>
				)}
			</DialogContext.Provider>
		);
	}
}