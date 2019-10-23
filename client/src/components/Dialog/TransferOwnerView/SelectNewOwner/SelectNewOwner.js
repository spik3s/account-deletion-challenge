import { array, object, func } from "prop-types";
import React from "react";

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
		const assignedUser = transferData
			.find(assign => assign.workspaceId === workspace.spaceId);

		return assignedUser ? assignedUser.toUserId : "";
	}

	handleOwnerSelect = e => {
		const { onOwnerSelect, workspace } = this.props;
		const user = workspace.transferableMembers.find(
			user => user._id === e.target.value
		);
		onOwnerSelect(workspace, user);
	};

	render() {
		const { workspace } = this.props;
		
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
			</div>
		);
	}
}
