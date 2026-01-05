import React, { useState } from 'react';
import { BlockPicker, ChromePicker } from 'react-color';

export default function ColorPickerInput({ label, color, colors, onChange }) {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);

    const handleClick = () => {
        setDisplayColorPicker(!displayColorPicker);
    };

    const handleClose = () => {
        setDisplayColorPicker(false);
    };

    const handleChange = (colorResult) => {
        onChange(colorResult.hex);
    };


    return (
        <div>
            {label && <label className="font-bold text-gray-700 mb-2 text-sm block">{label}</label>}
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 bg-gray-50 relative">
                <div
                    className="relative w-10 h-10 rounded-full border border-gray-200 shadow-sm shrink-0 cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={handleClick}
                />
                <div className="flex-1">
                    <span
                        onClick={handleClick}
                        className="w-full bg-transparent outline-none text-gray-700 font-bold font-mono uppercase cursor-pointer select-none block"
                    >
                        {color}
                    </span>
                </div>

                {displayColorPicker && (
                    <div className="absolute top-14 left-0 z-50 animate-fade-in">
                        <div className="fixed inset-0" onClick={handleClose} />
                        <BlockPicker colors={colors} triangle="top" color={color} onChange={handleChange} disableAlpha={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
