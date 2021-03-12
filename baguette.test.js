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

test("I can use a JSON config to create new modules.", () => {
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

test("I can pass in a `dest` on the command line even if I have a config.", () => {
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

test("I can create modules without a config, relying on the default `src` output.", () => {
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

test("If I have an invalid config, the script lets me know and doesn’t run.", () => {
	const { logSpy } = setup("__mocks__/malformed_config");

	return baguette({}).then(() => {
		expect(logSpy).toHaveBeenCalledWith(
			font.error("Malformed JSON in config.json file")
		);
	});
});

test("If I don’t have any templates, the script lets me know and doesn’t run.", () => {
	const { logSpy } = setup("__mocks__/");

	return baguette({ name: "Hello", template: "react" }).then(() => {
		expect(logSpy).toHaveBeenCalledWith(
			font.error("No baguettes template folder found. You should create one.")
		);
	});
});

test("I can choose to omit the module folder when generating a new module.", () => {
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

test("I can override my JSON config with CLI arguments.", () => {
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

test("I can have template folders with nested folders", () => {
	const { cleanup } = setup("__mocks__/nested");

	const outputFile = path.resolve(
		process.cwd(),
		"src/server/hello/nested/hello.js"
	);

	return baguette({
		name: "hello",
		template: "node",
	})
		.then(() => {
			return fs
				.access(outputFile)
				.then(() => fs.readFile(outputFile, "utf-8"))
				.then((contents) => {
					expect(contents).toContain("hello");
					expect(contents).not.toContain("baguette");
				})
				.catch((e) => {
					throw new Error("Test failed, templates not created");
				});
		})
		.then(cleanup);
});
