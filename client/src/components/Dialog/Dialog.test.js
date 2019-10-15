import React from "react";
import waitUntil from "async-wait-until";
// import ReactDOM from "react-dom";
import { shallow } from "enzyme";
import Component from ".";

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

const user = {
	_id: "user1",
	name: "Ross Lynch",
	email: "ross@example.com"
};

describe("Testing main Dialog component", () => {
	beforeAll(() => {
		global.fetch = jest.fn();
	});

	let wrapper;
	let instance;
	beforeEach(() => {
		fetch.mockImplementation(() => {
			return Promise.resolve({
				status: 200,
				ok: true,
				json: () => {
					return Promise.resolve(mockWorkspaces);
				}
			});
		});
		wrapper = shallow(<Component user={user} />);
		instance = wrapper.instance();
	});

	it("should check if fetchRelatedWorkspaces is called in `componentDidMount()`", () => {
		jest.spyOn(instance, "fetchRelatedWorkspaces"); // You spy on the randomFunction
		instance.componentDidMount();
		expect(instance.fetchRelatedWorkspaces).toHaveBeenCalledTimes(1); // You check if the condition you want to match is correct.
	});

	it("should check if workspaces data is loaded correctly to state", async () => {
		instance.componentDidMount();

		await waitUntil(
			() => wrapper.state("requiredTransferWorkspaces").length > 0
		);

		expect(wrapper.state("requiredTransferWorkspaces")).toEqual(
			mockWorkspaces.requiredTransferWorkspaces
		);
		expect(wrapper.state("deleteWorkspaces")).toEqual(
			mockWorkspaces.deleteWorkspaces
		);
	});
});
