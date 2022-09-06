const { promisify } = require("util");
const shell = promisify(require("child_process").exec);

module.exports = {
	size: async function () {
		let result;
		try {
			result = await shell("sudo du -sc /mnt/ssd", {
				timeout: 10_000
			});
		}
		catch (e) {
			return {
				statusCode: 500,
				error: e.message
			};
		}

		const { stdout, stderr } = result;
		if (stderr) {
			return {
				statusCode: 500,
				error: stderr
			};
		}

		const size = Number(stdout.split(/\s+/)[0]) * 1024;
		return {
			statusCode: 200,
			data: { size }
		};
	}
};
