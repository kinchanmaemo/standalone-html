var fs = require('fs');
var prog = require('commander');
var path = require('path');
var cheerio = require("cheerio");
var cssB64 = require('css-b64-images');
var colors = require('colors');

var imageTypes = {
	".png": "image/png",
	".gif": "image/gif",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".bmp": "image/bmp",
	".webp": "image/webp"
}

var standalone = function (inputPath, inputFile, outputPath, writeFile) {
	var $ = cheerio.load(inputFile);
	$('html').find('link').each(function () {
		if ($(this).attr('href')) {
			var RawCssPath = $(this).attr('href');
			var RawCssType = $(this).attr('type') ? $(this).attr('type') : 'undefined';
			var csspath = path.join(inputPath, RawCssPath);
			// check if not a web link
			if (RawCssPath.slice(0, 4) !== "http" && path.extname(RawCssPath) === '.css') {
				if (fs.existsSync(csspath)) {
					$(this).remove();
					console.log('css : '.red + csspath);
					cssB64.fromString(csspath, path.resolve(path.dirname(csspath)), path.resolve(path.dirname(inputPath)), function (err, css) {
						if (err) {
							console.error(err);
						} else {
							$('html').find('head').last().append('<style>' + fs.readFileSync(csspath, 'utf-8') + '</style>');
						}
					});
				} else {
					console.log('File does not found.'.red + ' skip.');
					$(this).remove();
				}
			} else if (RawCssPath.slice(0, 4) !== "http" && RawCssType.slice(0, 5) === 'image') {
				if (fs.existsSync(csspath)) {
					console.log('link icon : '.cyan + csspath);
					var imgpath = path.join(inputPath, RawCssPath);
					var img = fs.readFileSync(imgpath);
					var contentType = imageTypes[path.extname(imgpath)] || 'image/png'
					var dataUri = "data:" + contentType + ";base64," + img.toString("base64");
					$(this).attr('href', dataUri);
				} else {
					console.log('File does not found.'.red + ' skip.');
					$(this).remove();
				}
			}
		}
	});

	$('html').find('img').each(function () {
		if ($(this).attr('src')) {
			var RawImgPath = $(this).attr('src');
			var imgpath = path.join(inputPath, RawImgPath);
			if (fs.existsSync(imgpath)) {
				var img = fs.readFileSync(imgpath);
				var contentType = imageTypes[path.extname(imgpath)] || 'image/png';
				var dataUri = "data:" + contentType + ";base64," + img.toString("base64");

				$(this).attr('src', dataUri);
				console.log('img : '.yellow + imgpath);
			} else {
				console.log('File does not found.'.red + ' skip.');
			}
		}
	});

	$('html').find('script').each(function () {
		if ($(this).attr('src')) {
			var RawJsPath = $(this).attr('src');
			var jspath = path.join(inputPath, RawJsPath);
			fs.stat(jspath, function (err, stat) {
				if (err === null) {
					$(this).remove();
					console.log('js : '.green + jspath);
					$('html').find('body').last().append('<script>' + fs.readFileSync(jspath, 'utf-8') + '</script>');
				} else if (err.code == 'ENOENT') {
					console.log('File does not found.'.red + ' skip.');
					$(this).remove();
				} else {
					console.log('File does not found.'.red + ' skip.');
					$(this).remove();
				}
			});
		}
	});
	writeFile($.html(), outputPath);
}

module.exports = standalone;
