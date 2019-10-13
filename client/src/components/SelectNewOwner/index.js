import PropTypes from "prop-types";
import React from "react";

import * as LoadState from "../../LoadState";
import * as LOAD_STATE from "../../constants/loadStatus";

export default class SelectNewOwner extends React.Component {
	static propTypes = {
		user: PropTypes.exact({
			_id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
			name: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired
		}).isRequired,
		transferData: PropTypes.array,
		workspace: PropTypes.object,
		onOwnerSelect: PropTypes.func
	};

	getAddedMember() {
		const { workspace, transferData } = this.props;

		const filterMembers = transferData
			.filter(el => !LoadState.isError(el) && !LoadState.isLoading(el))
			.find(assign => assign.workspaceId === workspace.spaceId);

		return filterMembers ? filterMembers.toUserId : "";
	}

	handleOwnerSelect = e => {
		const { onOwnerSelect, workspace } = this.props;
		const user = workspace.transferableMembers.find(
			user => user._id === e.target.value
		);
		onOwnerSelect(workspace, user);
	};

	renderStatus = (currentStatus) => {
		switch (currentStatus.status) {
			case LOAD_STATE.FETCHING:
				return (
					<span
						style={{
							marginLeft: "1rem"
						}}
					>
						checking...
					</span>
				);
			case LOAD_STATE.COMPLETED:
				return (
					<span
						style={{
							marginLeft: "1rem"
						}}
					>
						OK!
					</span>
				);
			case LOAD_STATE.ERROR:
				return (
					<span
						style={{
							marginLeft: "1rem",
							color: "#ff4500"
						}}
					>
						{currentStatus.error}
					</span>
				);
			default:
				return null;
		}
	};

	render() {
		const { workspace, transferData } = this.props;
		const currentStatus = transferData.find(
			status => status.workspaceId === workspace.spaceId
		);
		return (
			<div style={{ cursor: "pointer" }}>
				<select
					value={this.getAddedMember()}
					onChange={this.handleOwnerSelect}
					style={{ minWidth: "3rem" }}
				>
					<option value="" disabled>
						Select user
					</option>
					{workspace.transferableMembers.map(user => (
						<option key={user._id} value={user._id}>
							{user.name}
						</option>
					))}
				</select>

				{currentStatus && this.renderStatus(currentStatus)}
			</div>
		);
	}
}
