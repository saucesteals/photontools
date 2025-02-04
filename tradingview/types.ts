declare global {
	interface ChartApiInstance {
		getMarks: (
			pair: string,
			from: number,
			to: number,
			callback: (result: Mark[]) => void,
			// biome-ignore lint/suspicious/noExplicitAny: ignore
			v: any,
		) => void;
	}

	interface Window {
		inst: {
			activeChart: () => {
				_chartWidget: {
					refreshMarks: () => void;
				};
			};
			_iFrame: {
				contentWindow: {
					ChartApiInstance: ChartApiInstance;
				};
			};
		};
	}
}

export interface Mark {
	id: string;
	time: number;
	labelFontColor: string;
	minSize: number;
	data: MarkData;
	color: MarkColor;
	label: string;
	text: string[];
	tickmark: number;
	highlightByAuthor: boolean;
}

export interface MarkData {
	type: string;
	timestamp: number;
	id: string;
	usdAmount: string;
	priceUsd: string;
	priceQuote: string;
	tokensAmount: string;
	eventType: string;
	maker: string;
}

export interface MarkColor {
	background: string;
	border: string;
}
