#!/usr/bin/env node
const orderedArgs = ["template", "name", "dest", "includeFolder"];

module.exports = function parseArgs(args) {
	// args component --dest=src/whatever Hello
	const namedArgs = args.reduce((acc, next) => {
		const [arg, value] = next.split("=");
		if (value) {
			acc[arg.replace(/^--/, "")] = value;
		}
		return acc;
	}, {});
	// -> { dest: src/whatever }
	const namedArgsKeys = Object.keys(namedArgs);
	// -> ["dest"]
	const positionalArgs = orderedArgs.filter(
		(arg) => !namedArgsKeys.includes(arg)
	);
	// ["template", "name", "includeFolder"];
	const options = args
		.filter((arg) => !arg.includes("="))
		// ["component", "Hello"];
		.reduce((acc, next, i) => {
			acc[positionalArgs[i]] = next;
			return acc;
		}, {});

	return { ...options, ...namedArgs };
};
