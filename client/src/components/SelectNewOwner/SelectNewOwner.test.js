import React from "react";
import ReactDOM from "react-dom";
import Component from ".";
import { shallow,  } from "enzyme";

const transferDataEmpty = [];

const user = { _id: "user1", name: "Ross Lynch", email: "ross@example.com" };

const workspace = {
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
};
describe("SelectNewOwner", () => {
	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(
			<Component
				user={user}
				transferData={transferDataEmpty}
				workspace={workspace}
			/>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});

	it("calls a onOwnerSelect() when new owner is selected", () => {
		const onOwnerSelect = jest.fn();
		const wrapper = shallow(
			<Component
				user={user}
				transferData={transferDataEmpty}
				workspace={workspace}
				onOwnerSelect={onOwnerSelect}
			/>
		);

		wrapper.find('select').simulate('change', {target: { value : 'user3'}});
		expect(onOwnerSelect).toHaveBeenCalledWith(workspace, {"_id": "user3", "name": "Riker Lynch"});
		expect(onOwnerSelect).toHaveBeenCalledTimes(1);
	});
});
