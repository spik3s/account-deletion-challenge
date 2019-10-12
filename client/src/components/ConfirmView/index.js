import PropTypes from "prop-types";
import React from "react";

import { isLoading } from "../../LoadState";

class ConfirmView extends React.PureComponent {
	static propTypes = {
		onClickToDelete: PropTypes.func,
		onBackButton: PropTypes.func,
		email: PropTypes.string,
		onTypeEmail: PropTypes.func,
		resetTerminateAccountStatus: PropTypes.func,
		terminateAccountStatus: PropTypes.object
	};

	state = {
		markedConsequences: false,
		typedEmail: ""
	};

	componentWillUnmount() {
		this.props.resetTerminateAccountStatus();
	}

	getStateButton = () => {
		const { terminateAccountStatus } = this.props;
		const { markedConsequences } = this.state;

		if (isLoading(terminateAccountStatus)) return true;
		if (markedConsequences && this.isEmailValid()) return false;
		return true;
	};

	onToggleMarkedConsequences = () => {
		this.setState(state => ({
			markedConsequences: !state.markedConsequences
		}));
	};

	onTypeEmail = e => {
		this.setState({ typedEmail: e.target.value });
	};

	isEmailValid = () => {
		return this.props.email === this.state.typedEmail;
	};

	renderEmailInput = () => {
		const { typedEmail } = this.state;
		return (
			<div>
				<input
					type="text"
					placeholder="ross@example.com"
					value={typedEmail}
					style={{ width: "350px" }}
					onChange={this.onTypeEmail}
				/>
				<span style={{ color: "red", display: "block" }}>
					{typedEmail
						? !this.isEmailValid() && "Invalid email"
						: null}
				</span>
			</div>
		);
	};

	render() {
		const { onBackButton, onClickToDelete } = this.props;
		const { markedConsequences } = this.state;
		return (
			<div>
				<h1>Delete account</h1>
				<p>This action cannot be undone.</p>
				<div>Please enter your email: {this.renderEmailInput()}</div>
				<div style={{ marginTop: "1rem" }}>
					<label>
						<input
							type="checkbox"
							checked={markedConsequences}
							onChange={this.onToggleMarkedConsequences}
						/>
						I understand the consequences.
					</label>
				</div>
				<div>
					<button onClick={onBackButton}>Back</button>
					<button
						onClick={onClickToDelete}
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
