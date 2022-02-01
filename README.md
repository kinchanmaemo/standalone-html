# standalone-html

> include all external css/js and encode image in base64 into a single html file.


## Installation

You can use npm package to get module installed
```
$ npm install -g standalone-html
```

## CLI Usage 
```
$ standalone [options] foo.html --output mySinglePage.html
$ standalone -m /full/path/to/source.html -o /other/path/to/result.html -e "[ regex ]"
$ standalone -j /full/path/to/index.html 
```

If output filename is not given, it will be named '_index_standalone.html_' by default.


  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -e, --escape "[ regex ]"  ignore the given regular expression when minify
    -o, --output              full path to output file
    -m, --minifyall           minify the html file, include all scripts, css & image
    -j, --justminify          minify the html file


## API Usage 
```
var standalone = require('standalone-html').api;

var regex = '[ /someChar/ ]'; // leave it empty if no regular expression is needed

standalone('/full/path/to/source.html', '/path/to/output.html', regex , function(err){
  if (err) {
    // handle error
  }  
	console.log('All done!');
});
```
