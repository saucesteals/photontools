import type { PlasmoMessaging } from "@plasmohq/messaging";
import { type Preferences, getPreference } from "~storage/storage";

const handler: PlasmoMessaging.MessageHandler<{
	key: keyof Preferences;
}> = async (req, res) => {
	if (!req.body) {
		throw new Error("No key provided");
	}

	const value = await getPreference(req.body.key);
	res.send(value);
};

export default handler;
