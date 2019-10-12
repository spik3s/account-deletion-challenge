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
		const { isChecked, onChangeFeedbackText } = this.props;
		const prefill = placeHolder && canComment ? placeHolder : "";

		return !isChecked(stack) ? null : (
			<div style={!canComment ? { display: "none" } : null}>
				<input
					type="text"
					name={stack}
					onChange={onChangeFeedbackText}
					placeholder={prefill}
				/>
			</div>
		);
	}

	renderCommentForm() {
		const { showCommentForm, onChangeComment, feedbackData } = this.props;
		if (!showCommentForm) return;
		return (
			<div style={{ marginTop: "2rem" }}>
				Comments:
				<div>
					<textarea
						type="text"
						name="comment"
						id="comments-box"
						onChange={onChangeComment}
						value={feedbackData.comment}
					/>
				</div>
			</div>
		);
	}

	renderButtons() {
		const { onBackButton, onSubmit } = this.props;
		return (
			<div>
				<button onClick={onBackButton}>Back</button>
				<button onClick={onSubmit} disabled={this.hasAllUnchecked()}>
					Next
				</button>
			</div>
		);
	}

	render() {
		const { title, isChecked, onChangeFeedbackCheckbox } = this.props;
		return (
			<div>
				<h1>{title}</h1>
				<div>
					{feedbackSurveyItems.map((item, key) => (
						<div key={`${item.stack}-${key}`}>
							<label>
								<input
									type="checkbox"
									name={item.stack}
									checked={isChecked(item.stack)}
									onChange={onChangeFeedbackCheckbox}
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
