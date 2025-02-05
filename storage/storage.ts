import { Storage } from "@plasmohq/storage";
import type { Wallet } from "~photon/photon";

export const storage = new Storage({
	area: "local",
});

export type Preferences = {
	wallets: Wallet[];
	minMarkSize: number;
	colorPaletteIndex: number;
};

const defaultPreferences: Preferences = {
	wallets: [],
	minMarkSize: 35,
	colorPaletteIndex: 0,
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

export const getColorPaletteIndex = async (): Promise<number> => {
	const index = await getPreference("colorPaletteIndex");
	return index;
};
