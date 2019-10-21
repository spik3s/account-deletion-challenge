import { func, string, array, node, bool } from "prop-types";
import React from "react";

import SelectNewOwner from "../SelectNewOwner";
import { post } from "../../utils/fetch";
import * as LOAD_STATE from "../../constants/loadStatus";
import * as LoadState from "../../services/LoadState";
import * as API from "../../constants/api";
import { appStateType, userType } from "../../types";

import { withAppContext } from "../../AppContext";

export class TransferOwnerView extends React.PureComponent {
	static propTypes = {
		onClickNext: func,
		user: userType,
		appState: appStateType
	};

	fetchAbortController = new AbortController();

	transferStatusUpdate = (currentState, transferStatus) => {
		const { transferData } = currentState;
		if (
			!transferData.length ||
			!transferData.some(
				({ workspaceId }) => workspaceId === transferStatus.workspaceId
			)
		) {
			return [...transferData, transferStatus];
		}

		return transferData.reduce((result, existingItem) => {
			if (existingItem.workspaceId === transferStatus.workspaceId) {
				result.push(transferStatus);
				return result;
			}
			result.push(existingItem);

			return result;
		}, []);
	};

	transferOwnershipCheck = (workspace, toUser) => {
		const { user, setAppState } = this.props;
		const ownershipToCheck = {
			workspaceId: workspace.spaceId,
			fromUserId: user._id,
			toUserId: toUser._id
		};
		setAppState(
			state => ({
				transferData: this.transferStatusUpdate(state, {
					...ownershipToCheck,
					...LoadState.fetching
				})
			}),
			() => {
				post(API.CHECK_OWNERSHIP, ownershipToCheck, {
					signal: this.fetchAbortController.signal
				})
					.then(({ status }) => {
						if (status === 200) {
							setAppState(state => ({
								transferData: this.transferStatusUpdate(state, {
									...ownershipToCheck,
									...LoadState.completed
								})
							}));
						}
					})
					.catch(err => {
						if (err.name === "AbortError") {
							console.info(
								"Check Ownership Fetch request was aborted."
							);
						}

						setAppState(state => ({
							transferData: this.transferStatusUpdate(state, {
								...LoadState.initWithError(
									"Error while checking for the ownership suitability"
								),
								...ownershipToCheck
							})
						}));
					});
			}
		);
	};

	renderLoading = () => <div>Loading...</div>;

	render() {
		const {
			onClickNext,
			user,
			appState: {
				transferData,
				deleteWorkspaces,
				requiredTransferWorkspaces,
				loading
			}
			// onOwnerSelect
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
			loading;

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
								onOwnerSelect={this.transferOwnershipCheck}
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
	groupTitle: string,
	workspaces: array.isRequired,
	children: node,
	shouldDisplay: bool
};

export default withAppContext(TransferOwnerView);
