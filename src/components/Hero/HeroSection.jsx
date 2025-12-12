import { useState, useEffect } from "react";
import { slides } from "../../data/constants.js";
import { useNavigate } from "react-router-dom";

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate(); // <-- HARUS DI SINI

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="aboslute w-full h-[100vh] overflow-hidden mt-12">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* IMAGE */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />

          {/* BUTTON – tepat di atas navigation dots */}
          <div className="absolute mb-16 bottom-16 left-1/2 -translate-x-1/2 z-20">
            <button
              onClick={() => navigate("/ejpeace/division")}
              className="px-5 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 
              text-sm sm:text-base md:text-lg bg-yellow-500 
              text-black rounded-lg font-semibold"
            >
              View More
            </button>
          </div>

          {/* NAVIGATION DOTS */}
          <div className="absolute mb-15 bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
                  index === current ? "bg-yellow-500" : "bg-white/60"
                }`}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* NAVIGATION DOTS */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${
              index === current ? "bg-yellow-500" : "bg-white/60"
            }`}
            onClick={() => setCurrent(index)}
          ></button>
        ))}
      </div>
    </section>
  );
}
