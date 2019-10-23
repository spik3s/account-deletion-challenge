module.exports = {
	automock: false,
	clearMocks: true,
	coverageDirectory: "coverage",
	moduleNameMapper: {
		"^#src(.*)$": "<rootDir>/src$1"
	},
	setupFiles: ["./jestModules.js", "./enzymeSetup.js"]
};
