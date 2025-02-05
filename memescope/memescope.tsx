import { type CSSProperties, useEffect, useRef, useState } from "react";
import { palettes } from "~memescope/palettes";
import { formatHumanReadableNumber } from "~photon/photon";
import { getRelayPreference, updateRelayPreferences } from "~storage/relay";

export type MemeScopeProps = {
	onPaletteChange: (palette: string[]) => void;
	onMarketCapChange: (marketCap: number) => void;
};

export function MemeScope({
	onPaletteChange,
	onMarketCapChange,
}: MemeScopeProps) {
	const [selectedPalette, setSelectedPalette] = useState<number>(0);
	const [isOpen, setIsOpen] = useState(false);
	const [marketCap, setMarketCap] = useState<number>(0);

	const getButtonStyle = (
		palette: string[],
		isSelected: boolean,
	): CSSProperties => {
		return {
			background: `linear-gradient(135deg, ${palette.join(", ")})`,
			width: "35px",
			height: "35px",
			borderRadius: "50%",
			border: isSelected
				? "2px solid white"
				: "1px solid rgba(255,255,255,0.2)",
			boxShadow: isSelected
				? "0 0 8px rgba(255,255,255,0.7)"
				: "0 0 4px rgba(255,255,255,0.3)",
			cursor: "pointer",
			transition: "all 0.3s ease",
		};
	};

	useEffect(() => {
		const init = async () => {
			const index = await getRelayPreference("colorPaletteIndex");
			if (index !== undefined) {
				setSelectedPalette(index);
			}

			const marketCap = await getRelayPreference("marketCap");
			if (marketCap !== undefined) {
				setMarketCap(marketCap);
			}
		};
		init();
	}, []);

	const handlePaletteChange = async (index: number) => {
		setSelectedPalette(index);
		setIsOpen(false);
		await updateRelayPreferences({ colorPaletteIndex: index });
		onPaletteChange(palettes[index]);
	};

	const handleMarketCapChange = async (value: number) => {
		setMarketCap(value);
		await updateRelayPreferences({ marketCap: value });
		onMarketCapChange(value);
	};

	return (
		<div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
			<style>
				{`
                @keyframes slideRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}
			</style>

			<button
				onClick={() => setIsOpen(!isOpen)}
				style={{
					background: "transparent",
					padding: "8px 16px",
					border: "1px solid #303139",
					borderRadius: "20px",
					color: "white",
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
					gap: "8px",
					fontSize: "13px",
					fontWeight: "600",
					marginBottom: "2px",
					lineHeight: "normal",
				}}
			>
				<span>Border</span>
			</button>

			{!isOpen ? null : (
				<div
					style={{
						display: "flex",
						gap: "10px",
						animation: "slideRight 0.5s ease-out",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							gap: "5px",
							fontSize: "13px",
						}}
					>
						<div style={{ display: "flex", gap: "4px" }}>
							<span>Market Cap</span>
							<span>${formatHumanReadableNumber(marketCap)}</span>
						</div>
						<input
							type="range"
							min={0}
							max={1_000_000}
							step={10_000}
							value={marketCap}
							onChange={(e) =>
								handleMarketCapChange(Number.parseInt(e.target.value))
							}
							style={{
								width: "100%",
								height: "10px",
								border: "1px solid white",
								borderRadius: "5px",
								accentColor: "#6A60E8",
							}}
						/>
					</div>
					{palettes.map((palette, index) => (
						<button
							key={index}
							onClick={() => handlePaletteChange(index)}
							style={getButtonStyle(palette, index === selectedPalette)}
							aria-label={`Select color palette ${index + 1}`}
						/>
					))}
				</div>
			)}
		</div>
	);
}
