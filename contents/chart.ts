import type { PlasmoCSConfig } from "plasmo";
import { createRoot } from "react-dom/client";
import { createLogger } from "~logging";
import { WalletManager } from "~manager/manager";
import { WalletManagerTab } from "~manager/tab";
import { Cable, type Swap } from "~photon/cable";
import { getEventsHistory } from "~photon/events";
import { type Wallet, getPoolId } from "~photon/photon";
import { getRelayPreference } from "~storage/relay";
import { Chart } from "~tradingview/chart";
import React from "react";

const log = createLogger("contents/chart");

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/en/lp/*"],
	world: "MAIN",
};

const createTabRoot = (chart: Element) => {
	const bar = chart.children[0].children[0];
	const tab = document.createElement("div");
	bar.appendChild(tab);
	return createRoot(tab);
};

const createManagerRoot = (chart: Element) => {
	const manager = document.createElement("div");
	chart.insertBefore(manager, chart.children[1]);
	return { root: createRoot(manager), manager };
};

const renderToolsUI = async (onWalletsChange: (wallets: Wallet[]) => void) => {
	for (let i = 0; i < 100; i++) {
		if (document.querySelector(`div[data-icon="map"]`)) {
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	const anchor = document.querySelector(
		".p-show__widget.u-p-0.p-show__widget--top",
	);
	if (!anchor) {
		throw new Error("No anchor found");
	}

	const chart = anchor.children[3].children[1].children[1].children[0];

	const tabRoot = createTabRoot(chart);
	const { root: managerRoot, manager } = createManagerRoot(chart);

	manager.style.display = "none";
	managerRoot.render(React.createElement(WalletManager, { onWalletsChange }));

	tabRoot.render(
		React.createElement(WalletManagerTab, {
			onClick: () => {
				manager.style.display =
					manager.style.display === "block" ? "none" : "block";
			},
		}),
	);
};

const main = async () => {
	const cable = new Cable();

	const minMarkSize = await getRelayPreference("minMarkSize");

	const chart = new Chart(minMarkSize);
	await chart.init();

	let wallets: Wallet[] = [];
	await renderToolsUI(async (newWallets) => {
		log.log("Wallets changed", newWallets);

		const existingWallets = new Set(
			wallets.map((w) => w.address.toLowerCase()),
		);
		wallets = newWallets;

		chart.setMarks(
			chart.getMarks().filter((mark) => {
				return wallets.some(
					(w) => w.address.toLowerCase() === mark.data.maker.toLowerCase(),
				);
			}),
		);

		newWallets.forEach(async (wallet) => {
			if (existingWallets.has(wallet.address.toLowerCase())) {
				return;
			}

			const history = await getEventsHistory(getPoolId(), wallet.address);
			log.log("History", wallet.nickname, history);
			history.forEach((swap) => {
				chart.addTrade(wallet, swap);
			});
		});
	});
	log.log("rendered");

	cable.addEventListener("swap", (event: CustomEvent<Swap>) => {
		const wallet = wallets.find(
			(w) => w.address.toLowerCase() === event.detail.maker.toLowerCase(),
		);
		if (!wallet) {
			return;
		}

		log.log("Received tracked swap event", event.detail.maker);
		const swap: Swap = event.detail;
		chart.addTrade(wallet, swap);
	});
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
