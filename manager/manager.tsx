import { useEffect, useRef, useState } from "react";
import type { Wallet } from "~photon/photon";
import { getRelayPreference, updateRelayPreferences } from "~storage/relay";
import { WalletsTable } from "./table";
import { TrashButton } from "./trash";

type Props = {
	onWalletsChange: (wallets: Wallet[]) => void;
};

const blobToDataUrl = (blob: Blob) => {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

const getUsernameAvatar = async (username: string) => {
	const response = await fetch(`https://unavatar.io/x/${username}`);
	if (!response.ok) {
		return null;
	}

	const blob = await response.blob();
	return blobToDataUrl(blob);
};

export const WalletManager = ({ onWalletsChange }: Props) => {
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [newWallet, setNewWallet] = useState<Partial<Wallet>>({});
	const [isSymbolEdited, setIsSymbolEdited] = useState(false);
	const [isImageEdited, setIsImageEdited] = useState(false);
	const [minMarkSize, setMinMarkSize] = useState(35);
	const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
	const [bulkImportText, setBulkImportText] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const init = async () => {
			const wallets = await getRelayPreference("wallets");
			setWallets(wallets);
			onWalletsChange(wallets);
			setMinMarkSize(await getRelayPreference("minMarkSize"));
		};

		init();
	}, []);

	const saveWallets = async (updatedWallets: Wallet[]) => {
		await updateRelayPreferences({ wallets: updatedWallets });
		setWallets(updatedWallets);
		onWalletsChange(updatedWallets);
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}

		const imageUrl = await blobToDataUrl(file);
		setNewWallet({ ...newWallet, imageUrl });
		setIsImageEdited(true);
	};

	const addWallet = () => {
		if (!newWallet.address || !newWallet.nickname || !newWallet.symbol) return;

		const wallet: Wallet = {
			address: newWallet.address,
			nickname: newWallet.nickname,
			symbol: newWallet.symbol,
			imageUrl: newWallet.imageUrl,
			color: "#0C9981",
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

	const updateWallet = (wallet: Wallet) => {
		const updatedWallets = wallets.map((w) =>
			w.address === wallet.address ? wallet : w,
		);
		saveWallets(updatedWallets);
	};

	const debouncedGetUsernameAvatar = (nickname: string) => {
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		debounceTimeout.current = setTimeout(async () => {
			if (!isImageEdited) {
				const avatarUrl = await getUsernameAvatar(nickname);
				if (avatarUrl) {
					setNewWallet((prev) => ({ ...prev, imageUrl: avatarUrl }));
				}
			}
		}, 300);
	};

	const handleBulkImport = () => {
		const lines = bulkImportText.split("\n");
		const newWallets: Wallet[] = [];

		for (const line of lines) {
			const [address, nickname] = line.split(" ");
			if (address && nickname) {
				const wallet: Wallet = {
					address,
					nickname,
					symbol: nickname.slice(0, 3),
					color: "#0C9981",
				};
				if (!wallets.find((w) => w.address === wallet.address)) {
					newWallets.push(wallet);
				}
			}
		}

		if (newWallets.length > 0) {
			saveWallets([...wallets, ...newWallets]);
		}

		setIsBulkImportOpen(false);
		setBulkImportText("");
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
			<style>
				{`
					.wallet-image:hover {
						transform: scale(1.1);
					}
						
					.add-wallet-button:disabled {
						background: #2a2b31;
						cursor: not-allowed;
					}
				`}
			</style>
			<div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
				Track Wallets
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
					<input
						type="text"
						value={newWallet.nickname}
						onChange={(e) => {
							const nickname = e.target.value;
							setNewWallet({
								...newWallet,
								nickname: nickname,
								symbol: isSymbolEdited
									? newWallet.symbol
									: nickname.slice(0, 3),
							});
							debouncedGetUsernameAvatar(nickname);
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
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
					<button
						onClick={addWallet}
						disabled={
							!newWallet.address || !newWallet.nickname || !newWallet.symbol
						}
						className="add-wallet-button"
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

					<input
						type="file"
						accept="image/*"
						onChange={handleImageUpload}
						ref={fileInputRef}
						style={{ display: "none" }}
					/>
					<button
						onClick={() => fileInputRef.current?.click()}
						style={{
							padding: "8px 16px",
							backgroundColor: "#2a2b31",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: "100px",
							color: "rgb(242, 245, 249)",
							cursor: "pointer",
							marginRight: "0.5rem",
						}}
					>
						Upload Image
					</button>

					<button
						onClick={() => setIsBulkImportOpen(true)}
						style={{
							padding: "8px 16px",
							backgroundColor: "#2a2b31",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: "100px",
							color: "rgb(242, 245, 249)",
							cursor: "pointer",
						}}
					>
						Bulk Import
					</button>

					{newWallet.imageUrl && (
						<div
							style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
						>
							<img
								src={newWallet.imageUrl}
								style={{
									width: "25px",
									height: "25px",
									borderRadius: "50%",
									objectFit: "cover",
								}}
								alt="Preview"
							/>

							<TrashButton
								onClick={() => {
									setNewWallet({ ...newWallet, imageUrl: undefined });
									if (fileInputRef.current) {
										fileInputRef.current.value = "";
									}
								}}
							/>
						</div>
					)}
				</div>
			</div>

			{isBulkImportOpen && (
				<div
					style={{
						position: "fixed",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "#191A23",
						padding: "1rem",
						borderRadius: "8px",
						boxShadow: "0 0 10px rgba(0,0,0,0.5)",
						zIndex: 1000,
					}}
				>
					<h3 style={{ color: "white" }}>Bulk Import Wallets</h3>
					<textarea
						value={bulkImportText}
						onChange={(e) => setBulkImportText(e.target.value)}
						placeholder="wallet1 username1"
						style={{
							width: "100%",
							height: "100px",
							backgroundColor: "#181921",
							color: "white",
							border: "1px solid rgba(255,255,255,0.1)",
							borderRadius: "8px",
							padding: "8px",
							marginBottom: "1rem",
						}}
					/>
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<button
							onClick={handleBulkImport}
							style={{
								padding: "8px 16px",
								backgroundColor: "#6a60e8",
								border: "none",
								borderRadius: "8px",
								color: "white",
								cursor: "pointer",
							}}
						>
							Import
						</button>
						<button
							onClick={() => setIsBulkImportOpen(false)}
							style={{
								padding: "8px 16px",
								backgroundColor: "#e74c3c",
								border: "none",
								borderRadius: "8px",
								color: "white",
								cursor: "pointer",
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			<div>
				<button
					onClick={() => {
						const newSize = prompt(
							"Enter new mark size (refresh required):",
							minMarkSize.toString(),
						);
						if (newSize) {
							const size = Number.parseInt(newSize, 10);
							if (!Number.isNaN(size)) {
								updateRelayPreferences({ minMarkSize: size });
							} else {
								alert("Invalid size entered. Please enter a number.");
							}
						}
					}}
					style={{
						padding: "8px 16px",
						backgroundColor: "#2a2b31",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "100px",
						color: "rgb(242, 245, 249)",
						cursor: "pointer",
						marginRight: "0.5rem",
					}}
				>
					Update Mark Size
				</button>
			</div>

			<WalletsTable
				wallets={wallets}
				updateWallet={updateWallet}
				removeWallet={removeWallet}
			/>
		</div>
	);
};
