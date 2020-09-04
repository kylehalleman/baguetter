const baguette = require("./baguette");

const path = require("path");
const fs = require("fs").promises;

const font = require("./font");

describe("baguette", () => {
	let log;

	beforeEach(() => {
		// reduce all the extra log statements
		log = jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	afterAll(() => {
		const mocksFolder = path.resolve(process.cwd(), "__mocks__");

		return fs.readdir(mocksFolder).then((folders) =>
			Promise.all(
				folders.map((folder) => {
					const srcPath = path.resolve(mocksFolder, folder, "src");

					return fs
						.access(srcPath)
						.then(() => fs.rmdir(srcPath, { recursive: true }))
						.catch(() => {});
				})
			)
		);
	});

	xdescribe("Creating a new component but not supplying a name", () => {
		test("A default name is giving for the templates");
	});

	describe("Creating a new component with a config and everything works", () => {
		test("Looks up the config from user’s config.json file", () => {
			const parse = jest.spyOn(JSON, "parse");

			jest.spyOn(process, "cwd").mockReturnValue("__mocks__/normal");

			const outputFile = path.resolve(
				process.cwd(),
				"src/components/Hello/Hello.jsx"
			);

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
						expect(parse).toHaveBeenCalled();
					})
					.catch((e) => {
						throw new Error("Test failed, templates not created");
					});
			});
		});
	});

	describe("Creating a new component with a config, but passing in dest", () => {
		test("Does not attempt to lookup config.json, creates component in specified dest folder", () => {
			const parse = jest.spyOn(JSON, "parse");

			jest.spyOn(process, "cwd").mockReturnValue("__mocks__/supplied_dest");

			const outputFile = path.resolve(
				process.cwd(),
				"src/react/Hello/Hello.jsx"
			);

			return baguette({
				name: "Hello",
				template: "react",
				dest: "src/react",
			}).then(() => {
				return fs
					.access(outputFile)
					.then(() => fs.readFile(outputFile, "utf-8"))
					.then((contents) => {
						expect(contents).toContain("Hello");
						expect(contents).not.toContain("Baguette");
						expect(parse).not.toHaveBeenCalled();
					})
					.catch((e) => {
						throw new Error("Test failed, templates not created");
					});
			});
		});
	});

	describe("Creating a new component, without a config", () => {
		test("Creates the component in the default dest (src)", () => {
			jest.spyOn(process, "cwd").mockReturnValue("__mocks__/no_config");

			const outputFile = path.resolve(process.cwd(), "src/Hello/Hello.jsx");

			return baguette({ name: "Hello", template: "react" }).then(() => {
				return fs
					.access(outputFile)
					.then(() => fs.readFile(outputFile, "utf-8"))
					.then((contents) => {
						// only can access if src/react/Hello.jsx exists
						expect(contents).toContain("Hello");
						expect(contents).not.toContain("Baguette");
						expect(log).toHaveBeenNthCalledWith(
							1,
							font.error(
								"No config.json file found in baguettes directory, using default config."
							)
						);
					})
					.catch((e) => {
						throw new Error("Test failed, templates not created");
					});
			});
		});
	});

	describe("Creating a new component, with a malformed config", () => {
		test("The script exits with a log to the console", () => {
			jest.spyOn(process, "cwd").mockReturnValue("__mocks__/malformed_config");

			return baguette({}).then(() => {
				expect(log).toHaveBeenCalledWith(
					font.error("Malformed JSON in config.json file")
				);
			});
		});
	});

	describe("Creating a new component, without any templates in baguettes folder", () => {
		test("The script exits with a log to the console", () => {
			jest.spyOn(process, "cwd").mockReturnValue("__mocks__");

			return baguette({ name: "Hello", template: "react" }).then(() => {
				expect(log).toHaveBeenCalledWith(
					font.error(
						"No baguettes template folder found. You should create one."
					)
				);
			});
		});
	});

	test.only("Creates the template, keeping the case of the substituted name", () => {
		const parse = jest.spyOn(JSON, "parse");

		jest.spyOn(process, "cwd").mockReturnValue("__mocks__/normal");

		const outputFile = path.resolve(
			process.cwd(),
			"src/ducks/helloWorld/helloWorld.js"
		);

		return baguette({
			name: "helloWorld",
			template: "duck",
		}).then(() => {
			return fs
				.access(outputFile)
				.then(() => fs.readFile(outputFile, "utf-8"))
				.then((contents) => {
					expect(contents).toContain("helloWorld");
					expect(contents).toContain("getHelloWorld");
					expect(contents).not.toContain("gethelloworld");
					expect(contents).not.toContain("baguette");
					expect(parse).toHaveBeenCalled();
				})
				.catch((e) => {
					throw new Error(e);
				});
		});
	});
});
