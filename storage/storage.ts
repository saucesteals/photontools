import { Storage } from "@plasmohq/storage";
import type { Wallet } from "~photon/photon";

export const storage = new Storage({
	area: "local",
});

export type Preferences = {
	wallets: Wallet[];
	minMarkSize: number;
};

const defaultPreferences: Preferences = {
	wallets: [],
	minMarkSize: 35,
};

export const updatePreferences = async (preferences: Partial<Preferences>) => {
	await storage.setMany(preferences);
};

export const getPreference = async <T extends keyof Preferences>(
	key: T,
): Promise<Preferences[T]> => {
	let value = await storage.get<Preferences[T]>(key);
	if (typeof value === "undefined") {
		value = defaultPreferences[key];
		await updatePreferences({
			[key]: value,
		});
	}

	return value;
};
