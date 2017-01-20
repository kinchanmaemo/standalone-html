#!/usr/bin/env node

var commandLine = require('commander');
var path = require('path');
var fs = require('fs');
var pkg = require('../package.json');
var standalone = require('../index');
var colors = require('colors');
var minify = require('minify');

var arg = process.argv;

// options
commandLine
	.version('standalone-html v' + pkg.version)
	.usage('[options] <full path to source html>')
	.option('-o, --output <directory>', 'full path to output file')
	.option('-m, --minify', 'minify the html file')
	.parse(arg)

var html = commandLine.args[0];
var output = commandLine.output ? commandLine.output : 'index_standalone.html';


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

	if (output && html) {
		standalone(inputPath, inputFile, outputPath, getOpt);
	} else {
		commandLine.help();
	}
}

//parse options 
function getOpt(resHtml, outputPath) {
	if (commandLine.minify) {
		console.log('minify all!');
		minifyFile(resHtml, outputPath);
	} else {
		writeFile(resHtml, outputPath);
	}
}

//minify the result
function minifyFile(resHtml, outputPath) {
	minify(resHtml, function(error, data) {
    if (error) {
		console.log('minify : ');
        console.error(error.message);
	}
    else {
        writeFile(data, outputPath);
	}
});
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
