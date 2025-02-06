import type { PlasmoCSConfig } from "plasmo";
import React from "react";
import { createRoot } from "react-dom/client";
import { createLogger } from "~logging";
import { MemeScope, type MemeScopeProps } from "~memescope/memescope";
import { palettes } from "~memescope/palettes";
import { parseHumanReadableNumber } from "~photon/photon";
import { getRelayPreference } from "~storage/relay";

const log = createLogger("contents/memescope");

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/en/memescope"],
	world: "MAIN",
};

let minMarketCap = 70_000;
const setMarketCap = (marketCap: number) => {
	minMarketCap = marketCap;
};

const processHref = (node: Node) => {
	if (!(node instanceof HTMLDivElement)) {
		return;
	}

	if (
		node.parentElement?.parentElement?.getAttribute("class") !==
		"u-custom-scroll u-flex-grow-full"
	) {
		return;
	}

	if (node.children.length < 2) {
		return;
	}

	const child = node.children[0];
	if (!(child instanceof HTMLAnchorElement)) {
		return;
	}

	child.setAttribute("target", "_blank");

	const mktCap =
		node.children[1].children[1].children[1].children[1].children[0].children[2]
			.children[1];
	if (!(mktCap instanceof HTMLSpanElement)) {
		return;
	}

	processMarketCap(mktCap);
};

const processMarketCap = async (node: Node) => {
	if (node instanceof Text) {
		if (!node.parentNode) {
			return;
		}

		node = node.parentNode;
	}

	if (!(node instanceof HTMLSpanElement)) {
		return;
	}

	if (!(node.parentElement instanceof HTMLDivElement)) {
		return;
	}

	const firstChild = node.parentElement.children[0];
	if (!(firstChild instanceof HTMLSpanElement)) {
		return;
	}

	if (firstChild.getAttribute("data-tooltip-content") !== "Mkt Cap") {
		return;
	}

	const container =
		node.parentElement?.parentElement?.parentElement?.parentElement
			?.parentElement?.parentElement?.parentElement;
	if (!container) {
		throw new Error("No container found");
	}

	if (!node.textContent) {
		throw new Error("No market cap value found");
	}

	const marketCapValue = parseHumanReadableNumber(node.textContent);
	if (Number.isNaN(marketCapValue)) {
		throw new Error("Invalid market cap value");
	}

	const maxMarketCap = 1_000_000;
	if (marketCapValue >= minMarketCap) {
		const visibilityFactor = Math.min(
			(marketCapValue - minMarketCap) / (maxMarketCap - minMarketCap),
			1,
		);
		const borderWidth = 0.5 + visibilityFactor * 3;
		const boxShadowOpacity = 0.5 * visibilityFactor;

		container.style.border = `${borderWidth}px solid`;
		container.style.borderImage =
			"linear-gradient(to right, var(--color-palette-1), var(--color-palette-2), var(--color-palette-3), var(--color-palette-4), var(--color-palette-5)) 1";
		container.style.boxShadow = `0 0 10px rgba(255, 255, 255, ${boxShadowOpacity})`;
	} else {
		container.style.border = "none";
		container.style.boxShadow = "none";
	}
};

const renderMemescopeMenu = async (props: MemeScopeProps) => {
	const body = document.querySelector(".c-body");
	if (!body) throw new Error("No body found");

	const child = body.children[4];
	if (!child) throw new Error("No memescope menu child found");

	let row: HTMLDivElement | null = null;
	for (let i = 0; i < 100; i++) {
		row = child.querySelector(".l-row.u-align-items-center.u-mb-xxs");
		if (row) {
			break;
		}

		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	if (!row) throw new Error("No row found");

	const container = document.createElement("div");
	row.appendChild(container);

	createRoot(container).render(React.createElement(MemeScope, props));
};

const main = async () => {
	const setPallete = (palette: string[]) => {
		for (let i = 0; i < 5; i++) {
			document.documentElement.style.setProperty(
				`--color-palette-${i + 1}`,
				palette[i],
			);
		}
	};

	setMarketCap(await getRelayPreference("marketCap"));

	const palleteIndex = await getRelayPreference("colorPaletteIndex");
	setPallete(palettes[palleteIndex]);

	const callback = (records: MutationRecord[]) => {
		records.forEach((record) => {
			record.addedNodes.forEach((node) => {
				processHref(node);
				processMarketCap(node);
			});
			processMarketCap(record.target);
		});
	};

	const observer = new MutationObserver(callback);
	observer.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
		characterData: true,
	});

	await renderMemescopeMenu({
		onPaletteChange: setPallete,
		onMarketCapChange: setMarketCap,
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
