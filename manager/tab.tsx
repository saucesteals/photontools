import { useState } from "react";

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
