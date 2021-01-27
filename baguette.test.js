const baguette = require("./baguette");

const path = require("path");
const fs = require("fs").promises;

const font = require("./font");

function setup(src) {
	const cwdSpy = jest.spyOn(process, "cwd").mockReturnValue(src);
	const logSpy = jest.spyOn(console, "log");

	return {
		logSpy,
		cleanup: () => {
			cwdSpy.mockRestore();
			const srcPath = path.resolve(process.cwd(), src, "src");

			return fs
				.access(srcPath)
				.then(() => fs.rmdir(srcPath, { recursive: true }))
				.catch(() => {});
		},
	};
}

test("Creating a new component with a config", () => {
	const { cleanup } = setup("__mocks__/normal");

	const outputFile = path.resolve(
		process.cwd(),
		"src/components/Hello/Hello.jsx"
	);

	return baguette({
		name: "Hello",
		template: "react",
	})
		.then(() => {
			return fs
				.access(outputFile)
				.then(() => fs.readFile(outputFile, "utf-8"))
				.then((contents) => {
					expect(contents).toContain("Hello");
					expect(contents).not.toContain("Baguette");
				})
				.catch((e) => {
					throw new Error("Test failed, templates not created");
				});
		})
		.then(cleanup);
});

test("Creating a new component with a config, but passing in dest", () => {
	const { cleanup } = setup("__mocks__/supplied_dest");

	const outputFile = path.resolve(process.cwd(), "src/react/Hello/Hello.jsx");

	return baguette({
		name: "Hello",
		template: "react",
		dest: "src/react",
	}).then(() => {
		return (
			fs
				.access(outputFile)
				.then(() => fs.readFile(outputFile, "utf-8"))
				.then((contents) => {
					expect(contents).toContain("Hello");
					expect(contents).not.toContain("Baguette");
				})
				// checks that the config.json was not used
				.then(() =>
					fs
						.access(
							path.resolve(process.cwd(), "src/components/Hello/Hello.jsx")
						)
						.catch((err) => {
							expect(err.code).toBe("ENOENT");
						})
				)
				.catch((e) => {
					throw new Error("Test failed, templates not created");
				})
				.then(cleanup)
		);
	});
});

test("Creating a new component, without a config creates the component in the default dest (src)", () => {
	const { cleanup } = setup("__mocks__/no_config");

	const outputFile = path.resolve(process.cwd(), "src/Hello/Hello.jsx");

	return baguette({ name: "Hello", template: "react" }).then(() => {
		return fs
			.access(outputFile)
			.then(() => fs.readFile(outputFile, "utf-8"))
			.then((contents) => {
				// only can access if src/react/Hello.jsx exists
				expect(contents).toContain("Hello");
				expect(contents).not.toContain("Baguette");
			})
			.catch((e) => {
				throw new Error("Test failed, templates not created");
			})
			.then(cleanup);
	});
});

test("Creating a new component, with a malformed config, script exits with a log to the console", () => {
	const { logSpy } = setup("__mocks__/malformed_config");

	return baguette({}).then(() => {
		expect(logSpy).toHaveBeenCalledWith(
			font.error("Malformed JSON in config.json file")
		);
	});
});

test("Creating a new component, without any templates in baguettes folder, script exits with a log to the console", () => {
	const { logSpy } = setup("__mocks__/");

	return baguette({ name: "Hello", template: "react" }).then(() => {
		expect(logSpy).toHaveBeenCalledWith(
			font.error("No baguettes template folder found. You should create one.")
		);
	});
});

test("Creating a new component with config object and not outputting folder and everything works", () => {
	const { cleanup } = setup("__mocks__/no_folder");

	const outputFile = path.resolve(process.cwd(), "src/components/Hello.jsx");

	return baguette({
		name: "Hello",
		template: "react",
	}).then(() => {
		return fs
			.access(outputFile)
			.then(() => fs.readFile(outputFile, "utf-8"))
			.then((contents) => {
				expect(contents).toContain("Hello");
				expect(contents).not.toContain("Baguette");
			})
			.then(() =>
				fs
					.access(path.resolve(process.cwd(), "src/components/Hello/Hello.jsx"))
					.catch((err) => {
						expect(err.code).toBe("ENOENT");
					})
			)
			.catch((e) => {
				throw new Error("Test failed, templates not created");
			})
			.then(cleanup);
	});
});

test("Creating a new component with config object and CLI args and not outputting folder and everything works", () => {
	const { cleanup } = setup("__mocks__/no_folder_cli");
	const outputFile = path.resolve(process.cwd(), "src/different/Hello.jsx");

	return baguette({
		name: "Hello",
		template: "react",
		dest: "src/different",
		includeFolder: false,
	}).then(() => {
		return fs
			.access(outputFile)
			.then(() => fs.readFile(outputFile, "utf-8"))
			.then((contents) => {
				expect(contents).toContain("Hello");
				expect(contents).not.toContain("Baguette");
			})
			.then(() =>
				fs
					.access(path.resolve(process.cwd(), "src/different/Hello/Hello.jsx"))
					.catch((err) => {
						expect(err.code).toBe("ENOENT");
					})
			)
			.catch((e) => {
				throw new Error("Test failed, templates not created");
			})
			.then(cleanup);
	});
});
