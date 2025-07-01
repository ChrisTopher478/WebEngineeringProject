const path = require('path');
const http = require("http");
const fs = require("fs");
const url = require("url");

http.createServer((req, res) => {
	const parsedUrl = url.parse(req.url, true);
	let pathname = `.${parsedUrl.pathname}`;

	// Handle root
	if (pathname === './') pathname = './startPage.html';

	// Support .js, .css, .svg, etc.
	const ext = path.parse(pathname).ext;
	const map = {
		'.html': 'text/html',
		'.js': 'application/javascript',
		'.css': 'text/css',
		'.svg': 'image/svg+xml'
	};

	fs.readFile(pathname, function (err, data) {
		if (err) {
			// Try serving node_modules if it's not found
			const nodeModulePath = path.join(__dirname, pathname);
			fs.readFile(nodeModulePath, function (err2, data2) {
				if (err2) {
					res.writeHead(404);
					res.end(`404 Not Found: ${pathname}`);
				} else {
					res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
					res.end(data2);
				}
			});
		} else {
			res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
			res.end(data);
		}
	});
}).listen(8081);
console.log("Server running at http://localhost:8081/");