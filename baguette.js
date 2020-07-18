const path = require("path");
const fs = require("fs").promises;
const TEMPLATE_KEYWORD_REGEX = "baguette";

const reset = "\x1b[0m";

const font = {
  error: (str) => `🚨 \x1b[31m${str}${reset}`,
  success: (str) => `\x1b[32m${str}${reset}`,
  task: (str) => `\x1b[34m${str}${reset}`,
  bold: (str) => "\033[1m" + str + "\033[0m",
};

function createComponent({ name, template, dest = "src" }) {
  console.log(
    font.task(`👨‍🍳 Baking ${font.bold(name)}`),
    font.task(`from ${template} recipe in ${dest}\n`)
  );
  const templateDir = path.resolve(process.cwd(), "baguettes", template);
  const destDir = path.resolve(process.cwd(), dest, name);
  const replacer = replaceComponentReferences(TEMPLATE_KEYWORD_REGEX, name);

  return Promise.all([
    fs.mkdir(destDir, { recursive: true }),
    fs.readdir(templateDir),
  ])
    .then(([, files]) => {
      return Promise.all(
        files.map((file) =>
          fs.copyFile(
            path.resolve(templateDir, file),
            path.resolve(destDir, replacer(file))
          )
        )
      );
    })
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
        console.log(font.error("Malformed JSON in config.json file"));
      } else if (e.code === "ENOENT") {
        console.log(
          font.error("No config.json file found in baguettes directory")
        );
      } else {
        console.log(font.error(e));
      }
      process.exit(0);
    });
}

module.exports = function baguette({ name, template, dest }) {
  if (dest) {
    // don't need config if there's a dest chosen
    return createComponent({ name, template, dest });
  } else {
    return getConfig().then((config) => {
      if (config[template]) {
        return createComponent({ name, template, dest: config[template] });
      } else {
        console.warn(
          font.error(
            `No dest directory found in config for template ${template}`
          )
        );
        process.exit(0);
      }
    });
  }
};
