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

export const formatHumanReadableNumber = (number: number | string) => {
	number = Number(number);
	if (number < 1) {
		return number.toFixed(5);
	}
	if (number < 1000) {
		return number.toFixed(2);
	}
	if (number < 1000000) {
		return `${(number / 1000).toFixed(2)}K`;
	}
	if (number < 1000000000) {
		return `${(number / 1000000).toFixed(2)}M`;
	}
	return `${(number / 1000000000).toFixed(2)}B`;
};

export const getPoolId = () => {
	return window.taConfig.show["pool-id"] as number;
};
