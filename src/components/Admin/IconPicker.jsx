import { useState, useRef, useEffect } from "react";
import * as FaIcons from "react-icons/fa";

// Curated list of icons suitable for e-commerce alerts
const ICON_OPTIONS = [
    "FaFire", "FaClock", "FaStar", "FaChartLine", "FaExclamationTriangle",
    "FaBolt", "FaGift", "FaHeart", "FaTag", "FaPercent",
    "FaTrophy", "FaThumbsUp", "FaMedal", "FaCrown", "FaGem",
    "FaRocket", "FaLeaf", "FaShieldAlt", "FaCheckCircle", "FaBoxOpen"
];

export default function IconPicker({ value, onChange, color }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const SelectedIcon = value && FaIcons[value] ? FaIcons[value] : FaIcons.FaSearch;

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-left border rounded-md hover:bg-gray-50 bg-white"
            >
                <div className="flex items-center gap-2">
                    {value ? <SelectedIcon className="text-lg" style={{ color: color || 'inherit' }} /> : <span className="text-gray-400">Select Icon...</span>}
                    <span className="text-sm">{value || ""}</span>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto grid grid-cols-4 gap-2 p-2">
                    {ICON_OPTIONS.map(iconName => {
                        const Icon = FaIcons[iconName];
                        return (
                            <button
                                key={iconName}
                                type="button"
                                onClick={() => { onChange(iconName); setIsOpen(false); }}
                                className={`flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 transition-colors ${value === iconName ? 'bg-blue-100 ring-1 ring-blue-500' : ''}`}
                                title={iconName}
                            >
                                <Icon className="text-xl mb-1" style={{ color: color || 'inherit' }} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
