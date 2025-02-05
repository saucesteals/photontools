import { createLogger } from "~logging";
import type { Swap } from "~photon/cable";
import { type Wallet, formatHumanReadableNumber } from "~photon/photon";
import type { Mark } from "./types";

const log = createLogger("tradingview/chart");

export class Chart {
	private marks: Mark[];
	private minMarkSize: number;

	constructor(minMarkSize: number) {
		this.marks = [];
		this.minMarkSize = minMarkSize;
	}

	getMarks() {
		return this.marks;
	}

	setMarks(marks: Mark[]) {
		log.log("Setting marks", marks);
		this.marks = marks;
		this.refresh();
	}

	addMark(mark: Mark) {
		log.log("Adding mark", mark);
		this.marks.push(mark);
		this.refresh();
	}

	addTrade(wallet: Wallet, swap: Swap) {
		const background = swap.type === "buy" ? wallet.color : "#F23645";
		const text = `#${(0xffffff ^ Number.parseInt(background.slice(1), 16))
			.toString(16)
			.padStart(6, "0")}`;

		this.addMark({
			id: swap.id,
			time: swap.timestamp,
			labelFontColor: text,
			imageUrl: wallet.imageUrl,
			minSize: this.minMarkSize,
			data: {
				type: swap.type,
				timestamp: swap.timestamp,
				id: swap.txHash,
				usdAmount: swap.usdAmount.toString(),
				priceUsd: swap.priceUsd.toString(),
				priceQuote: swap.priceQuote.toString(),
				tokensAmount: swap.tokensAmount.toString(),
				eventType: swap.eventType,
				maker: swap.maker,
			},
			color: {
				background: background,
				border: wallet.imageUrl ? background : "#010101",
			},
			label: wallet.symbol,
			text: [
				`${wallet.nickname} ${
					swap.type === "buy" ? "🟢 bought" : "🔴 sold"
				} ${formatHumanReadableNumber(swap.tokensAmount)} tokens for $${formatHumanReadableNumber(
					swap.usdAmount,
				)} at $${formatHumanReadableNumber(swap.priceUsd)}/token on ${new Date(
					swap.timestamp * 1000,
				).toLocaleString()}`,
			],
			tickmark: swap.timestamp,
			highlightByAuthor: true,
		});
	}

	refresh() {
		const chart = window.inst?.activeChart();
		if (!chart) {
			log.warn("Chart not yet initialized, skipping refresh");
			return;
		}

		chart._chartWidget.refreshMarks();
	}

	async init() {
		for (let i = 0; i < 100; i++) {
			if (window.inst) {
				log.log("Found chart, hooking");
				break;
			}

			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		const ChartApiInstance = window.inst._iFrame.contentWindow.ChartApiInstance;
		const getMarks = ChartApiInstance.getMarks;
		ChartApiInstance.getMarks = (
			pair: string,
			from: number,
			to: number,
			callback: (result: Mark[]) => void,
			// biome-ignore lint/suspicious/noExplicitAny: ignore
			e: any,
		) => {
			getMarks.call(
				ChartApiInstance,
				pair,
				from,
				to,
				(result: Mark[]) => callback(result.concat(this.marks)),
				e,
			);
		};

		log.log("Successfully hooked chart");
	}
}
