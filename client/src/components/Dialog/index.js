import PropTypes from "prop-types";
import React from "react";

import ConfirmView from "../ConfirmView";
import TransferOwnerView from "../TransferOwnerView";
import FeedbackView from "../FeedbackView";
import * as LoadState from "../../services/LoadState";

import { get } from "../../utils/fetch";
import * as VIEWS from "../../constants/views";
import * as API from "../../constants/api";
import { AppContext } from "../../AppContext";

export default class Dialog extends React.Component {
	static propTypes = {
		user: PropTypes.exact({
			_id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
			name: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired
		}).isRequired
	};

	state = {
		activeModal: VIEWS.TRANSFER,
		transferData: [],
		feedbackData: {
			answers: [],
			comment: ""
		},
		loading: true,
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

		get(`${API.WORKSPACES}?userId=${user._id}`, {
			signal: this.fetchAbortController.signal
		})
			.then(({ requiredTransferWorkspaces, deleteWorkspaces }) => {
				this.setState({
					loading: false,
					requiredTransferWorkspaces: requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspaces
				});
			})
			.catch(err => {
				if (err.name === "AbortError") {
					console.info("Workspaces Fetch request was aborted.");
				}

				console.error(err.message);
			});
	};

	redirectToHomepage = () => {
		window.location = "http://www.example.com/";
	};

	setNextView = () => {
		const { activeModal } = this.state;

		if (activeModal === VIEWS.TRANSFER) {
			this.setState({ activeModal: VIEWS.FEEDBACK });
		} else if (activeModal === VIEWS.FEEDBACK) {
			this.setState({
				activeModal: VIEWS.CONFIRM
			});
		}
	};

	setPreviousView = () => {
		const { activeModal } = this.state;

		if (activeModal === VIEWS.FEEDBACK) {
			this.setState({ activeModal: VIEWS.TRANSFER });
		}
		if (activeModal === VIEWS.CONFIRM) {
			this.setState({ activeModal: VIEWS.FEEDBACK });
		}
	};

	setAppState = (obj, callback) => {
		this.setState(obj, callback)
	}

	render() {
		const { activeModal } = this.state;
		const { user } = this.props;

		return (
			<AppContext.Provider
				value={{
					appState: this.state,
					setAppState: this.setAppState
				}}
			>
				{activeModal === VIEWS.TRANSFER && (
					<TransferOwnerView
						user={user}
						onClickNext={this.setNextView}
					/>
				)}
				{activeModal === VIEWS.FEEDBACK && (
					<FeedbackView
						title="Why would you leave us?"
						onClickNext={this.setNextView}
						onClickBack={this.setPreviousView}
						showCommentForm
					/>
				)}
				{activeModal === VIEWS.CONFIRM && (
					<ConfirmView
						onClickBack={this.setPreviousView}
						email={user.email}
						redirectToHomepage={this.redirectToHomepage}
					/>
				)}
			</AppContext.Provider>
		);
	}
}
