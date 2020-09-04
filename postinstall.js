#!/usr/bin/env node
const path = require("path");
const font = require("./font");
const fs = require("fs").promises;

const packagePath = path.resolve(process.cwd(), "../../package.json");

console.log(
	font.task(
		"Running postinstall for baguetter, adding `baguette` script to package.json..."
	)
);

fs.readFile(packagePath, "utf-8")
	.then(JSON.parse)
	.then((pkg) => {
		return fs.writeFile(
			packagePath,
			JSON.stringify(
				{
					...pkg,
					scripts: {
						...pkg.scripts,
						baguette: "baguette",
					},
				},
				null,
				2
			)
		);
	})
	.then(() => console.log(font.success("`baguette` script installed!")))
	.catch((e) => {
		console.log(
			`Error, probably you don't have a package.json or something 🤷‍♂️`
		);
		console.log(e);
	});
