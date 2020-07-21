# baguetter

A simple script to generate new components and modules from a template you create.

## Install

**Note:** Requires Node 12.10 or great (just really wanted an easy recursive `rmdir`).

`npm install --save-dev baguetter`

## Use

If you didn't allow `postinstall` scripts to run, add the following to your `scripts` in `package.json`:

```
"baguette": "baguette"
```

If you did allow `postinstall` to run, this script will already be there for you.

Run `npm run baguette -- [template] [name] [dest]` to generate new modules from templates you create!

**…but you'll need to create those templates first** 👇

## Creating templates (a.k.a baguettes)

Create a folder in the root of your project called `baguettes`. Inside this folder, create a new folder for each type of template you want. For example, if you are going to have Node and React templates:

```
./baguettes
├── config.json
├── node
│   ├── baguette.js
│   ├── baguette.test.js
│   └── index.js
└── react
    ├── Baguette.jsx
    ├── Baguette.md
    ├── Baguette.module.scss
    ├── Baguette.stories.js
    ├── Baguette.test.js
    └── index.js
```

Inside these files, you can write whatever template you want, just write "Baguette" or "baguette" wherever you'd like to replace it with your new component or module name. You can have as many or as few files as you want.

An example of the inside of Baguette.jsx might be:

```jsx
import React from "react";
import styles from "./Baguette.module.scss";

function Baguette(props) {
  return <div />;
}

export default Baguette;
```

## Configuration

To choose where your files end up, you can pass in `--dest=path/to/output` on the command line, or you can place a `config.json` file in your `baguettes` folder. This is a simple object with the keys being the template names (e.g. `react` or `node` in our earlier example), and the values being the path to the output. See this example:

```
{
  "react": "src/components",
  "node": "src/server"
}
```

Even if you have a config set, you can always override it by passing in the `dest` argument on the command line.

## Running

Now that you have some templates created, run your script again:

```
npm run baguette -- react HelloWorld
```

Or using named arguments:

```
npm run baguette -- --template=react --name=HelloWorld --dest=path/to/output
```
