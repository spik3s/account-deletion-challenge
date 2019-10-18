import React from "react";
import ReactDOM from "react-dom";
import Component from ".";
import { shallow, render, mount } from "enzyme";
import { feedbackAnswers } from "../../data/feedbackAnswers";

const feedbackDataEmpty = {
	answers: [],
	comment: ""
};

const feedbackDataWithAnswer = {
	answers: [
		{
			key: "prefer_other_apps",
			value: ""
		}
	],
	comment: ""
};

describe("FeedbackView", () => {
	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(
			<Component
				feedbackData={feedbackDataEmpty}
				onChangeFeedback={() => {}}
			/>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});
	it("calls onChangeFeedback() when checkbox is selected", () => {
		const onChangeFeedback = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataEmpty}
				onChangeFeedback={onChangeFeedback}
			/>
		);

		wrapper
			.find(`input[type="checkbox"][name="${feedbackAnswers[0].stack}"]`)
			.simulate("change", { target: { checked: true } });

		expect(onChangeFeedback).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls onChangeFeedback() when typing in 'others' input field ", () => {
		const onChangeFeedback = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataEmpty}
				onChangeFeedback={onChangeFeedback}
			/>
		);

		expect(wrapper.find('input[name="others"]').exists()).toBeTruthy();
		wrapper.find('input[name="others"]').simulate("change");
		expect(onChangeFeedback).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls onChangeFeedback() when comment is typed", () => {
		const onChangeFeedback = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataEmpty}
				onChangeFeedback={onChangeFeedback}
				showCommentForm={true}
			/>
		);

		wrapper.find("textarea").simulate("change");
		expect(onChangeFeedback).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("doesn't display when comment field if showCommentForm is not true", () => {
		const onChangeFeedback = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataEmpty}
				onChangeFeedback={onChangeFeedback}
			/>
		);
		expect(wrapper.find('textarea').exists()).toBe(false);
		wrapper.unmount();
	});


	it("prevents from proceeding to next view without selecting at least one answer", () => {
		const onClickNext = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataEmpty}
				onClickNext={onClickNext}
				onChangeFeedback={() => {}}
			/>
		);

		wrapper.find('button[children="Next"]').simulate("click");
		expect(onClickNext).toHaveBeenCalledTimes(0);
		wrapper.unmount();
	});
	
	it("calls onClickNext() when clicked next if answer was selected", () => {
		const onClickNext = jest.fn();
		const wrapper = mount(
			<Component
				feedbackData={feedbackDataWithAnswer}
				onClickNext={onClickNext}
				onChangeFeedback={() => {}}
			/>
		);
		wrapper.find('button[children="Next"]').simulate("click");
		expect(onClickNext).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls submitSurvey() when clicked next", () => {});
});
