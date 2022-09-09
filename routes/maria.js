// noinspection JSUnusedGlobalSymbols

const { promisify } = require("util");
const shell = promisify(require("child_process").exec);

const memoryIdentifiers = ["VmRSS", "VmSwap"];

module.exports = {
	memoryUsage: async function () {
		let result;
		try {
			const pidResult = await shell("pidof mysqld", { timeout: 5_000 });
			const pid = pidResult.stdout.trim();
			if (!pid) {
				return {
					statusCode: 500,
					error: "No mysql process is currently running"
				};
			}

			const memoryResult = await shell(`cat /proc/${pid}/status`, { timeout: 5_000 });
			const memoryResultArray = memoryResult.stdout.trim().split(/\n/).filter(Boolean);

			const values = memoryResultArray.filter(i => memoryIdentifiers.includes(i));
			result = Object.fromEntries(values.map(i => {
				const [identifier, memory] = i.replace(":", "").split(/\s+/).filter(Boolean);
				return [
					identifier,
					Number(memory) * 1024
				];
			}));
		}
		catch (e) {
			return {
				statusCode: 500,
				error: e.message
			};
		}

		return {
			statusCode: 200,
			data: { ...result }
		};
	}
};
