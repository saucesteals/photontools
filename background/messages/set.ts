import type { PlasmoMessaging } from "@plasmohq/messaging";
import { type Preferences, updatePreferences } from "~storage/storage";

const handler: PlasmoMessaging.MessageHandler<Partial<Preferences>> = async (
	req,
	res,
) => {
	if (!req.body) {
		throw new Error("No key provided");
	}

	await updatePreferences(req.body);
	res.send(true);
};

export default handler;
