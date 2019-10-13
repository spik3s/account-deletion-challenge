import PropTypes from "prop-types";
import React from "react";

import { feedbackAnswers } from "../../data/feedbackAnswers";
import { submitSurvey, isChecked } from "../../SurveyService";

class FeedbackView extends React.PureComponent {
	static propTypes = {
		onClickNext: PropTypes.func,
		onClickBack: PropTypes.func,
		onChangeFeedback: PropTypes.func,
		title: PropTypes.node,
		showCommentForm: PropTypes.bool,
		feedbackData: PropTypes.exact({
			answers: PropTypes.array.isRequired,
			comment: PropTypes.string.isRequired
		}).isRequired,
	};

	hasAllUnchecked = () => {
		return !(this.props.feedbackData.answers.length > 0);
	};

	onSubmit = () => {
		submitSurvey(this.props.feedbackData);
		this.props.onClickNext();
	};

	renderInputForm = ({ stack, canComment, placeHolder }) => {
		const { onChangeFeedback, feedbackData } = this.props;
		const prefill = placeHolder && canComment ? placeHolder : "";
		const answer = feedbackData.answers.find(el => el.key === stack);

		return !isChecked(stack, feedbackData.answers) ? null : (
			<div>
				<input
					type="text"
					name={stack}
					onChange={onChangeFeedback}
					placeholder={prefill}
					value={answer ? answer.value : ""}
				/>
			</div>
		);
	};

	renderCommentForm() {
		const { showCommentForm, onChangeFeedback, feedbackData } = this.props;
		if (!showCommentForm) return;
		return (
			<div style={{ marginTop: "2rem" }}>
				Comments:
				<div>
					<textarea
						type="text"
						name="comment"
						id="comments-box"
						onChange={onChangeFeedback}
						value={feedbackData.comment}
					/>
				</div>
			</div>
		);
	}

	renderButtons() {
		const { onClickBack } = this.props;
		return (
			<div>
				<button onClick={onClickBack}>Back</button>
				<button
					onClick={this.onSubmit}
					disabled={this.hasAllUnchecked()}
				>
					Next
				</button>
			</div>
		);
	}

	render() {
		const { title, onChangeFeedback, feedbackData } = this.props;
		return (
			<div>
				<h1>{title}</h1>
				<div>
					{feedbackAnswers.map((item, key) => (
						<div key={`${item.stack}-${key}`}>
							<label>
								<input
									type="checkbox"
									name={item.stack}
									checked={isChecked(
										item.stack,
										feedbackData.answers
									)}
									onChange={onChangeFeedback}
								/>
								{item.title}
							</label>
							{item.canComment && this.renderInputForm(item)}
						</div>
					))}
				</div>
				{this.renderCommentForm()}
				{this.renderButtons()}
			</div>
		);
	}
}

export default FeedbackView;
