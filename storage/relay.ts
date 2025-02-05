import { sendToBackgroundViaRelay } from "@plasmohq/messaging";
import type { Preferences } from "./storage";

export const getRelayPreference = async <T extends keyof Preferences>(
	key: T,
): Promise<Preferences[T]> => {
	return sendToBackgroundViaRelay({
		name: "get",
		body: {
			key,
		},
	});
};

export const updateRelayPreferences = async (
	preferences: Partial<Preferences>,
) => {
	await sendToBackgroundViaRelay({
		name: "set",
		body: preferences,
	});
};
