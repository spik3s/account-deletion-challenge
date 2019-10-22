import React from "react";

import ConfirmView from "./ConfirmView/";
import { DialogContext } from "./context";
import FeedbackView from "./FeedbackView";
import TransferOwnerView from "./TransferOwnerView";

import * as API from "#src/constants/api";
import * as LoadState from "#src/services/loadState";
import * as VIEWS from "#src/constants/views";
import { get } from "#src/utils/fetch";
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
			this.fetchRelatedWorkspaces();
		} else {
			this.redirectToHomepage();
		}
	}

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	fetchRelatedWorkspaces = () => {
		const { user } = this.props;

		this.setState(
			{
				workspacesLoadStatus: LoadState.fetching
			},
			() => {
				get(`${API.WORKSPACES}?userId=${user._id}`, {
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
						if (err.name === "AbortError") {
							console.info(
								"Workspaces Fetch request was aborted."
							);
						} else {
							this.setState({
								workspacesLoadStatus: LoadState.initWithError(
									"Error! Couldn't load the workspaces."
								)
							});
						}
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