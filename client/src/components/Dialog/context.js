import React from "react";

export const DialogContext = React.createContext({
	appState: {},
	transition: () => {}
});

export const withDialogContext = Component => props => (
	<DialogContext.Consumer>
		{context => {
			return <Component {...props} {...context} />;
		}}
	</DialogContext.Consumer>
);