import React from "react";
import ReactDOM from "react-dom";
import Component from ".";
import MockDataProvider from "../../MockDataProvider";

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

describe("testing api", () => {
	beforeEach(() => {
		fetch.resetMocks();
	});

	it("renders without crashing", () => {
		fetch.mockResponseOnce(JSON.stringify({ ...mockWorkspaces }));

		const div = document.createElement("div");
		ReactDOM.render(
			<MockDataProvider>
				{props => <Component {...props} />}
			</MockDataProvider>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});
});
