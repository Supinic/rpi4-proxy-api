const port = 11111;
const baseURL = `http://localhost:${port}/proxy`;

const definition = {};
const subroutes = [
	["ssd", "ssd.js"]
];

for (const [route, file] of subroutes) {
	definition[route] = require(`./routes/${file}`);
}

const server = require("http").createServer(async (req, res) => {
	const url = new URL(req.url, baseURL);
	const path = url.pathname.split("/").filter(Boolean);

	let target = definition[path[0]];
	for (let i = 1; i < path.length; i++) {
		target = target?.[path[i]];
	}

	if (!target) {
		res.writeHead(404, { "Content-Type": "application/json" });
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
	else if (typeof target !== "function") {
		throw new Error(`Internal API error - invalid definition for path ${path.join("/")}`);
	}

	const { error = null, data = null, headers = {}, statusCode = 200 } = await target(req, res, url);
	res.writeHead(statusCode, headers);
	res.end(JSON.stringify({
		statusCode,
		data,
		error,
		timestamp: Date.now()
	}));
});

server.listen(port);
console.log(`Listening on ${port}...`);
