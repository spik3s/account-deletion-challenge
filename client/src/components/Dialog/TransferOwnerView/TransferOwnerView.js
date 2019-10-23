import React from "react";

import SelectNewOwner from "./SelectNewOwner";
import WorkspaceGroupRows from "./WorkspaceGroupRows";

import { getCheckOwnershipApiURL, handleApiErrors } from "#src/helpers/api";
import { appStateType, userType } from "#src/types";
import { post } from "#src/helpers/fetch";
import { isEmpty } from "#src/helpers/general";

import { withDialogContext } from "../context";

export class TransferOwnerView extends React.PureComponent {
	static propTypes = {
		user: userType,
		appState: appStateType
	};

	fetchAbortController = new AbortController();

	transferOwnershipCheck = (workspace, toUser) => {
		const {
			user,
			appState: { requiredTransferWorkspaces }
		} = this.props;

		const ownershipToCheck = {
			workspaceId: workspace.spaceId,
			fromUserId: user._id,
			toUserId: toUser._id,
			approved: false
		};
		this.props.transition({
			transferDataItem: ownershipToCheck,
			type: "CHECKING_OWNERSHIP"
		});

		post(getCheckOwnershipApiURL(), ownershipToCheck, {
			signal: this.fetchAbortController.signal
		})
			.then(({ status }) => {
				if (status === 200) {
					this.props.transition({
						transferDataItem: {
							...ownershipToCheck,
							approved: true
						},
						type: "OWNERSHIP_APPROVED"
					});
				}
			})
			.catch(err => {
				handleApiErrors(err, () => {
					const relatedWorkspace = requiredTransferWorkspaces.find(el => el.spaceId === ownershipToCheck.workspaceId)
					this.props.transition({
						type: "OWNERSHIP_ERRORED",
						transferDataItem: ownershipToCheck,
						error: `Error while checking for the ownership suitability for workspace ${relatedWorkspace.displayName}. Please select a different user.`
					});
				});
			});
	};

	onClickNext = () => {
		this.props.transition({ type: "WORKSPACES_ASSIGNED" });
	};

	render() {
		const {
			user,
			appState: {
				transferData,
				deleteWorkspaces,
				requiredTransferWorkspaces,
				dialogState,
				error
			}
		} = this.props;

		const allApproved = !transferData.some(el => !el.approved);

		const disabledNextPage =
			dialogState === "workspacesLoading" ||
			transferData.length < requiredTransferWorkspaces.length ||
			error !== "" ||
			!allApproved;

		return (
			<div>
				<h1>Transfer ownership</h1>
				<p>
					Before you leaving, it is required to transfer your tasks,
					projects and workspace admin rights to other person.
				</p>

				{dialogState === "workspacesLoading" && <div>Loading...</div>}
				{dialogState === "workspacesErrored" && (
					<div>
						<p style={{ color: "red" }}>{error}</p>
					</div>
				)}
				{dialogState === "workspacesLoaded" && (
					<>
						<WorkspaceGroupRows
							workspaces={requiredTransferWorkspaces}
							groupTitle="The following workspaces require ownership transfer:"
							shouldDisplay={!isEmpty(requiredTransferWorkspaces)}
						>
							<SelectNewOwner
								user={user}
								transferData={transferData}
								onOwnerSelect={this.transferOwnershipCheck}
								error={error}
							/>
						</WorkspaceGroupRows>

						{error && (
							<div
								style={{
									marginTop: "1rem",
									color: "#ff4500"
								}}
							>
								{error}
							</div>
						)}

						<WorkspaceGroupRows
							workspaces={deleteWorkspaces}
							groupTitle="The following workspaces will be deleted:"
							shouldDisplay={!isEmpty(deleteWorkspaces)}
						/>

						<button
							disabled={disabledNextPage}
							onClick={this.onClickNext}
						>
							Next
						</button>
					</>
				)}
			</div>
		);
	}
}

export default withDialogContext(TransferOwnerView);
