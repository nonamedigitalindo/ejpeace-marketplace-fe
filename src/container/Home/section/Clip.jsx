import { useEffect, useState } from "react";

export default function ClipSection() {
  const videoId = "YUPIF6yQ7RI";
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchTitle = async () => {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${videoUrl}&format=json`
      );
      const data = await res.json();
      setTitle(data.title);
    };

    fetchTitle();
  }, []);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* VIDEO */}
      <div>
        <h2 className="text-2xl font-bold mb-4">OUR CLIP</h2>

        <div className="w-full h-64 rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* TITLE + DESCRIPTION (manual karena tidak ada dari oEmbed) */}
      <div className="flex flex-col text-justify mt-12">
        <h1 className="text-xl font-bold underline underline-offset-6 mb-4">
          {title || "Loading..."}
        </h1>

        <p className="text-gray-600">
          {/* Deskripsi harus manual, karena YouTube tidak mengirimkan description tanpa API key */}
          blekjek (tim parody blackpink) akhirnya mengupload ddu ddu du full
          version. setelah masa masa hoream dan loba gaweeun, jadi juga gening
          video teh. maapin ya kalo kurang dari expektasi da yang penting mah
          bikinnya have fun!! semoga menghibur dan mohon maaf jika kurang puas
          karna kami bukan alat pemuas.
        </p>
      </div>
    </section>
  );
}
