const port = 11111;
const { URL } = require("url");
const { promisify } = require("util");
const shell = promisify(require("child_process").exec);
const headers = { "Content-Type": "application/json" };
const baseURL = "http://localhost:" + port;

const server = require("http").createServer(async (req, res) => {
	const url = new URL(req.url, baseURL);
	const path = url.pathname.split("/").filter(Boolean);
	if (!path.includes("ssd")) {
		res.writeHead(404, headers);
		res.end(JSON.stringify({
			statusCode: 404,
			data: null,
			error: {
				message: "Endpoint not found"
			},
			timestamp: Date.now()
		}));

		return;
	}

	let result;
	try {
		result = await shell("sudo du -sc /mnt/ssd", {
			timeout: 10_000
		});
	}
	catch (e) {
		res.writeHead(500, headers);
		return res.end(JSON.stringify({
			statusCode: 500,
			data: null,
			error: e.toString(),
			timestamp: Date.now()
		}));
	}

	const { stdout, stderr } = result;
	if (stderr) {
		res.writeHead(500, headers);
		return res.end(JSON.stringify({
			statusCode: 500,
			data: null,
			error: stderr,
			timestamp: Date.now()
		}));
	}

	const size = Number(stdout.split(/\s+/)[0]) * 1024;

	res.writeHead(200, headers);
	return res.end(JSON.stringify({
		statusCode: 200,
		data: { size },
		error: null,
		timestamp: Date.now()
	}));
});

server.listen(port);
console.log(`Listening on ${port}...`);
