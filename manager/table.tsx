import type { Wallet } from "~photon/photon";
import { TrashButton } from "./trash";

type Props = {
	wallets: Wallet[];
	updateWallet: (wallet: Wallet) => void;
	removeWallet: (address: string) => void;
};

export const WalletsTable = ({
	wallets,
	updateWallet,
	removeWallet,
}: Props) => {
	return (
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
							<div
								onClick={() => {
									const input = document.createElement("input");
									input.type = "file";
									input.accept = "image/*";
									input.onchange = (e) => {
										const file = (e.target as HTMLInputElement).files?.[0];
										if (!file) {
											return;
										}

										const reader = new FileReader();
										reader.onloadend = () => {
											updateWallet({
												...wallet,
												imageUrl: reader.result as string,
											});
										};
										reader.readAsDataURL(file);
									};
									input.click();
								}}
								className="wallet-image"
								style={{
									display: "flex",
									alignItems: "center",
									gap: "0.5rem",
									marginRight: "0.5rem",
									cursor: "pointer",
									transition: "transform 0.2s",
								}}
								title="Click to change image"
							>
								{wallet.imageUrl ? (
									<img
										src={wallet.imageUrl}
										className="wallet-image"
										style={{
											width: "25px",
											height: "25px",
											borderRadius: "50%",
											objectFit: "cover",
											transition: "transform 0.2s",
										}}
										alt={wallet.nickname}
									/>
								) : (
									<div
										className="wallet-image"
										style={{
											width: "25px",
											height: "25px",
											borderRadius: "50%",
											backgroundColor: wallet.color,
											transition: "transform 0.2s",
										}}
									/>
								)}
							</div>
							<input
								type="color"
								value={wallet.color}
								onChange={(e) =>
									updateWallet({
										...wallet,
										color: e.target.value,
									})
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
					<TrashButton onClick={() => removeWallet(wallet.address)} />
				</div>
			))}
		</div>
	);
};
