#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const EOL = require('os').EOL;

const copyFileAsync = promisify(fs.copyFile);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const CWD = process.env.INIT_CWD || process.cwd();

const framework = process.argv[2];

if (!framework) {
	console.error('No framework specified');
	process.exit(1);
}

install(framework)
	.then(() => console.log('Installation complete.'))
	.catch(function (error) {
		console.error('Error installing code formatting tools.', error);
		process.exit(1);
	});

async function configureHook(framework) {
	console.log('Configuring pre-commit hook...');
	const packageFile = path.resolve(CWD, 'package.json');
	const packageJson = JSON.parse(await readFileAsync(packageFile));

	const prettierExtensions = ['ts', 'js', 'json', 'scss', 'css'];
	if (framework === 'react') {
		prettierExtensions.push('tsx');
	}

	// Configure lint-staged
	const ls = Object.assign({}, packageJson['lint-staged'] || {});
	ls['*.(htm|html)'] = 'html-beautify -r --config .jsbeautifyrc';
	ls['*.(' + prettierExtensions.join('|') + ')'] = 'pretty-quick --staged --config .prettierrc';
	packageJson['lint-staged'] = ls;

	// Configure pre-commit hook with husky
	const husky = Object.assign({}, packageJson.husky || {});
	const hooks = Object.assign({}, husky.hooks || {});
	hooks['pre-commit'] = 'lint-staged';
	husky.hooks = hooks;
	packageJson.husky = husky;

	// Configure npm scripts
	const scripts = Object.assign({}, packageJson.scripts || {});
	scripts['format:prettier'] =
		'prettier --config .prettierrc --ignore-path "node_modules/**" --write "**/*.{' + prettierExtensions.join(',') + '}"';
	scripts['format:beautify'] = 'html-beautify -r --config .jsbeautifyrc "src/**/*.{htm,html}"';
	scripts.format = 'npm run format:prettier && npm run format:beautify';
	packageJson.scripts = scripts;

	await writeFileAsync(packageFile, JSON.stringify(packageJson, null, '\t') + EOL);
}

async function configureEsLint() {
	console.log('Configuring eslint...');
	const projectEslintFile = path.resolve(CWD, '.eslintrc');
	let projectEslintJson = {};
	if (fs.existsSync(projectEslintFile)) {
		projectEslintJson = JSON.parse(await readFileAsync(projectEslintFile));
	}
	const eslintJson = JSON.parse(await readFileAsync(path.resolve(__dirname, 'config', 'eslint.json')));

	// Merge "extends" property
	const extendsProp = eslintJson.extends.reduce((accumulator, item) => {
		if (accumulator.findIndex(item) < 0) {
			return accumulator.concat([item]);
		}
		return accumulator;
	}, projectEslintJson.extends || []);
	projectEslintJson.extends = extendsProp;

	// Merge "overrides" property
	const overridesProp = eslintJson.overrides.reduce((accumulator, item) => {
		const index = accumulator.findIndex((i) => i.files === item.files);
		if (index < 0) {
			return accumulator.concat([item]);
		}
		const rules = Object.assign({}, accumulator[index].rules, item.rules);
		const updated = accumulator.slice();
		updated[index].rules = rules;
		return updated;
	}, projectEslintJson.overrides || []);

	// Merge "rules" property
	const rules = Object.assign({}, projectEslintJson.rules || {}, eslintJson.rules);
	projectEslintJson.rules = rules;

	await writeFileAsync(projectEslintFile, JSON.stringify(projectEslintJson, null, '\t') + EOL);
}

async function configureTsLint() {
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
		!rulesDirectory.some(function (item) {
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

async function install(framework) {
	// Make sure we're not installing in this project
	const packageName = '@imaginelearning/web-code-formatting';
	const packageJson = JSON.parse(await readFileAsync(path.resolve(CWD, 'package.json')));
	if (packageJson.name === packageName) {
		throw new Error('Cannot install inside ' + packageName + '.');
	}

	// Perform all the install steps
	if (framework === 'react') {
		await configureEsLint();
	} else {
		await configureTsLint();
	}
	await copyJsBeautifyConfig();
	await copyPrettierConfig();
	await copyEditorConfig();
	await configureHook(framework);
}
