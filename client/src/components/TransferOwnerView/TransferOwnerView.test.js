import React from "react";
import ReactDOM from "react-dom";
import { TransferOwnerView } from ".";
import { shallow, render, mount } from "enzyme";
import * as LoadState from "../../services/LoadState";

const requiredTransferWorkspacesEmpty = [];
const transferDataEmpty = [];
const deleteWorkspacesEmpty = [];
const user = { _id: "user1", name: "Ross Lynch", email: "ross@example.com" };

const mockWorkspaces = {
	requiredTransferWorkspaces: [
		{
			spaceId: "workspace1",
			displayName: "Lightning strike",
			transferableMembers: [
				{
					_id: "user2",
					name: "Ryan Lynch"
				},
				{
					_id: "user3",
					name: "Riker Lynch"
				},
				{
					_id: "user4",
					name: "Rydel Lynch"
				}
			]
		},
		{
			spaceId: "workspace2",
			displayName: "Time machine",
			transferableMembers: [
				{
					_id: "user5",
					name: "Edward Bayer",
					workspaceId: "workspace3"
				},
				{
					_id: "user6",
					name: "Eli Brook",
					workspaceId: "workspace3"
				}
			]
		}
	],
	deleteWorkspaces: [
		{
			spaceId: "workspace3",
			displayName: "Moon landing"
		}
	]
};

describe("TransferOwnerView", () => {
	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.pending,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setAppState={() => {}}
			/>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});

	it("must render a loading message before data loaded successfully", () => {
		const wrapper = shallow(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.fetching,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setAppState={() => {}}
			/>,
			{ disableLifecycleMethods: true }
		);
		expect(
			wrapper.find('div[children="Loading..."]').exists()
		).toBeTruthy();
	});

	it("must render select inputs with workspace data to transfer", () => {
		const wrapper = mount(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setAppState={() => {}}
			/>
		);

		expect(wrapper.find("select").exists()).toBeTruthy();

		wrapper.unmount();
	});

	it("must render list of workspaces to delete", () => {
		const wrapper = render(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setAppState={() => {}}
			/>
		);

		mockWorkspaces.deleteWorkspaces.forEach(workspace => {
			expect(wrapper.text().includes(workspace.displayName)).toBeTruthy();
		});
	});

	it("must not display a message if there are no workspaces to transfer", () => {
		const wrapper = render(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setAppState={() => {}}
			/>
		);

		mockWorkspaces.deleteWorkspaces.forEach(workspace => {
			expect(
				wrapper
					.text()
					.includes(
						"The following workspaces require ownership transfer:"
					)
			).toBe(false);
		});
	});
	it("must not display delete workspace message if no workspace to delete", () => {
		const wrapper = render(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setAppState={() => {}}
			/>
		);

		mockWorkspaces.deleteWorkspaces.forEach(workspace => {
			expect(
				wrapper
					.text()
					.includes("The following workspaces will be deleted:")
			).toBe(false);
		});
	});

	it("must not allow to proceed if there's been an error checking a workspace or not all workspaces have been chosen for reassignment", () => {
		const onClickNextMock = jest.fn();
		const wrapper = mount(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setAppState={() => {}}
				onClickNext={onClickNextMock}
			/>
		);

		wrapper.find("button").simulate("click");

		expect(onClickNextMock).toHaveBeenCalledTimes(0);
		wrapper.unmount();
	});

	it("must allow to proceed if loading has finished but list of workspaces is empty", () => {
		const onClickNextMock = jest.fn();
		const wrapper = mount(
			<TransferOwnerView
				user={user}
				appState={{
					workspacesLoadStatus: LoadState.completed,
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setAppState={() => {}}
				onClickNext={onClickNextMock}
			/>
		);

		wrapper.find("button").simulate("click");

		expect(onClickNextMock).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});
});
