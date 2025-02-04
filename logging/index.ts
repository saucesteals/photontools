const prefix = "[PHOTONTOOLS]";

export const createLogger = (name: string) => {
	return {
		// biome-ignore lint/suspicious/noExplicitAny: logger
		log: (...args: any[]) => {
			console.log(prefix, `[${name}]`, ...args);
		},
		// biome-ignore lint/suspicious/noExplicitAny: logger
		error: (...args: any[]) => {
			console.error(prefix, `[${name}]`, ...args);
		},
		// biome-ignore lint/suspicious/noExplicitAny: logger
		warn: (...args: any[]) => {
			console.warn(prefix, `[${name}]`, ...args);
		},
	};
};
