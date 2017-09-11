#!/usr/bin/env node

var commandLine = require('commander');
var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var pkg = require('../package.json');
var standalone = require('../index');
var colors = require('colors');
var minify = Promise.promisifyAll(require('html-minifier').minify);

var arg = process.argv;

// options
commandLine
	.version('standalone-html v' + pkg.version)
	.usage('[options] <full path to source html> --output <path>')
	.option('-o, --output <path>', 'full path to output file')
	.option('-e, --escape "[ regex ]"', 'ignore the given regular expression when minify')
	.option('-m, --minifyall', 'minify the html file, include all scripts, css & image')
	.option('-j, --justminify', 'minify the html')
	.parse(arg)


var html = commandLine.args[0];
var output = (commandLine.output === undefined) ? 'index_standalone.html' : commandLine.output;
var escapeChar = (commandLine.escape === undefined) ? '[]' : commandLine.escape;

var opt = {
	removeAttributeQuotes: false,
	minifyCSS: true,
	minifyJS: true,
	collapseWhitespace: true,
	removeComments: true,
	ignoreCustomFragments: eval(escapeChar)
};

if (!html) {
	commandLine.help();
} else {
	// ensure file exist and proceed or exit
	fs.stat(html, function (err, stat) {
		if (err === null) {
			console.log('');
			console.log('Target file : ' + html);
			console.log('');
			startApp();
		} else if (err.code == 'ENOENT') {
			console.log('File does not exist.'.red + ' Exit.');
			process.exit;
		} else {
			console.log('File error: ' + err.code + '. Exit.');
			process.exit;
		}
	});
}

function startApp() {
	var inputPath = path.dirname(html);
	var inputFile = fs.readFileSync(html, 'utf-8');
	var outputPath = output;
	var currentDir = process.cwd();

	if (output && html && commandLine.justminify) {
		minifyFile(inputFile, outputPath);
	} else if (output && html) {
		standalone.cli(inputPath, inputFile, outputPath, getOpt);
	} else {
		commandLine.help();
	}
}

//parse options 
function getOpt(resHtml, outputPath) {
	if (commandLine.minifyall) {
		console.log('');
		console.log('minify all. Process may take a few minutes with large file.');
		console.log('');
		minifyFile(resHtml, outputPath);
	} else {
		console.log('');
		console.log('Output file name : ' + outputPath);
		console.log('');
		writeFile(resHtml, outputPath);
	}
}

//minify the result
function minifyFile(resHtml, outputPath) {
	var resHtml = minify(resHtml, opt, function (err) {
		if (err) {
			console.error('error will processing file.');
		}
	});

	console.log('');
	console.log('Output file name : ' + outputPath);
	console.log('');
	writeFile(resHtml, outputPath);
}

//write result to file
function writeFile(resHtml, outputPath) {
	fs.writeFile(outputPath, resHtml, function (err) {
		if (err) {
			console.log('');
			console.log('File error: ' + err + '. Exit.');
		} else {
			console.log('');
			console.log('All done. Exit.'.green);
		}
	});
}
