import { relayMessage } from "@plasmohq/messaging";
import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
	matches: ["https://photon-sol.tinyastro.io/*"],
};

relayMessage({
	name: "get",
});
relayMessage({
	name: "set",
});
