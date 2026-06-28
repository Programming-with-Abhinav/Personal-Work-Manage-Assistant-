const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const root = path.resolve(__dirname, "..");
const port = process.env.PORT || 3000;

const mimeTypes = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
	try {
		const parsed = url.parse(req.url);
		let requestedPath = decodeURIComponent(parsed.pathname || "/");

		if (requestedPath === "/") requestedPath = "/home.html";

		const safePath = path
			.normalize(path.join(root, requestedPath))
			.replace(/^(\.\.[\/\\])+/, "");
		const filePath = path.resolve(root, safePath);

		if (!filePath.startsWith(root)) {
			res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("Forbidden");
			return;
		}

		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
				res.end("Not Found");
				return;
			}

			const ext = path.extname(filePath).toLowerCase();
			const type = mimeTypes[ext] || "application/octet-stream";

			res.writeHead(200, { "Content-Type": type });
			res.end(data);
		});
	} catch (error) {
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Server error");
	}
});

server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}/`);
});
