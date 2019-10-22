import { func } from "prop-types";
import React from "react";

import SelectNewOwner from "./SelectNewOwner";
import WorkspaceGroupRows from "./WorkspaceGroupRows";

import * as API from "#src/constants/api";
import * as LOAD_STATE from "#src/constants/loadStatus";
import {
	isLoading,
	isError,
	initWithError,
	fetching,
	completed
} from "#src/helpers/loadState";
import { appStateType, userType } from "#src/types";
import { post } from "#src/helpers/fetch";
import { isEmpty, containsItemWithEqualProp } from "#src/helpers/general";

import { withDialogContext } from "../context";

export class TransferOwnerView extends React.PureComponent {
	static propTypes = {
		onClickNext: func,
		user: userType,
		appState: appStateType
	};

	fetchAbortController = new AbortController();

	transferOwnershipCheck = (workspace, toUser) => {
		const { user, setDialogState } = this.props;

		const ownershipToCheck = {
			workspaceId: workspace.spaceId,
			fromUserId: user._id,
			toUserId: toUser._id
		};

		setDialogState(
			appState =>
				this.makeNewTransferData(appState.transferData, {
					...ownershipToCheck,
					...fetching
				}),
			() => {
				post(API.CHECK_OWNERSHIP, ownershipToCheck, {
					signal: this.fetchAbortController.signal
				})
					.then(({ status }) => {
						if (status === 200) {
							setDialogState(appState =>
								this.makeNewTransferData(
									appState.transferData,
									{
										...ownershipToCheck,
										...completed
									}
								)
							);
						}
					})
					.catch(err => {
						if (err.name === "AbortError") {
							console.info(
								"Check Ownership Fetch request was aborted."
							);
						}

						setDialogState(appState =>
							this.makeNewTransferData(appState.transferData, {
								...initWithError(
									"Error while checking for the ownership suitability"
								),
								...ownershipToCheck
							})
						);
					});
			}
		);
	};

	makeNewTransferData = (currentTransferData, newTransferDetails) => {
		if (
			isEmpty(currentTransferData) ||
			!containsItemWithEqualProp(
				currentTransferData,
				newTransferDetails,
				"workspaceId"
			)
		) {
			return {
				transferData: [...currentTransferData, newTransferDetails]
			};
		}

		const updatedTransferData = currentTransferData.reduce(
			(newList, existingItem) => {
				// if object with workspaceId of new object already exists, replace it with new object
				if (
					existingItem.workspaceId === newTransferDetails.workspaceId
				) {
					newList.push(newTransferDetails);
					return newList;
				}
				// keep the existing objects that represent other workspaces
				newList.push(existingItem);

				return newList;
			},
			[]
		);

		return { transferData: updatedTransferData };
	};

	render() {
		const {
			onClickNext,
			user,
			appState: {
				transferData,
				deleteWorkspaces,
				requiredTransferWorkspaces,
				workspacesLoadStatus
			}
		} = this.props;

		const hasIncompleteChecks = transferData.some(
			el => el.status !== LOAD_STATE.COMPLETED
		);

		const disabledNextPage =
			transferData.length < requiredTransferWorkspaces.length ||
			hasIncompleteChecks ||
			isLoading(workspacesLoadStatus);

		return (
			<div>
				<h1>Transfer ownership</h1>
				<p>
					Before you leaving, it is required to transfer your tasks,
					projects and workspace admin rights to other person.
				</p>

				{isLoading(workspacesLoadStatus) ? (
					<div>Loading...</div>
				) : isError(workspacesLoadStatus) ? (
					<div>
						<p style={{ color: "red" }}>
							{workspacesLoadStatus.error}
						</p>
					</div>
				) : (
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
							/>
						</WorkspaceGroupRows>

						<WorkspaceGroupRows
							workspaces={deleteWorkspaces}
							groupTitle="The following workspaces will be deleted:"
							shouldDisplay={!isEmpty(deleteWorkspaces)}
						/>

						<button
							disabled={disabledNextPage}
							onClick={onClickNext}
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
