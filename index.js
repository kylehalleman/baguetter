#!/usr/bin/env node
const baguette = require("./baguette");
const parseArgs = require("./parseArgs");
const [, , ...args] = process.argv;

if (args.length) {
	baguette(parseArgs(args));
} else {
	console.error("C'mon, gonna need at least a component name");
}
