import { func, string } from "prop-types";
import React from "react";

import { redirectOnComplete } from "#src/helpers/general";
import * as LoadState from "#src/helpers/loadState";
import { appStateType } from "#src/types";
import { getTerminateAccountApiURL, handleApiErrors } from "#src/helpers/api";
import { post } from "#src/helpers/fetch";

import { withDialogContext } from "../context";

const INITIAL_STATE = {
	confirmationCheckbox: false,
	confirmationEmail: ""
};

export class ConfirmView extends React.PureComponent {
	static propTypes = {
		onClickBack: func,
		email: string,
		appState: appStateType
	};

	state = {
		...INITIAL_STATE
	};

	fetchAbortController = new AbortController();

	componentWillUnmount() {
		this.fetchAbortController.abort();
	}

	onClickToDelete = async () => {
		const {
			appState: { transferData }
		} = this.props;

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
		this.props.transition({ type: "SUBMIT_DELETE" });

		post(getTerminateAccountApiURL(), payload, {
			signal: this.fetchAbortController.signal
		})
			.then(response => {
				if (response.status === 200) {
					this.props.transition({ type: "ACCOUNT_DELETED" });
				}
			})
			.catch(err => {
				handleApiErrors(
					err,
					this.props.transition({
						error: "Error deleting the account",
						type: "DELETION_ERRORED"
					})
				);
			});
	};

	isDisabled = () => {
		const { confirmationCheckbox, dialogState } = this.state;

		if (dialogState === "deletionSubmitted") return true;
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

	onClickBack = () => {
		this.props.transition({ type: "BACK_TO_FEEDBACK" });
	};

	render() {
		const {
			email,
			appState: { dialogState, error }
		} = this.props;
		const {
			confirmationCheckbox,

			confirmationEmail
		} = this.state;
		return (
			<div>
				<h1>Delete account</h1>
				<p>This action cannot be undone.</p>
				<div>
					<label
						htmlFor="confirmationEmail"
						style={{ display: "block" }}
					>
						Please enter your email:
					</label>
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
				{dialogState === "deletionErrored" && (
					<div style={{ marginTop: "1rem" }}>
						<span
							style={{
								marginLeft: "1rem",
								color: "#ff4500"
							}}
						>
							{error}
						</span>
					</div>
				)}
				<div>
					<button onClick={this.onClickBack}>Back</button>
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

export default withDialogContext(ConfirmView);
