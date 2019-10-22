import {array, object, func} from "prop-types";
import React from "react";

import * as LoadState from "#src/services/loadState";
import * as LOAD_STATE from "#src/constants/loadStatus";
import { userType } from "#src/types";

export default class SelectNewOwner extends React.Component {
	static propTypes = {
		user: userType,
		transferData: array,
		workspace: object,
		onOwnerSelect: func
	};

	getAssignedUser() {
		const { workspace, transferData } = this.props;

		const filterMember = transferData
			.filter(el => !LoadState.isError(el) && !LoadState.isLoading(el))
			.find(assign => assign.workspaceId === workspace.spaceId);

		return filterMember ? filterMember.toUserId : "";
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
					value={this.getAssignedUser()}
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
