const parseArgs = require("./parseArgs");

test("I can pass a combination of named and ordered arguments", () => {
	const input = ["components", "--dest=src/app", "HelloWorld"];
	const output = {
		template: "components",
		dest: "src/app",
		name: "HelloWorld",
	};
	expect(parseArgs(input)).toEqual(output);
});

test("I can pass only named arguments", () => {
	const input = [
		"--dest=src/app",
		"--name=HelloWorld",
		"--template=components",
	];
	const output = {
		template: "components",
		dest: "src/app",
		name: "HelloWorld",
	};
	expect(parseArgs(input)).toEqual(output);
});

test("I can pass only ordered arguments", () => {
	const input = ["components", "HelloWorld", "src/app"];
	const output = {
		template: "components",
		dest: "src/app",
		name: "HelloWorld",
	};
	expect(parseArgs(input)).toEqual(output);
});
