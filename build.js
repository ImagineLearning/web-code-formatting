#!/usr/bin/env node

const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const promisify = require('util').promisify;
const EOL = require('os').EOL;

const copyFileAsync = promisify(fs.copyFile);
const mkdirAsync = promisify(fs.mkdir);
const ncpAsync = promisify(ncp);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const CWD = process.env.INIT_CWD || process.cwd();

async function build(framework) {
	console.log('Building ' + framework + '...');
	const packageJson = JSON.parse(await readFileAsync(path.resolve(CWD, 'package.json')));
	const destPath = path.resolve(CWD, 'dist', 'web-code-formatting-' + framework);

	// Create destination directory
	await mkdirAsync(destPath, { recursive: true });

	// Copy config, install, and README files
	await ncpAsync(path.resolve(CWD, 'configs'), path.resolve(destPath, 'configs'));
	await copyFileAsync(path.resolve(CWD, 'README.md'), path.resolve(destPath, 'README.md'));

	// Copy install file and set framework variable
	let installFileContent = (await readFileAsync(path.resolve(CWD, 'install.js'))).toString('utf8');
	installFileContent = installFileContent.replace('process.argv[2]', "'" + framework + "'");
	await writeFileAsync(path.resolve(destPath, 'install.js'), installFileContent);

	// Copy appropriate package.json file
	const frameworkPackageJson = JSON.parse(await readFileAsync(path.resolve(CWD, framework, 'package.json')));
	frameworkPackageJson.version = packageJson.version;
	await writeFileAsync(path.resolve(destPath, 'package.json'), JSON.stringify(frameworkPackageJson, null, '\t') + EOL);
}

Promise.all([build('angular'), build('react')])
	.then(() => {
		console.log('Build complete.');
	})
	.catch((err) => {
		console.error(err);
	});
