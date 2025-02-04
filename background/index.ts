chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
	if (message.type === "GET_WALLETS") {
		chrome.storage.local.get(["wallets"], (result) => {
			sendResponse(result.wallets || []);
		});
		return true;
	}

	if (message.type === "SET_WALLETS") {
		chrome.storage.local.set({ wallets: message.wallets }, () => {
			sendResponse(true);
		});
		return true;
	}
});
