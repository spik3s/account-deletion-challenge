import PropTypes from "prop-types";
import React from "react";

import * as LoadState from "../../LoadState";

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
		console.log("component unmounted");
		this.setState({ ...INITIAL_STATE }, () => console.log(this.state));
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
				window
					.fetch(
						"https://us-central1-tw-account-deletion-challenge.cloudfunctions.net/terminateAccount",
						{
							method: "POST",
							mode: "cors",
							signal: this.fetchAbortController.signal,
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify(payload)
						}
					)
					.then(this.handleFetchErrors)
					.then(response => {
						if (response.status === 200) {
							this.setState(
								state => ({
									terminateAccountStatus: LoadState.handleLoaded(
										state.terminateAccountStatus
									)
								}),
								() => {
									this.props.redirectToHomepage();
								}
							);
						}
					})
					.catch(err => {
						if (err.name === "AbortError") {
							this.setState({
								terminateAccountStatus: LoadState.initWithError(
									"Terminate Account Fetch request was aborted."
								)
							});
						}

						this.setState({
							terminateAccountStatus: LoadState.initWithError(
								"Error deleting account"
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
		return (
			<div>
				<input
					type="text"
					placeholder="ross@example.com"
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
		const { confirmationCheckbox } = this.state;
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
				<div>
					<button onClick={onClickBack}>Back</button>
					<button
						onClick={this.onClickToDelete}
						disabled={this.getStateButton()}
					>
						Delete my account
					</button>
				</div>
			</div>
		);
	}
}

export default ConfirmView;
