import React from "react";
import ReactDOM from "react-dom";
import Component from ".";

const requiredTransferWorkspaces = [];
const transferData = [];
const deleteWorkspaces = [];
const user = { _id: "user1", name: "Ross Lynch", email: "ross@example.com" };

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(
		<Component
			user={user}
			transferData={transferData}
			requiredTransferWorkspaces={requiredTransferWorkspaces}
			deleteWorkspaces={deleteWorkspaces}
		/>,
		div
	);
	ReactDOM.unmountComponentAtNode(div);
});
