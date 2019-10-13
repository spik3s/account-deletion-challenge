import React from "react";
import ReactDOM from "react-dom";
import Component from ".";

const feedbackData = {
	answers: [],
	comment: ""
};
it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<Component feedbackData={feedbackData} onChangeFeedback={() => {}}/>, div);
	ReactDOM.unmountComponentAtNode(div);
});
