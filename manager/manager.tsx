import { useEffect, useState } from "react";

import type { Wallet } from "~photon/photon";

export const WalletManagerTab = ({ onClick }: { onClick: () => void }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleOpen = () => {
		setIsOpen(!isOpen);
		onClick();
	};

	return (
		<div
			style={{
				color: isOpen ? "#fff" : "rgb(181, 183, 218)",
				fontWeight: isOpen ? 600 : 500,
				alignItems: "center",
				borderBottom: `2px solid ${isOpen ? "#fff" : "transparent"}`,
				cursor: "pointer",
				display: "inline-flex",
				fontSize: "14px",
				marginBottom: "-1px",
				paddingBottom: "12px",
				whiteSpace: "nowrap",
			}}
			onClick={toggleOpen}
		>
			<div
				className="c-icon"
				data-icon="user-octagon"
				style={{
					height: "16px",
					marginRight: "6px",
					minWidth: "16px",
					width: "16px",
				}}
			/>
			<span>Track Wallets</span>
		</div>
	);
};

export const WalletManager = () => {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [newWallet, setNewWallet] = useState<Partial<Wallet>>({});
	const [isSymbolEdited, setIsSymbolEdited] = useState(false);

	const onWalletsChange = (wallets: Wallet[]) => {
		window.postMessage({ type: "SET_WALLETS", wallets: wallets }, "*");
	};

	useEffect(() => {
		chrome.runtime.sendMessage({ type: "GET_WALLETS" }, (response) => {
			setWallets(response);
			onWalletsChange(response);
		});
	}, []);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data.type === "CHART_INITIALIZED") {
				onWalletsChange(wallets);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [wallets]);

	const saveWallets = (updatedWallets: Wallet[]) => {
		chrome.runtime.sendMessage(
			{ type: "SET_WALLETS", wallets: updatedWallets },
			() => {
				setWallets(updatedWallets);
				onWalletsChange(updatedWallets);
			},
		);
	};

	const addWallet = () => {
		if (!newWallet.address || !newWallet.nickname || !newWallet.symbol) return;
		const wallet: Wallet = {
			address: newWallet.address,
			nickname: newWallet.nickname,
			symbol: newWallet.symbol,
			color: "#A5D6A7",
		};

		if (wallets.find((w) => w.address === wallet.address)) {
			alert("Wallet already exists");
			return;
		}

		const updatedWallets = [...wallets, wallet];
		saveWallets(updatedWallets);
		setNewWallet({});
		setIsSymbolEdited(false);
	};

	const removeWallet = (address: string) => {
		const updatedWallets = wallets.filter((w) => w.address !== address);
		saveWallets(updatedWallets);
	};

	const updateWalletColor = (address: string, newColor: string) => {
		const updatedWallets = wallets.map((w) =>
			w.address === address ? { ...w, color: newColor } : w,
		);
		saveWallets(updatedWallets);
	};

	return (
		<div
			style={{
				backgroundColor: "#181921",
				paddingBottom: "2.5rem",
				borderRadius: "8px",
				color: "white",
				display: "flex",
				flexDirection: "column",
				gap: "1rem",
			}}
		>
			<div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
				Track Wallets
			</div>
			<div>
				<input
					type="text"
					value={newWallet.nickname}
					onChange={(e) => {
						setNewWallet({
							...newWallet,
							nickname: e.target.value,
							symbol: isSymbolEdited
								? newWallet.symbol
								: e.target.value.slice(0, 3),
						});
					}}
					placeholder="Nickname"
					style={{
						background: "#181921",
						marginRight: "0.5rem",
						padding: "8px",
						paddingLeft: "12px",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "100px",
						color: "rgb(242, 245, 249)",
					}}
				/>

				<input
					type="text"
					value={newWallet.symbol}
					onChange={(e) => {
						setNewWallet({ ...newWallet, symbol: e.target.value });
						setIsSymbolEdited(true);
					}}
					placeholder="Symbol"
					style={{
						background: "#181921",
						marginRight: "0.5rem",
						padding: "8px",
						paddingLeft: "12px",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "100px",
						color: "rgb(242, 245, 249)",
					}}
				/>

				<input
					type="text"
					value={newWallet.address}
					onChange={(e) =>
						setNewWallet({ ...newWallet, address: e.target.value })
					}
					placeholder="Wallet Address"
					style={{
						background: "#181921",
						width: "350px",
						marginRight: "0.5rem",
						padding: "8px",
						paddingLeft: "12px",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "100px",
						color: "rgb(242, 245, 249)",
					}}
				/>

				<button
					onClick={addWallet}
					style={{
						padding: "8px 16px",
						backgroundColor: "#2a2b31",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "100px",
						background: "rgb(106, 96, 232)",
						color: "rgb(242, 245, 249)",
						cursor: "pointer",
					}}
				>
					Add
				</button>
			</div>

			<div style={{ maxHeight: "200px", overflowY: "auto" }}>
				{wallets.map((wallet) => (
					<div
						key={wallet.address}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "0.5rem",
							borderBottom: "1px solid #3a3b41",
						}}
					>
						<div style={{ flex: 1 }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
								}}
							>
								<input
									type="color"
									value={wallet.color}
									onChange={(e) =>
										updateWalletColor(wallet.address, e.target.value)
									}
									style={{
										padding: "0",
										width: "25px",
										height: "25px",
										backgroundColor: "transparent",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer",
									}}
								/>
								<span>
									{wallet.nickname} ({wallet.symbol})
								</span>
							</div>
							<div style={{ fontSize: "0.8rem", color: "#888" }}>
								{wallet.address}
							</div>
						</div>
						<button
							onClick={() => removeWallet(wallet.address)}
							style={{
								padding: "0.25rem 0.5rem",
								backgroundColor: "#ff4444",
								border: "none",
								borderRadius: "4px",
								color: "white",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								x="0px"
								y="0px"
								width="16"
								height="16"
								viewBox="0 0 48 48"
								fill="white"
							>
								<path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6367188 13 L 11.15625 39.029297 C 11.43025 41.862297 13.785813 44 16.632812 44 L 31.367188 44 C 34.214187 44 36.56875 41.862297 36.84375 39.029297 L 39.363281 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 19.5 18 C 20.328 18 21 18.671 21 19.5 L 21 34.5 C 21 35.329 20.328 36 19.5 36 C 18.672 36 18 35.329 18 34.5 L 18 19.5 C 18 18.671 18.672 18 19.5 18 z M 28.5 18 C 29.328 18 30 18.671 30 19.5 L 30 34.5 C 30 35.329 29.328 36 28.5 36 C 27.672 36 27 35.329 27 34.5 L 27 19.5 C 27 18.671 27.672 18 28.5 18 z" />
							</svg>
						</button>
					</div>
				))}
			</div>
		</div>
	);
};
