import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";
import { createLogger } from "~logging";
import { WalletManager, WalletManagerTab } from "~manager/manager";

const log = createLogger("contents/manager");

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/en/lp/*"],
	run_at: "document_end",
};

const renderTab = (anchor: Element) => {
	const chart = anchor.children[3].children[1].children[1].children[0];
	const container = renderManager(chart);

	const bar = chart.children[0].children[0];

	const tab = document.createElement("div");
	const root = createRoot(tab);
	root.render(
		React.createElement(WalletManagerTab, {
			onClick: () => {
				container.style.display =
					container.style.display === "block" ? "none" : "block";
			},
		}),
	);

	bar.appendChild(tab);
};

const renderManager = (anchor: Element) => {
	const managerContainer = document.createElement("div");

	anchor.insertBefore(managerContainer, anchor.children[1]);
	managerContainer.style.display = "none";

	const root = createRoot(managerContainer);
	root.render(React.createElement(WalletManager));
	return managerContainer;
};

const main = async () => {
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

	renderTab(anchor);
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
