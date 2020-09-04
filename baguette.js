const path = require("path");
const fs = require("fs").promises;
const font = require("./font");
const TEMPLATE_KEYWORD_REGEX = "baguette";
const DEFAULT_DEST = "src";
const DEFAULT_NAME = "IDidntSupplyAName";

const DEFAULT_CONFIG = {
	dest: DEFAULT_DEST,
	includeFolder: true,
};

function createComponent({ name = DEFAULT_NAME, template, config }) {
	const { dest, includeFolder } = config;

	console.log(
		font.task(`👨‍🍳 Baking ${font.bold(name)}`),
		font.task(`from ${template} recipe in ${dest}\n`)
	);
	const templateDir = path.resolve(process.cwd(), "baguettes", template);
	const destDir = path.resolve(process.cwd(), dest, includeFolder ? name : "");
	const replacer = replaceComponentReferences(TEMPLATE_KEYWORD_REGEX, name);

	return fs
		.readdir(templateDir)
		.catch((e) => {
			if (e.message.includes("no such file or directory")) {
				throw new Error(
					"No baguettes template folder found. You should create one."
				);
			} else {
				throw e;
			}
		})
		.then((files) =>
			Promise.all([files, fs.mkdir(destDir, { recursive: true })])
		)
		.then(([files]) =>
			Promise.all(
				files.map((file) =>
					fs.copyFile(
						path.resolve(templateDir, file),
						path.resolve(destDir, replacer(file))
					)
				)
			)
		)
		.then(() => fs.readdir(destDir))
		.then((files) =>
			Promise.all(files.map(replaceFileContents(replacer, destDir)))
		)
		.then(() =>
			console.log(
				font.success(`\n🥖 ${font.bold(name)}`),
				font.success(`successfully baked in ${dest}\n`)
			)
		);
}

const replaceComponentReferences = (oldName, newName) => (str) =>
	str.replace(new RegExp(oldName, "ig"), newName);

const replaceFileContents = (replacer, dest) => (file) => {
	const destFile = path.resolve(dest, replacer(file));
	return fs
		.readFile(path.resolve(dest, file), { encoding: "utf-8" })
		.then(replacer)
		.then((data) => {
			console.log(
				font.task(`📝 Writing file ${destFile.replace(process.cwd(), "")}...`)
			);
			return fs.writeFile(destFile, data);
		});
};

function getConfig() {
	return fs
		.readFile(path.resolve(process.cwd(), "baguettes/config.json"), {
			encoding: "utf-8",
		})
		.then(JSON.parse)
		.catch((e) => {
			if (e instanceof SyntaxError) {
				throw new Error("Malformed JSON in config.json file");
			} else if (e.code === "ENOENT") {
				console.log(
					font.error(
						"No config.json file found in baguettes directory, using default config."
					)
				);
				return Promise.resolve({});
			}
		});
}

module.exports = function baguette({ name, template, ...options }) {
	return getConfig()
		.then((config) => {
			const mergedConfig =
				typeof config[template] === "string"
					? { ...DEFAULT_CONFIG, dest: config[template], ...options }
					: { ...DEFAULT_CONFIG, ...config[template], ...options };
			return createComponent({
				name,
				template,
				config: mergedConfig,
			});
		})
		.catch((e) => {
			console.log(font.error(e.message));
		});
};
