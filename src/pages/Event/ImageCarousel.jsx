import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import resolveImageSrc from "../../utils/image";

const variants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
    }),
};

export default function ImageCarousel({ images = [], interval = 5000, title = "Event", className = "" }) {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isPaused, setIsPaused] = useState(false);

    // Normalize images to array of strings
    const normalizedImages = images
        .map((img) => {
            if (typeof img === "object" && img !== null) {
                return img.image_url || img.url || null;
            }
            return img;
        })
        .filter(Boolean);

    const imageCount = normalizedImages.length;
    const imageIndex = imageCount > 0 ? ((page % imageCount) + imageCount) % imageCount : 0;

    const paginate = useCallback(
        (newDirection) => {
            setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
        },
        []
    );

    // Auto-play
    useEffect(() => {
        if (imageCount <= 1 || isPaused) return;

        const timer = setInterval(() => {
            paginate(1);
        }, interval);

        return () => clearInterval(timer);
    }, [imageCount, interval, isPaused, paginate]);

    // Fallback for no images
    if (imageCount === 0) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center rounded-2xl border border-gray-200 ${className}`}>
                <span className="text-gray-400 text-lg uppercase tracking-wide">No Images Available</span>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden group rounded-2xl bg-gray-100 shadow-xl shadow-yellow-500/10 ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Image */}
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                    key={page}
                    src={resolveImageSrc(normalizedImages[imageIndex])}
                    alt={`${title} - Image ${imageIndex + 1}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.3 },
                    }}
                    className="absolute inset-0 w-full h-full object-contain sm:object-cover"
                    draggable={false}
                />
            </AnimatePresence>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Navigation Arrows */}
            {imageCount > 1 && (
                <>
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-yellow-400 text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-yellow-400 text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-lg"
                        aria-label="Next image"
                    >
                        <FaChevronRight size={18} />
                    </button>
                </>
            )}

            {/* Progress Line */}
            {imageCount > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {normalizedImages.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPage([idx, idx > imageIndex ? 1 : -1])}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === imageIndex
                                ? "bg-yellow-400 w-8 shadow-lg shadow-yellow-400/50"
                                : "bg-white/30 w-4 hover:bg-white/60"
                                }`}
                            aria-label={`Go to image ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
