# Imagine Learning: web-code-formatting
This package contains Imagine Learning standardized formatting configuration files for [Prettier](https://prettier.io) and [JS Beautifier](https://github.com/beautify-web/js-beautify).

## EditorConfig
[EditorConfig](https://editorconfig.org/) is used to tell your editor how to view and format files. GitHub also uses the `.editorconfig` file when displaying files.

## Prettier
[Prettier](https://github.com/prettier/prettier) is used for formatting all TypeScript, JavaScript, JSON, SASS, and CSS files.

### Configuration
When installed, this package will add a `.prettierrc` file in the root directory of the project.
This will allow your IDE to access the configuration if you are using a Prettier plugin, such as those created for [VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) or [WebStorm](https://plugins.jetbrains.com/plugin/10456-prettier).
You can [customize the configuration](https://prettier.io/docs/en/configuration.html), but keep in mind that it will be overwritten the next time this package is installed.

Along with the `.prettierrc` file there is a `.prettierignore` file created at installation.
This is used to [specify files that should be ignored](https://prettier.io/docs/en/ignore.html#ignoring-files) by Prettier. By default it ignores `*.htm` and `*.html` files, since those will be formatted by [JS Beautifier](#js-beautifier).

### Scripts
This package creates an NPM script for running Prettier on demand.
You can run Prettier to format all TypeScript, JavaScript, JSON, SASS, and CSS files in your project with the following command:
```bash
npm run format:prettier
```

## JS Beautifier
[JS Beautifier](https://github.com/beautify-web/js-beautify) is used for formatting all HTML files.

### Configuration
When installed, this package will add a `.jsbeautifyrc` file in the root directory of the project.
This will allow your IDE to access the configuration if you are using a JS Beautifier plugin.
You can [customize the configuration](https://github.com/beautify-web/js-beautify#options), but keep in mind that it will be overwritten the next time this package is installed.

### Scripts
This package creates an NPM script for running JS Beautifier on demand.
You can run JS Beautifier to format all HTML files in your project with the following command:
```bash
npm run format:beautify
```

### VS Code Plugin
VS Code uses JS Beautifier as its default formatter out-of-the-box.
However, to you need to install the [Beautify](https://marketplace.visualstudio.com/items?itemName=HookyQR.beautify) plugin for it to use the settings in your project's `.jsbeautifyrc` file.
After installing the plugin, you can add the following to either your global `settings.json` file or the workspace's `settings.json` file to configure the plugin as the formatter for HTML files:
```
{
    "[html]": {
        "editor.defaultFormatter": "HookyQR.beautify"
    }
}
```

## TSLint
[TSLint](https://github.com/palantir/tslint) is used for enforcing coding standards.
When installed, this package will update any existing `tslint.json` file, or create a new one if it doesn't exist.
This file is pre-configured with the official Angular linting rules as well rules specific to Imagine Learning.

## Pre-Commit Hooks
When installed, this package will update the `package.json` file to include configuration for pre-commit hooks using [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged). These hooks will format your code files prior to committing, using Prettier and JS Beautifier as configured in their respective `.*rc` files.

## Dependencies
In order to use all the features provided by this package, you will need to install the following peer dependencies:
- codelyzer,
- husky
- js-beautify
- lint-staged
- prettier
- pretty-quick
- tslint

This can be done by running the following command:
```bash
npm i -D codelyzer husky js-beautify lint-staged prettier pretty-quick tslint
```
