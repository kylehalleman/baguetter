#!/usr/bin/env node
const path = require("path");
const fs = require("fs").promises;
const [, , ...args] = process.argv;
const COMPONENT_TEMPLATE_NAME = "ComponentName";

function createComponent({ name, dest = "src/components" }) {
  console.log(`Creating components ${name} in ${dest}...`);
  const templateDir = path.resolve(__dirname, COMPONENT_TEMPLATE_NAME);
  const destDir = path.resolve(process.cwd(), dest, name);
  return fs
    .mkdir(destDir, {
      recursive: true,
    })
    .then(() => fs.readdir(templateDir))
    .then((files) =>
      Promise.all(
        files.map((file) =>
          fs.copyFile(
            path.resolve(templateDir, file),
            path.resolve(destDir, file)
          )
        )
      )
    )
    .then(() => fs.readdir(destDir))
    .then((files) => Promise.all(files.map(replaceFileContents(name, destDir))))
    .then(() => console.log("Done"));
}

const replaceComponentReferences = (oldName, newName) => (str) =>
  str.replace(new RegExp(oldName, "g"), newName);

const replaceFileContents = (name, dest) => (file) => {
  const filePath = path.resolve(dest, file);
  const replacer = replaceComponentReferences(COMPONENT_TEMPLATE_NAME, name);

  return fs
    .readFile(filePath, { encoding: "utf-8" })
    .then(replacer)
    .then((data) => fs.writeFile(filePath, data))
    .then(() => fs.rename(filePath, path.resolve(dest, replacer(file))));
};

let options = {};

switch (args.length) {
  case 0:
    return console.error("Need at least a component name");
  case 1:
    // just a name
    const componentName = args[0].split("=");
    options = { name: componentName[componentName.length - 1] };
    break;
  default:
    // named args
    options = args.reduce((acc, next) => {
      const [arg, value] = next.split("=");
      acc[arg.replace(/^--/, "")] = value;
      return acc;
    }, {});
}

createComponent(options);
