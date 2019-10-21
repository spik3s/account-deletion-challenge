import React from "react";
import ReactDOM from "react-dom";
import { ConfirmView } from ".";
import { shallow, mount } from "enzyme";

describe("FeedbackView", () => {
	it("renders without crashing", () => {
		const div = document.createElement("div");
		ReactDOM.render(<ConfirmView appState={{ transferData: [] }}/>, div);
		ReactDOM.unmountComponentAtNode(div);
	});

	it("calls onTypeEmail() when email is entered", () => {
		const wrapper = shallow(<ConfirmView appState={{ transferData: [] }} />);
		const instance = wrapper.instance();
		const event = {
			target: { value: "some value" }
		};

		jest.spyOn(instance, "onTypeEmail");
		instance.forceUpdate();

		const emailInput = wrapper.find('input[name="confirmationEmail"]');

		expect(emailInput.exists()).toBeTruthy();

		emailInput.simulate("change", event);

		expect(instance.onTypeEmail).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("calls toggleConfirmationCheckbox() when checkbox is clicked", () => {
		const wrapper = shallow(<ConfirmView appState={{ transferData: [] }} />);
		const instance = wrapper.instance();
		const event = {
			target: { checked: true }
		};

		jest.spyOn(instance, "toggleConfirmationCheckbox");
		instance.forceUpdate();

		const checkbox = wrapper.find('input[name="confirmationCheckbox"]');
		expect(checkbox.exists()).toBeTruthy();

		checkbox.simulate("change", event);

		expect(instance.toggleConfirmationCheckbox).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("prevents account delete if email is not correct or checkbox not checked", () => {
		const wrapper = mount(<ConfirmView appState={{ transferData: [] }} />);
		const instance = wrapper.instance();

		jest.spyOn(instance, "onClickToDelete");
		instance.forceUpdate();

		const button = wrapper.find('button[children="Delete my account"]');
		expect(button.exists()).toBeTruthy();
		expect(button.props().disabled).toBe(true);

		button.simulate("click");
		expect(instance.onClickToDelete).toHaveBeenCalledTimes(0);

		wrapper.unmount();
	});

	it("calls onClickToDelete() when conditions are met and button is clicked", () => {
		const wrapper = mount(
			<ConfirmView appState={{ transferData: [] }} email="ross@example.com" />
		);
		wrapper.setState({
			confirmationCheckbox: true,
			confirmationEmail: "ross@example.com"
		});

		const instance = wrapper.instance();

		instance.onClickToDelete = jest.fn();

		jest.spyOn(instance, "onClickToDelete");
		instance.forceUpdate();

		const button = wrapper.find('button[children="Delete my account"]');
		expect(button.exists()).toBeTruthy();

		expect(button.props().disabled).toBe(false);

		button.simulate("click");
		expect(instance.onClickToDelete).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});
});
