#!/usr/bin/env node
const path = require("path");
const baguette = require("./baguette");
const [, , ...args] = process.argv;

const orderedArgs = ["template", "name", "dest", "includeFolder"];

if (args.length) {
	const options = args.reduce((acc, next, i) => {
		const [arg, value] = next.split("=");
		if (value) {
			console.log(value, typeof value);
			acc[arg.replace(/^--/, "")] = value;
		} else {
			acc[orderedArgs[i]] = arg;
		}
		return acc;
	}, {});
	return baguette(options);
} else {
	return console.error("C'mon, gonna need at least a component name");
}
