import PropTypes from "prop-types";
import React from "react";

import * as LoadState from "../../services/LoadState";
import { fetchAbortController, post } from "../../utils/fetch";
import * as API from "../../constants/api";

const INITIAL_STATE = {
	confirmationCheckbox: false,
	confirmationEmail: "",
	terminateAccountStatus: LoadState.pending
};
class ConfirmView extends React.PureComponent {
	static propTypes = {
		transferData: PropTypes.array,
		onClickBack: PropTypes.func,
		redirectToHomepage: PropTypes.func,
		email: PropTypes.string
	};

	state = {
		...INITIAL_STATE
	};

	componentWillUnmount() {
		fetchAbortController.abort();
	}

	onClickToDelete = async () => {
		const { transferData } = this.props;

		const payload = {
			transferTargets: transferData.map(assign => ({
				userId: assign.toUserId,
				spaceId: assign.workspaceId
			}))
			// reason: this.state.feedbacks // do we need this? it's not specified in the server files and we already sent it off to SM
		};

		this.terminateAccount(payload);
	};

	terminateAccount = payload => {
		// Note that there is 30% chance of getting error from the server

		this.setState(
			{
				terminateAccountStatus: LoadState.fetching
			},
			() => {
				post(API.TERMINATE_ACCOUNT, payload)
					.then(response => {
						if (response.status === 200) {
							this.setState(
								state => ({
									...INITIAL_STATE
								}),
								() => {
									this.props.redirectToHomepage();
								}
							);
						}
					})
					.catch(err => {
						this.setState({
							...INITIAL_STATE,
							terminateAccountStatus: LoadState.initWithError(
								err.name === "AbortError"
									? "Terminate Account Fetch request was aborted."
									: "Error deleting account"
							)
						});
					});
			}
		);
	};

	isDisabled = () => {
		const { confirmationCheckbox, terminateAccountStatus } = this.state;

		if (LoadState.isLoading(terminateAccountStatus)) return true;
		if (confirmationCheckbox && this.isEmailValid()) return false;
		return true;
	};

	toggleConfirmationCheckbox = () => {
		this.setState(state => ({
			confirmationCheckbox: !state.confirmationCheckbox
		}));
	};

	onTypeEmail = e => {
		this.setState({ confirmationEmail: e.target.value });
	};

	isEmailValid = () => {
		return this.props.email === this.state.confirmationEmail;
	};

	renderEmailInput = () => {
		const { confirmationEmail } = this.state;
		const { email } = this.props;
		return (
			<div>
				<input
					type="text"
					placeholder={email}
					name="confirmationEmail"
					value={confirmationEmail}
					style={{ width: "350px" }}
					onChange={this.onTypeEmail}
				/>
				<span style={{ color: "red", display: "block" }}>
					{confirmationEmail
						? !this.isEmailValid() && "Invalid email"
						: null}
				</span>
			</div>
		);
	};

	render() {
		const { onClickBack } = this.props;
		const { confirmationCheckbox, terminateAccountStatus } = this.state;
		return (
			<div>
				<h1>Delete account</h1>
				<p>This action cannot be undone.</p>
				<div>Please enter your email: {this.renderEmailInput()}</div>
				<div style={{ marginTop: "1rem" }}>
					<label>
						<input
							type="checkbox"
							name="confirmationCheckbox"
							checked={confirmationCheckbox}
							onChange={this.toggleConfirmationCheckbox}
						/>
						I understand the consequences.
					</label>
				</div>
				{terminateAccountStatus.error && (
					<div style={{ marginTop: "1rem" }}>
						<span
							style={{
								marginLeft: "1rem",
								color: "#ff4500"
							}}
						>
							{terminateAccountStatus.error}
						</span>
					</div>
				)}
				<div>
					<button onClick={onClickBack}>Back</button>
					<button
						onClick={this.onClickToDelete}
						disabled={this.isDisabled()}
					>
						Delete my account
					</button>
				</div>
			</div>
		);
	}
}

export default ConfirmView;
