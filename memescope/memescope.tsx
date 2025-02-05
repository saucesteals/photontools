import React, { useState, CSSProperties, useEffect } from "react";
import { palettes } from "~constants/colorPalettes";
import { getRelayPreference, updateRelayPreferences } from "~storage/relay";

type Palette = string[];

export function MemeScope() {
    const [selectedPalette, setSelectedPalette] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false);

    const getButtonStyle = (palette: Palette, isSelected: boolean): CSSProperties => {
        return {
            background: `linear-gradient(135deg, ${palette.join(", ")})`,
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            border: isSelected ? "2px solid white" : "1px solid rgba(255,255,255,0.2)",
            boxShadow: isSelected ? "0 0 8px rgba(255,255,255,0.7)" : "0 0 4px rgba(255,255,255,0.3)",
            cursor: "pointer",
            transition: "all 0.3s ease"
        };
    };
    
    useEffect(() => {
        const init = async () => {
            const index = await getRelayPreference("colorPaletteIndex");
            if (index !== undefined) {
                setSelectedPalette(index);
            }
        };
        init();
    }, []);
    
    const handlePaletteChange = async (index: number) => {
        setSelectedPalette(index);
        setIsOpen(false);
        await updateRelayPreferences({ colorPaletteIndex: index });
        window.dispatchEvent(new CustomEvent('paletteChange', { 
            detail: { paletteIndex: index, palette: palettes[index] }
        }));
    };

    return (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
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
                    <span>Border Style</span>
                </button>
            ) : (
                <div style={{ 
                    display: 'flex', 
                    gap: '10px',
                    animation: 'slideRight 0.5s ease-out'
                }}>
                    {palettes.map((palette, index) => (
                        <button
                            key={index}
                            onClick={() => handlePaletteChange(index)}
                            style={getButtonStyle(palette, index === selectedPalette)}
                            aria-label={`Select color palette ${index + 1}`}
                        />
                    ))}
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: "transparent",
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            border: "1px solid #303139",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px"
                        }}
                        aria-label="Close palette selection"
                    >
                        ×
                    </button>
                </div>
            )}
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
        </div>
    );
}