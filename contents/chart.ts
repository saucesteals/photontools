import type { PlasmoCSConfig } from "plasmo";
import { createLogger } from "~logging";
import { Cable, type Swap } from "~photon/cable";
import { getEventsHistory } from "~photon/events";
import { type Wallet, getPoolId } from "~photon/photon";
import { Chart } from "~tradingview/chart";
import { Storage } from "@plasmohq/storage";

const log = createLogger("contents/chart");

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/en/lp/*"],
	world: "MAIN",
};

const main = async () => {
	const cable = new Cable();
	const chart = new Chart(5);
	chart.setBubbleSize(5);
	await chart.init();
	const storage = new Storage();
	const initialBubbleSize = await storage.get("bubbleSize");
	let wallets: Wallet[] = [];
	const seenWallets = new Set<string>();

	window.addEventListener("message", (event) => {
		if (event.data.type === "SET_BUBBLE_SIZE") {
			chart.setBubbleSize(event.data.size);
		}
		
		if (event.data.type !== "SET_WALLETS") {
			return;
		}

		wallets = event.data.wallets;

		log.log("Wallets changed", wallets);
		wallets.forEach(async (wallet) => {
			if (seenWallets.has(wallet.address)) {
				return;
			}
			seenWallets.add(wallet.address);

			const history = await getEventsHistory(getPoolId(), wallet.address);
			log.log("History", wallet.nickname, history);
			history.forEach((swap) => {
				chart.addTrade(wallet, swap);
			});
		});
	});

	cable.addEventListener("swap", (event: CustomEvent<Swap>) => {
		const wallet = wallets.find(
			(w) => w.address.toLowerCase() === event.detail.maker.toLowerCase(),
		);
		if (!wallet) {
			return;
		}

		log.log("Received tracked swap event", wallet);
		const swap: Swap = event.detail;
		chart.addTrade(wallet, swap);
	});

	window.postMessage({ type: "CHART_INITIALIZED" }, "*");
	log.log("Chart initialized");
};

(async () => {
	log.log("Starting");
	try {
		await main();
	} catch (error) {
		log.error(error);
	} finally {
		log.log("Done");
	}
})();
