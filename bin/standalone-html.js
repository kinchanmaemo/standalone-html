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
	.usage('[options] <full path to source html>')
	.option('-o, --output <directory>', 'full path to output file')
	.option('-m, --minify', 'minify the html file')
	.option('-j, --justminify', 'minify the html file without include script and image')
	.parse(arg)

var html = commandLine.args[0];
var output = commandLine.output ? commandLine.output : 'index_standalone.html';

var opt = {
	removeAttributeQuotes: true,
	minifyCSS: true,
	minifyJS: true,
	collapseWhitespace: true
};

if (!html) {
	commandLine.help();
} else {
	// ensure file exist and proceed or exit
	fs.stat(html, function (err, stat) {
		if (err === null) {
			console.log('');
			console.log('Proceed file : ' + html);
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
		standalone(inputPath, inputFile, outputPath, getOpt);
	} else {
		commandLine.help();
	}
}

//parse options 
function getOpt(resHtml, outputPath) {
	if (commandLine.minify) {
		console.log('');
		console.log('minify all. Process may take a few minutes with large file.');
		minifyFile(resHtml, outputPath);
	} else {
		writeFile(resHtml, outputPath);
	}
}

//minify the result
function minifyFile(resHtml, outputPath) {
	var resHtml = minify(resHtml, opt, function(err) {
		if (err) {
			console.log('error will processing file.');
		}
	});

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
