import { createLogger } from "~logging";

import type { Swap } from "../photon/cable";
import type { Wallet } from "../photon/photon";
import type { Mark } from "./types";

const log = createLogger("tradingview/chart");

export class Chart {
	private marks: Mark[];
	private bubbleSize: number;
	constructor(bubbleSize: number) {
		this.marks = [];
		this.bubbleSize = bubbleSize;
	}

	setBubbleSize(size: number) {
		this.bubbleSize = size;

		this.marks = this.marks.map(mark => ({
			...mark,
			minSize: size
		}));
		if (window.inst?.activeChart()) {
			this.refresh();
		}
	}

	addMark(mark: Mark) {
		log.log("Adding mark", mark);
		this.marks.push(mark);
		this.refresh();
	}

	addTrade(wallet: Wallet, swap: Swap) {
		const background = swap.type === "buy" ? wallet.color : "#FF0000";
		const text = `#${(0xffffff ^ Number.parseInt(background.slice(1), 16))
			.toString(16)
			.padStart(6, "0")}`;

		this.addMark({
			id: swap.id,
			time: swap.timestamp,
			labelFontColor: text,
			minSize: this.bubbleSize,
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
				border: "#010101",
			},
			label: wallet.symbol,
			text: [
				`${wallet.nickname} (${wallet.symbol}) ${
					swap.type === "buy" ? "🟢 bought" : "🔴 sold"
				} ${Number(swap.tokensAmount).toLocaleString()} tokens for $${
					Number(swap.usdAmount).toLocaleString()
				} at 💰 $${Number(swap.priceUsd).toLocaleString()}/token (${
					Number(swap.priceQuote).toFixed(4)
				} ◎ SOL/token) \non ${new Date(swap.timestamp).toLocaleString()}`,
			],
			tickmark: swap.timestamp,
			highlightByAuthor: true,
		});
	}

	refresh() {
		if (window.inst?.activeChart()) {
			window.inst.activeChart()._chartWidget.refreshMarks();
		} else {
			log.warn("Chart not yet initialized, skipping refresh");
		}
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
