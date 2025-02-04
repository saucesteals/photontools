import type { PlasmoCSConfig } from "plasmo";
import { createLogger } from "~logging";
import { parseHumanReadableNumber } from "~photon/photon";

const log = createLogger("contents/memescope");

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/en/memescope"],
	world: "MAIN",
};

const BORDER_MARKET_CAP_THRESHOLD = 70_000;

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

const processMarketCap = (node: Node) => {
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

	if (marketCapValue >= BORDER_MARKET_CAP_THRESHOLD) {
		container.style.border = "2px solid";
		container.style.borderImage =
			"linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet) 1";
		container.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
	} else {
		container.style.border = "none";
		container.style.boxShadow = "none";
	}
};

const main = async () => {
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
