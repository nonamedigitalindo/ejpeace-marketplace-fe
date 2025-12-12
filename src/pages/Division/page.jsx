import { useParams } from "react-router-dom";
import { divisions } from "../../data/constants";
import { useState, useEffect } from "react";

export default function DivisionPage() {
  const { id } = useParams();

  const initialDivision =
    divisions.find((d) => d.id === Number(id)) || divisions[0];

  const [selected, setSelected] = useState(initialDivision);

  useEffect(() => {
    const found = divisions.find((d) => d.id === Number(id));
    if (found) setSelected(found);
  }, [id]);

  return (
    <div className="w-full text-black px-6 md:px-16 py-12 mt-20">

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center md:text-left">
        {selected.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

        {/* LEFT IMAGE & DESCRIPTION */}
        <div className="md:col-span-2 space-y-8">

          {/* Image */}
          <div className="cover rounded-xl shadow-md overflow-hidden">
            <img
              src={selected.banner}
              alt={selected.title}
              className="w-full h-64 md:h-80 lg:h-96 object-cover" 
            />
          </div>

          {/* DESCRIPTION CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <div
              className="text-gray-700 text-lg leading-relaxed space-y-5"
              dangerouslySetInnerHTML={{ __html: selected.description }}
            />
          </div>
        </div>

        {/* RIGHT LIST MENU */}
        <div className="space-y-5 sticky top-28 h-fit">

          <h2 className="font-semibold text-lg mb-1">
            Divisi Lainnya
          </h2>

          {divisions
            .filter((d) => d.id !== selected.id)
            .map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow border border-gray-200 hover:bg-gray-100 transition"
              >
                <img
                  src={d.image}
                  className="w-20 h-20 object-contain bg-black/5 rounded-lg"
                  alt={d.title}
                />
                <div className="text-left">
                  <h3 className="font-bold">{d.title}</h3>
                  <p className="text-sm text-gray-500">
                    Klik untuk lihat detail
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
