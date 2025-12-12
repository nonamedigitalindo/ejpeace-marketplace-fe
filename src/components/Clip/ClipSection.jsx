import { useEffect, useState } from "react";

export default function ClipSection() {
  const videoId = "YUPIF6yQ7RI";
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchTitle = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${videoUrl}&format=json`
        );
        const data = await res.json();
        setTitle(data.title);
      } catch (err) {
        setTitle("Video Title");
      }
    };

    fetchTitle();
  }, []);

  return (
<section className="py-12 px-4 sm:py-16 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 px-6 sm:px-8 md:px-4">
  {/* VIDEO */}
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold mb-4">OUR CLIP</h2>

    <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  </div>

  {/* TITLE + DESCRIPTION */}
  <div className="flex flex-col justify-center">
    <h1 className="text-xl sm:text-2xl font-bold underline underline-offset-4 mb-4">
      {title || "Loading..."}
    </h1>

    <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
      blekjek (tim parody blackpink) akhirnya mengupload ddu ddu du full version.
      setelah masa masa hoream dan loba gaweeun, jadi juga gening video teh.
      maapin ya kalo kurang dari expektasi da yang penting mah bikinnya have fun!!
      semoga menghibur dan mohon maaf jika kurang puas karna kami bukan alat pemuas.
    </p>
  </div>
</section>
  );
}
