#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const EOL = require('os').EOL;

const copyFileAsync = promisify(fs.copyFile);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const CWD = process.env.INIT_CWD || process.cwd();

install()
	.then(() => console.log('Installation complete.'))
	.catch(function(error) {
		console.error('Error installing code formatting tools.', error);
		process.exit(1);
	});

async function configureHook() {
	console.log('Configuring pre-commit hook...');
	const packageFile = path.resolve(CWD, 'package.json');
	const packageJson = JSON.parse(await readFileAsync(packageFile));

	// Configure lint-staged
	const ls = Object.assign({}, packageJson['lint-staged'] || {});
	ls['*.(htm|html)'] = ['html-beautify -r --config .jsbeautifyrc', 'git add'];
	ls['*.(ts|js|json|scss|css)'] = ['pretty-quick --staged --config .prettierrc', 'git add'];
	packageJson['lint-staged'] = ls;

	// Configure pre-commit hook with husky
	const husky = Object.assign({}, packageJson.husky || {});
	const hooks = Object.assign({}, husky.hooks || {});
	hooks['pre-commit'] = 'lint-staged';
	husky.hooks = hooks;
	packageJson.husky = husky;

	// Configure npm scripts
	const scripts = Object.assign({}, packageJson.scripts || {});
	scripts['format:prettier'] = 'prettier --config .prettierrc --ignore-path "node_modules/**" --write "**/*.{ts,js,json,scss,css}"';
	scripts['format:beautify'] = 'html-beautify -r --config .jsbeautifyrc "src/**/*.{htm,html}"';
	scripts.format = 'npm run format:prettier && npm run format:beautify';
	packageJson.scripts = scripts;

	await writeFileAsync(packageFile, JSON.stringify(packageJson, null, '\t') + EOL);
}

async function configureLinting() {
	console.log('Configuring tslint...');
	const projectTslintFile = path.resolve(CWD, 'tslint.json');
	let projectTslintJson = {};
	if (fs.existsSync(projectTslintFile)) {
		projectTslintJson = JSON.parse(await readFileAsync(projectTslintFile));
	}
	const tslintJson = JSON.parse(await readFileAsync(path.resolve(__dirname, 'tslint.json')));
	const rules = Object.assign({}, projectTslintJson.rules || {}, tslintJson.rules);
	let rulesDirectory = projectTslintJson.rulesDirectory || [];
	if (typeof rulesDirectory === 'string') {
		rulesDirectory = [rulesDirectory];
	}
	if (
		!rulesDirectory.some(function(item) {
			return /codelyzer/.test(item);
		})
	) {
		rulesDirectory = rulesDirectory.concat(['node_modules/codelyzer']);
	}
	projectTslintJson.rulesDirectory = rulesDirectory;
	projectTslintJson.rules = rules;

	await writeFileAsync(projectTslintFile, JSON.stringify(projectTslintJson, null, '\t') + EOL);
}

async function copyJsBeautifyConfig() {
	console.log('Copying js-beautify config...');
	await copyFileAsync(path.resolve(__dirname, 'jsbeautify-config.json'), path.resolve(CWD, '.jsbeautifyrc'));
}

async function copyPrettierConfig() {
	console.log('Copying prettier config...');
	await copyFileAsync(path.resolve(__dirname, 'prettier-config.json'), path.resolve(CWD, '.prettierrc'));
	await copyFileAsync(path.resolve(__dirname, '.prettierignore'), path.resolve(CWD, '.prettierignore'));
}

async function copyEditorConfig() {
	console.log('Copying editorconfig...');
	await copyFileAsync(path.resolve(__dirname, '.editorconfig'), path.resolve(CWD, '.editorconfig'));
}

async function install() {
	// Make sure we're not installing in this project
	const packageName = '@imaginelearning/web-code-formatting';
	const packageJson = JSON.parse(await readFileAsync(path.resolve(CWD, 'package.json')));
	if (packageJson.name === packageName) {
		throw new Error('Cannot install inside ' + packageName + '.');
	}

	// Perform all the install steps
	await configureLinting();
	await copyJsBeautifyConfig();
	await copyPrettierConfig();
	await copyEditorConfig();
	await configureHook();
}
