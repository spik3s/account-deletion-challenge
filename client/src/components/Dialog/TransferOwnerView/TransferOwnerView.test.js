import React from "react";
import ReactDOM from "react-dom";
import { shallow, render, mount } from "enzyme";

import { TransferOwnerView } from "./TransferOwnerView";

import * as LoadState from "#src/helpers/loadState";

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
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setDialogState={() => {}}
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
					dialogState: "workspacesLoading",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setDialogState={() => {}}
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
					dialogState: "workspacesLoaded",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setDialogState={() => {}}
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
					dialogState: "workspacesLoaded",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setDialogState={() => {}}
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
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: mockWorkspaces.deleteWorkspaces
				}}
				setDialogState={() => {}}
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
					dialogState: "workspacesLoaded",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				setDialogState={() => {}}
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
		const wrapper = mount(
			<TransferOwnerView
				user={user}
				appState={{
					dialogState: "workspacesLoaded",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces:
						mockWorkspaces.requiredTransferWorkspaces,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
			/>
		);
		const instance = wrapper.instance();
		jest.spyOn(instance, "onClickNext");
		instance.forceUpdate();
		wrapper.find("button").simulate("click");

		expect(instance.onClickNext).toHaveBeenCalledTimes(0);
		wrapper.unmount();
	});

	it("must allow to proceed if loading has finished but list of workspaces is empty", () => {
		const transition = jest.fn();
		const wrapper = mount(
			<TransferOwnerView
				user={user}
				appState={{
					dialogState: "workspacesLoaded",
					transferData: transferDataEmpty,
					requiredTransferWorkspaces: requiredTransferWorkspacesEmpty,
					deleteWorkspaces: deleteWorkspacesEmpty
				}}
				transition={transition}
			/>
		);

		const instance = wrapper.instance();
		jest.spyOn(instance, "onClickNext");
		instance.forceUpdate();
		const button = wrapper.find('button[children="Next"]');
		button.simulate("click");

		expect(instance.onClickNext).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});
});
