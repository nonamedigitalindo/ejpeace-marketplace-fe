import { useState, useEffect } from "react";

import { divisions } from "../../../data/constants.js";
import CardDivision from "../../../components/Card/CardDivision.jsx";

export default function DivisionCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const updateActive = () => {
      if (window.innerWidth >= 1024) {
        setActiveIndex(2);
      } else if (window.innerWidth >= 640) {
        setActiveIndex(1);
      } else {
        setActiveIndex(0);
      }
    };

    updateActive();
    window.addEventListener("resize", updateActive);
    return () => window.removeEventListener("resize", updateActive);
  }, []);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">EJPEACE DIVISION</h2>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {divisions.map((item, idx) => {
          const isActive = idx === activeIndex;

          return <CardDivision key={item.id} item={item} isActive={isActive} />;
        })}
      </div>
    </section>
  );
}
