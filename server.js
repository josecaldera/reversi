/* Include static file web server libary */
var static = require('node-static');

/* include http server library */
var http = require('http');

/* Assume that we are running on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* if we are not on heroku, then we need to redjust the port and directory */
if(typeof port == 'undefined' || !port){
directory = './public';
port = 8080;
}

/* set up a static web server that will deliver files from the fs */
var file = new static.Server(directory);

/* Construct an http server that gets files from the file server */
var app = http.createServer(
	function(request,response) {
		request.addListener('end',
			function() {
				file.serve(request,response);
			}
		).resume();
	}
).listen(port);
console.log('The server is running.');
