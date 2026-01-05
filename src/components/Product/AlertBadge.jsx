import React from "react";
import * as FaIcons from "react-icons/fa";

export default function AlertBadge({ icon, color, text }) {
    // Dynamically get icon component
    const IconComponent = FaIcons[icon] || FaIcons.FaTag;

    return (
        <span
            style={{ backgroundColor: color }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white shadow-sm whitespace-nowrap"
        >
            <IconComponent className="text-white text-xs" />
            <span className="font-bold text-xs uppercase tracking-wide text-white">
                {text}
            </span>
        </span>
    );
}
