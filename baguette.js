const path = require("path");
const fs = require("fs").promises;
const font = require("./font");
const TEMPLATE_KEYWORD_REGEX = "baguette";
const DEFAULT_DEST = "src";
const DEFAULT_NAME = "IDidntSupplyAName";

function createComponent({
	name = DEFAULT_NAME,
	template,
	dest = DEFAULT_DEST,
}) {
	console.log(
		font.task(`👨‍🍳 Baking ${font.bold(name)}`),
		font.task(`from ${template} recipe in ${dest}\n`)
	);
	const templateDir = path.resolve(process.cwd(), "baguettes", template);
	const destDir = path.resolve(process.cwd(), dest, name);
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

const isAllCaps = (str) => str === str.toUpperCase();
const isLowerCase = (str) => str === str.toLowerCase();
const isCapitalized = (str) => {
	const [first, ...rest] = str.split("");
	const trail = rest.join("");
	return first === first.toUpperCase() && trail === trail.toLowerCase();
};
const capitalize = (str) => {
	const [first, ...rest] = str.split("");
	const trail = rest.join("");
	return first.toUpperCase() + trail.toLowerCase();
};

const replaceComponentReferences = (oldName, newName) => (str) =>
	str.replace(new RegExp(oldName, "ig"), (match) => {
		if (isAllCaps(match)) {
			return newName.toUpperCase();
		} else if (isLowerCase(match)) {
			return newName.toLowerCase();
		} else if (isCapitalized(match)) {
			return capitalize(newName);
		} else {
			return newName;
		}
	});

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

module.exports = function baguette({ name, template, dest }) {
	if (dest) {
		// don't need config if there's a dest chosen
		return createComponent({ name, template, dest }).catch((e) => {
			console.log(font.error(e.message));
		});
	} else {
		return getConfig()
			.then((config) => {
				return createComponent({
					name,
					template,
					dest: config[template] || DEFAULT_DEST,
				});
			})
			.catch((e) => {
				console.log(font.error(e.message));
			});
	}
};
