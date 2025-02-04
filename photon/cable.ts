import { createLogger } from "~logging";
import { getPoolId } from "./photon";

const log = createLogger("photon/cable");

export class Cable extends EventTarget {
	connect() {
		log.log("Connecting to TinyAstro");
		const ws = new WebSocket("wss://ws-token-sol-lb.tinyastro.io/cable");

		ws.onopen = () => {
			log.log("Connected to TinyAstro");
			const poolId = getPoolId();
			ws.send(
				JSON.stringify({
					command: "subscribe",
					identifier: JSON.stringify({
						channel: "LpChannel",
						id: poolId,
					}),
				}),
			);
			log.log("Subscribed to pool", poolId);
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			const swaps = data?.message?.events?.data;
			if (!Array.isArray(swaps)) {
				return;
			}

			for (const swap of swaps) {
				const data: Swap = swap.attributes;
				if (!data.maker) {
					continue;
				}

				data.id = swap.id;
				this.dispatchEvent(new CustomEvent("swap", { detail: data }));
			}
		};

		ws.onerror = (event) => {
			log.error("Error", event);
		};

		ws.onclose = () => {
			log.log("Connection closed, reconnecting in 1 second");
			setTimeout(() => {
				this.connect();
			}, 1000);
		};
	}
}

export type Swap = {
	id: string;
	eventType: string;
	maker: string;
	priceQuote: number;
	priceUsd: number;
	quoteAmount: number;
	slot: number;
	sortId: number;
	timestamp: number;
	tokensAmount: number;
	txHash: string;
	type: string;
	usdAmount: number;
};
