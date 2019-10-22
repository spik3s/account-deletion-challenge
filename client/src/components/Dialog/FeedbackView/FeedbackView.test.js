import React from "react";
import ReactDOM from "react-dom";
import { shallow, mount } from "enzyme";

import { FeedbackView } from "./FeedbackView";

import { feedbackAnswers } from "#src/data/feedbackAnswers";

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
			<FeedbackView
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
			/>,
			div
		);
		ReactDOM.unmountComponentAtNode(div);
	});
	it("calls onChangeFeedback() when checkbox is selected", () => {
		const wrapper = shallow(
			<FeedbackView
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
			/>
		);
		const instance = wrapper.instance();
		jest.spyOn(instance, "onChangeFeedback");
		jest.spyOn(instance, "updateFeedbackCheckedAnswers");
		instance.forceUpdate();

		wrapper
			.find(`input[type="checkbox"][name="${feedbackAnswers[0].stack}"]`)
			.simulate("change", {
				target: { checked: true, type: "checkbox" }
			});

		expect(instance.onChangeFeedback).toHaveBeenCalledTimes(1);
		expect(instance.updateFeedbackCheckedAnswers).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls onChangeFeedback() & updateFeedbackOtherAnswerValue() when typing in 'others' input field ", () => {
		const wrapper = shallow(
			<FeedbackView
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
			/>
		);
		const event = {
			target: { value: "some value", type: "text" }
		};
		const instance = wrapper.instance();
		jest.spyOn(instance, "onChangeFeedback");
		jest.spyOn(instance, "updateFeedbackOtherAnswerValue");
		instance.forceUpdate();

		expect(wrapper.find('input[name="others"]').exists()).toBeTruthy();
		wrapper.find('input[name="others"]').simulate("change", event);
		expect(instance.onChangeFeedback).toHaveBeenCalledTimes(1);
		expect(instance.updateFeedbackOtherAnswerValue).toHaveBeenCalledTimes(
			1
		);
		wrapper.unmount();
	});

	it("calls onChangeFeedback() & updateFeedbackComment() when comment is typed", () => {
		const wrapper = mount(
			<FeedbackView
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
				showCommentForm={true}
			/>
		);
		const event = {
			target: { value: "some value", name: "comment" }
		};
		const instance = wrapper.instance();
		jest.spyOn(instance, "onChangeFeedback");
		jest.spyOn(instance, "updateFeedbackComment");
		instance.forceUpdate();

		wrapper.find("textarea").simulate("change", event);
		expect(instance.onChangeFeedback).toHaveBeenCalledTimes(1);
		expect(instance.updateFeedbackComment).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("doesn't display when comment field if showCommentForm is not true", () => {
		const wrapper = shallow(
			<FeedbackView
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
			/>
		);
		expect(wrapper.find("textarea").exists()).toBe(false);
		wrapper.unmount();
	});

	it("prevents from proceeding to next view without selecting at least one answer", () => {
		const onClickNext = jest.fn();
		const wrapper = mount(
			<FeedbackView
				onClickNext={onClickNext}
				appState={{ feedbackData: feedbackDataEmpty }}
				setDialogState={() => {}}
			/>
		);

		wrapper.find('button[children="Next"]').simulate("click");
		expect(onClickNext).toHaveBeenCalledTimes(0);
		wrapper.unmount();
	});

	it("calls onClickNext() when clicked next if answer was selected", () => {
		const onClickNext = jest.fn();
		const wrapper = mount(
			<FeedbackView
				onClickNext={onClickNext}
				appState={{ feedbackData: feedbackDataWithAnswer }}
				setDialogState={() => {}}
			/>
		);

		wrapper.find('button[children="Next"]').simulate("click");
		expect(onClickNext).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls submitSurvey() when clicked next", () => {});
});
