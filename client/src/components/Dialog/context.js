import React from "react";

export const DialogContext = React.createContext({
	appState: {},
	setDialogState: () => {}
});

export const withDialogContext = Component => props => (
	<DialogContext.Consumer>
		{context => {
			return <Component {...props} {...context} />;
		}}
	</DialogContext.Consumer>
);