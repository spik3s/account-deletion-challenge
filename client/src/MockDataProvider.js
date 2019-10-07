import PropTypes from "prop-types";
import React from "react";

export default class MockDataProvider extends React.Component {
	static propTypes = {
		children: PropTypes.func.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			user: {
				_id: "user1",
				name: "Ross Lynch",
				email: "ross@example.com"
			}
		};
	}

	render() {
		return this.props.children(this.state);
	}
}
