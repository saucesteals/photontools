declare global {
	interface Window {
		taConfig: {
			show: {
				"pool-id": number;
			};
		};
	}
}

export interface Wallet {
	address: string;
	nickname: string;
	symbol: string;
	color: string;
	imageUrl?: string;
}

export const parseHumanReadableNumber = (text: string) => {
	if (text.startsWith("$")) {
		text = text.slice(1);
	}

	let number = Number.parseFloat(text);
	if (text.endsWith("K")) {
		number *= 1000;
	} else if (text.endsWith("M")) {
		number *= 1000000;
	} else if (text.endsWith("B")) {
		number *= 1000000000;
	} else if (text.endsWith("T")) {
		number *= 1000000000000;
	}
	return number;
};

export const getPoolId = () => {
	return window.taConfig.show["pool-id"] as number;
};
