import PropTypes from "prop-types";
import React from "react";

import { feedbackAnswers } from "../../data/feedbackAnswers";
import { submitSurvey, isChecked } from "../../services/SurveyService";
import { AppContext } from "../../AppContext";

export class FeedbackView extends React.Component {
	static propTypes = {
		onClickNext: PropTypes.func,
		onClickBack: PropTypes.func,
		// onChangeFeedback: PropTypes.func,
		title: PropTypes.node,
		showCommentForm: PropTypes.bool,
		// feedbackData: PropTypes.exact({
		// 	answers: PropTypes.array.isRequired,
		// 	comment: PropTypes.string.isRequired
		// }).isRequired
	};

	hasAllUnchecked = () => {
		const {
			appState: { feedbackData }
		} = this.props;
		return !(feedbackData.answers.length > 0);
	};

	onSubmit = () => {
		// While the specs are saying that user should be forced to take the exit survey
		// there's no suggestion on what the behaviour should be in case of error.
		// I decided that while I require users to give answers, I submit the results in
		// a non-blocking manner that will swallow potential errors (display to console).
		// I think it would be a frustrating experience to be prevented from completing the
		// original action because of exit survey error.
		const {
			appState: { feedbackData }
		} = this.props;
		submitSurvey(feedbackData);
		this.props.onClickNext();
	};

	renderInputForm = ({ stack, canComment, placeHolder }) => {
		const {
			appState: { feedbackData }
		} = this.props;
		const prefill = placeHolder && canComment ? placeHolder : "";
		const answer = feedbackData.answers.find(el => el.key === stack);

		return !isChecked(stack, feedbackData.answers) ? null : (
			<div>
				<input
					type="text"
					name={stack}
					onChange={this.onChangeFeedback}
					placeholder={prefill}
					value={answer && answer.value ? answer.value : ""}
				/>
			</div>
		);
	};

	updateFeedbackComment = value => {
		const { setAppState } = this.props;
		setAppState(({ feedbackData }) => {
			return {
				feedbackData: {
					...feedbackData,
					comment: value
				}
			};
		});
	};

	updateFeedbackCheckedAnswers = inputName => {
		const { setAppState } = this.props;
		setAppState(({ feedbackData }) => {
			return {
				feedbackData: {
					...feedbackData,
					answers: isChecked(inputName, feedbackData.answers)
						? feedbackData.answers.filter(
								({ key }) => key !== inputName
						  )
						: [
								...feedbackData.answers,
								{
									key: inputName
								}
						  ]
				}
			};
		});
	};

	updateFeedbackOtherAnswerValue = (inputName, value) => {
		const { setAppState } = this.props;
		setAppState(({ feedbackData }) => {
			return {
				feedbackData: {
					...feedbackData,
					answers: [
						...feedbackData.answers.filter(
							({ key }) => key !== inputName
						),
						{
							key: inputName,
							value: value
						}
					]
				}
			};
		});
	};

	// METHODS FOR FEEDBACK SURVEY
	onChangeFeedback = event => {
		const { type, name, value } = event.target;
		const isCheckbox = type === "checkbox";

		if (name === "comment") {
			this.updateFeedbackComment(value);
		} else {
			isCheckbox
				? this.updateFeedbackCheckedAnswers(name)
				: this.updateFeedbackOtherAnswerValue(name, value);
		}
	};

	render() {
		const {
			title,
			// feedbackData,
			showCommentForm,
			onClickBack,
			appState: { feedbackData }
		} = this.props;
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
									onChange={this.onChangeFeedback}
								/>
								{item.title}
							</label>
							{item.canComment && this.renderInputForm(item)}
						</div>
					))}
				</div>
				{showCommentForm && (
					<div style={{ marginTop: "2rem" }}>
						Comments:
						<div>
							<textarea
								type="text"
								name="comment"
								id="comments-box" // remove this and use name as a way to target the
								onChange={this.onChangeFeedback}
								value={feedbackData.comment}
							/>
						</div>
					</div>
				)}
				<div>
					<button onClick={onClickBack}>Back</button>
					<button
						onClick={this.onSubmit}
						disabled={this.hasAllUnchecked()}
					>
						Next
					</button>
				</div>
			</div>
		);
	}
}

const FeedbackViewWrapper = props => (
	<AppContext.Consumer>
		{context => {
			return <FeedbackView {...props} {...context} />;
		}}
	</AppContext.Consumer>
);

export default FeedbackViewWrapper;
