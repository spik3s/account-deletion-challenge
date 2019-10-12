import PropTypes from "prop-types";
import React from "react";

import * as LoadState from "../../LoadState";

export default class SelectNewOwner extends React.Component {
	static propTypes = {
		user: PropTypes.object,
		transferData: PropTypes.array,
		onAssignToUser: PropTypes.func
	};

	getAddedMember() {
		const { workspace, transferData } = this.props;

		// TODO: We need to display some errors if LoadState.isError

		const filterMembers = transferData
			.filter(el => !LoadState.isError(el) && !LoadState.isLoading(el))
			.find(assign => assign.workspaceId === workspace.spaceId);

		return filterMembers ? filterMembers.toUserId : "";
	}

	onAssignToUser = e => {
		const { onAssignToUser, workspace } = this.props;
		const user = workspace.transferableMembers.find(
			user => user._id === e.target.value
		);
		onAssignToUser(workspace, user);
	};

	render() {
    const {workspace} = this.props
		return (
			<div style={{ textDecoration: "underline", cursor: "pointer" }}>
				<select
					value={this.getAddedMember()}
					onChange={this.onAssignToUser}
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
