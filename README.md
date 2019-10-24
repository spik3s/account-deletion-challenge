### Note from the developer

I've approached this task by splitting overall process of refactoring into two parts:

1. Getting it to run
2. Refactor and clean up the code

Due to the fact that I'm currently very busy at my current job, I tried to complete as much improvements as possible, trying to work on the task any time I had inbetween my other projects, very often while waiting for the code to compile or tests to finish. This is reflected by format and nature of my git commits (short comments, many of them). Ultimately, I'd edit and rebase them.

Besides the most obvious bugs, my main concern was finding a better way to manage the state of the application. I tried to lift it up wherever possible and then use Context API to make it easier to structure the code in a way that's gonna be easier to maintain. Eventually I decided that might be not enough and added a simple state machine that helped with all transitions between the states and limited places in code where we call setState to minimum.

I left a comment inside regarding the way how the feedback results could be submitted to SurveyMonkey. As the specification stated that the user can freely go back and forth between different steps in the app, I am concerned that if we submit the results at the end of step 2, going back will lead to duplicated feedback submissions. Easiest solution would be to submit the results in the final step to the API, however that's adding work to our server that by definition should be done inside a client (IMHO). Similarly, I have concerns regarding the error handling on feedback submission - hiding errors isn't a solution at all, however I think the priority task that user tries to accomplish here is to delete their account and the overall flow should make sure we deal with the errors in a way that does not prevent/obstructs the path to complete the task.

Last, but not least. I provided the app with a list of tests. As a next step I would further optimise them and refactor their code and minimise number of times we have to mount/render the wrappers and try to use shallow rendering wherever possible to speed the testing up.

The code review is by no means complete, there's still quite a few things that I'd like to change but I'm unable to under current time pressure. I hope, overall, it will give you an idea where I'm going with it and shows you the level of skill and experience I have. It would be great to discuss the decisions I've made throughout over a conversation.

### Preface

This repository demonstrates bad code that was previously used in Taskworld. The ultimate goal of this web is allowing users to delete their account, but before doing so, they must transfer their ownership to another user and do our exit survey. To confirm the account deletion, users need to type their emails, and tick the acknowledgment check-box. After deleting accounts, users will be redirected to `www.example.com`.

You can bring up the web by going to `client` directory, running `npm install` and `npm run serve` respectively, then open http://localhost:1234/ in your browser. You may also [view this project on CodeSandbox.io](https://codesandbox.io/s/github/taskworld/account-deletion-challenge/tree/master/client).

### Specifications

You are logged in as _Ross Lynch_, the owner of the workspace _Lightning strike_.

Initially, the web needs to download the workspace data that belong to you by calling the REST API `fetchWorkspaces`.

Once the web has the workspace data, the web prompts you to transfer your tasks, projects, and admin rights to another person. Every time you assign a user, the web tries checking if the assigned user presents in the workspace (dry-run) by calling the REST API `checkOwnership`. Note that the ownership transfer operation will actually happen once you finish the email confirmation (the last step).

Moving on, you are forced to do the exit survey. Marking one or multiple answers allow you to proceed to the final step. Your answers and comments will be sent to the REST API `submitSurvey` for further analysis. Note that the request payload must be conform with [SurveyMonkey®](https://developer.surveymonkey.com/api/v3/#collectors-id-responses).

Finally, you need to confirm the account deletion by typing your email, hard-coded as `ross@example.com`, and tick the acknowledgment check-box. After that, calling the REST API `terminateAccount` will tell the server to transfer the ownership that is previously chosen in the first step, delete your account, and the web will redirect you to http://www.example.com.

You can go back and forth through the steps anytime, but the whole process is considered complete only when clicking _Delete my account_ button.

### Instructions

- You are instructed to improve the code mainly in JavaScript files inside `client/src` directory. There are many bugs hidden in the codebase, try to fix as many as you can and refactor the code so it becomes easier to maintain.
- You may amend, move, or delete some of the existing functionality even it breaks the specifications as long as you see fit.
- You may add new functionality in addition to the specifications as you see fit.
- You may rename the files and React components as you see fit.
- **You must** be able to explain the reasons behind your code changes along with its trade-off in a verbal review or a written document.
- **You must** be able to go to `client` directory, run `npm run serve` against your code without any errors, and open http://localhost:1234/ to perform the intended tasks according to the specifications using the original set of the REST APIs.
- **You must** add at least one test case of your choice using black-box testing technique.
- **You must** use Git as a version control.
- You will not be judged by the appearance of the web, which means you may leave `index.css` and every `style={{ ... }}` prop untouched.

### Expectations

You will be judged by the following criteria.

- Functionality is correct with respect to the specifications, while breaking changes are acceptable only if rational.
- Bugs are fixed as many as possible. It should be hard for the reviewers to find a remaining bug.
- Good software engineering principles are followed, for example, [SOLID principles](https://en.wikipedia.org/wiki/SOLID).
- Identifiers are named meaningfully and consistently.
- High coupling code blocks are adjacent to each other.
- Errors are handled and exposed to users beautifully. Any REST API call may randomly take longer than usual or result in an error due to an invalid input or an unknown server error.
- Good choice of data structure is used.
- Consistent indentation and formatting are followed.
- Indirection is minimized as much as possible, while still maintaining flexibility.
- Git commit messages clearly state the reason of the change.
- Over-engineering and under-engineering are avoided.
- Automation testing covers the main functionality of the under-testing components.

**Taskworld expects you to put great effort into your work with the highest attention to detail.**

Taskworld reserves the right, in its sole discretion, to disqualify any candidate that does not comply with any of the above, even before the work is submitted.

By submitting this challenge you agree that any writings or images you submitted may be used by Taskworld.
