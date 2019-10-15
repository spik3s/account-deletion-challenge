import PropTypes from "prop-types";
import React from "react";

import SelectNewOwner from "../SelectNewOwner";
import * as LOAD_STATE from "../../constants/loadStatus";

class TransferOwnerView extends React.PureComponent {
	static propTypes = {
		requiredTransferWorkspaces: PropTypes.array.isRequired,
		transferData: PropTypes.array,
		onOwnerSelect: PropTypes.func,
		onClickNext: PropTypes.func,
		loading: PropTypes.bool.isRequired,
		user: PropTypes.exact({
			_id: PropTypes.string.isRequired, // not sure about the naming convention here. Leaving unchanged since I assume that's the format dictated by the rest of the app
			name: PropTypes.string.isRequired,
			email: PropTypes.string.isRequired
		}).isRequired
	};

	renderLoading = () => <div>Loading...</div>;

	render() {
		const {
			loading,
			onClickNext,
			requiredTransferWorkspaces,
			user,
			transferData,
			deleteWorkspaces,
			onOwnerSelect
		} = this.props;

		const requiredTransferWorkspacesCount =
			requiredTransferWorkspaces.length;

		const assignedWorkspacesCount = transferData.length;
		const isIncomplete = transferData.some(
			el => el.status !== LOAD_STATE.COMPLETED
		);

		const deleteWorkspacesCount = deleteWorkspaces.length;

		const disabledNextPage =
			assignedWorkspacesCount < requiredTransferWorkspacesCount ||
			isIncomplete ||
			loading

		return (
			<div>
				<h1>Transfer ownership</h1>
				<p>
					Before you leaving, it is required to transfer your tasks,
					projects and workspace admin rights to other person.
				</p>
				{loading ? (
					this.renderLoading()
				) : (
					<>
						<WorkspaceGroupRows
							workspaces={requiredTransferWorkspaces}
							groupTitle="The following workspaces require ownership transfer:"
							shouldDisplay={requiredTransferWorkspacesCount > 0}
						>
							<SelectNewOwner
								user={user}
								transferData={transferData}
								onOwnerSelect={onOwnerSelect}
							/>
						</WorkspaceGroupRows>

						<WorkspaceGroupRows
							workspaces={deleteWorkspaces}
							groupTitle="The following workspaces will be deleted:"
							shouldDisplay={deleteWorkspacesCount > 0}
						/>
					</>
				)}
				<button disabled={disabledNextPage} onClick={onClickNext}>
					Next
				</button>
			</div>
		);
	}
}

export const WorkspaceGroupRows = ({
	shouldDisplay,
	groupTitle,
	workspaces,
	children
}) =>
	!shouldDisplay ? null : (
		<div>
			<h3>{groupTitle}</h3>
			<div>
				{workspaces.map(workspace => (
					<div key={workspace.spaceId} style={{ marginTop: "1rem" }}>
						<span>Workspace: {workspace.displayName}</span>
						<span>
							{React.Children.count(children) === 0
								? null
								: React.cloneElement(children, { workspace })}
						</span>
					</div>
				))}
			</div>
		</div>
	);

WorkspaceGroupRows.propTypes = {
	groupTitle: PropTypes.string,
	workspaces: PropTypes.array.isRequired,
	children: PropTypes.node,
	shouldDisplay: PropTypes.bool
};

export default TransferOwnerView;