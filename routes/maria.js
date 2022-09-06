// noinspection JSUnusedGlobalSymbols

const { promisify } = require("util");
const shell = promisify(require("child_process").exec);

module.exports = {
	memoryUsage: async function () {
		let memory;
		try {
			const pidResult = await shell("pidof mysqld", { timeout: 5_000 });
			const pid = pidResult.stdout;
			if (!pid) {
				return {
					statusCode: 500,
					error: "No mysql process is currently running"
				};
			}

			const memoryResult = await shell(`cat /proc/${pid}/status | grep VmRss`, { timeout: 5_000 });
			const memoryResultArray = memoryResult.split(/\s+/).filter(Boolean);

			memory = Number(memoryResultArray[1]) * 1024;
		}
		catch (e) {
			return {
				statusCode: 500,
				error: e.message
			};
		}

		return {
			statusCode: 200,
			data: { memory }
		};
	}
};
