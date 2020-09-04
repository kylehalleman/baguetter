const reset = "\x1b[0m";

module.exports = {
	error: (str) => `🚨 \x1b[31m${str}${reset}`,
	success: (str) => `\x1b[32m${str}${reset}`,
	task: (str) => `\x1b[34m${str}${reset}`,
	bold: (str) => `\x1b[1m${str}\x1b[0m`,
};
