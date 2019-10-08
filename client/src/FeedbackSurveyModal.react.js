import PropTypes from "prop-types";
import React from "react";

import { feedbackSurveyItems } from "./FeedbackSurveyItems";

class FeedbackSurveyModal extends React.PureComponent {
	static propTypes = {
		onSubmit: PropTypes.func,
		onBackButton: PropTypes.func,
		onChangeFeedbackText: PropTypes.func,
		onChangeFeedbackCheckbox: PropTypes.func,
		isChecked: PropTypes.func,
		title: PropTypes.node,
		showCommentForm: PropTypes.bool,
		feedbackData: PropTypes.exact({
			answers: PropTypes.array.isRequired,
			comment: PropTypes.string.isRequired
		}).isRequired,
		onChangeComment: PropTypes.func
	};

	hasAllUnchecked = () => {
		return !(this.props.feedbackData.answers.length > 0);
	};

	renderInputForm({ stack, canComment, placeHolder }) {
		const prefill = placeHolder && canComment ? placeHolder : "";

		return !this.props.isChecked(stack) ? null : (
			<div style={!canComment ? { display: "none" } : null}>
				<input
					type="text"
					name={stack}
					// ref={stack}
					onChange={this.props.onChangeFeedbackText}
					placeholder={prefill}
				/>
			</div>
		);
	}

	renderCommentForm() {
		if (!this.props.showCommentForm) return;
		return (
			<div style={{ marginTop: "2rem" }}>
				Comments:
				<div>
					<textarea
						type="text"
						name="comment"
						id="comments-box"
						onChange={this.props.onChangeComment}
						value={this.props.feedbackData.comment}
					/>
				</div>
			</div>
		);
	}

	renderButtons() {
		return (
			<div>
				<button onClick={this.props.onBackButton}>Back</button>
				<button
					onClick={this.props.onSubmit}
					disabled={this.hasAllUnchecked()}
				>
					Next
				</button>
			</div>
		);
	}

	render() {
		return (
			<div>
				<h1>{this.props.title}</h1>
				<div>
					{feedbackSurveyItems.map((item, key) => (
						<div key={`${item.stack}-${key}`}>
							<label>
								<input
									type="checkbox"
									name={item.stack}
									checked={this.props.isChecked(item.stack)}
									onChange={
										this.props.onChangeFeedbackCheckbox
									}
								/>
								{item.title}
							</label>
							{this.renderInputForm(item)}
						</div>
					))}
				</div>
				{this.renderCommentForm()}
				{this.renderButtons()}
			</div>
		);
	}
}

export default FeedbackSurveyModal;
