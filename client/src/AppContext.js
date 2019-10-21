import React from "react";

export const AppContext = React.createContext({
	appState: {},
	setAppState: () => {}
});

export const withAppContext = Component => props => (
	<AppContext.Consumer>
		{context => {
			return <Component {...props} {...context} />;
		}}
	</AppContext.Consumer>
);