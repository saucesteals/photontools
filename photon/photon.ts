declare global {
	interface Window {
		taConfig: {
			show: {
				"pool-id": number;
				"pump-pool_id": number | null;
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
	let fmt: string;
	let mod = "";
	number = Number(number);
	if (number === 0) {
		fmt = "0";
	}
	if (number < 1) {
		fmt = number.toFixed(5);
	} else if (number < 1000) {
		fmt = number.toFixed(2);
	} else if (number < 1000000) {
		fmt = (number / 1000).toFixed(2);
		mod = "K";
	} else if (number < 1000000000) {
		fmt = (number / 1000000).toFixed(2);
		mod = "M";
	} else {
		fmt = (number / 1000000000).toFixed(2);
		mod = "B";
	}

	if (fmt.endsWith(".00")) {
		fmt = fmt.slice(0, -3);
	}

	return `${fmt}${mod}`;
};

export const getCurrentPoolId = () => {
	return window.taConfig.show["pool-id"] as number;
};

export const getAllPoolIds = () => {
	const poolIds = [getCurrentPoolId()];
	const pumpfunPoolId = window.taConfig.show["pump-pool_id"];
	if (pumpfunPoolId) {
		poolIds.push(pumpfunPoolId);
	}

	return poolIds;
};
