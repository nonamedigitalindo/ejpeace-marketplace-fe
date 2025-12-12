import React from "react";

import O4 from "../../assets/O4.png"
import bannerImage from "../../assets/Banner/b1.png"

export default function AboutPage() {
  return (
    <div className="about-page">
      {/* Banner */}
      <div className="banner w-full h-full overflow-hidden">
      <img src={bannerImage} alt="" />
      </div>

      {/* Konten dua kolom */}
      <section className="content max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Kolom kiri: Our Story */}
        <div className="our-story flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">
            About <span className="text-yellow-500">Peacetival</span>
          </h1>
          <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Peacetival lahir dari ide untuk menghadirkan pengalaman festival yang menyenangkan dan aman bagi semua peserta. Kami berkomitmen
            untuk memberikan kemudahan dalam menemukan acara, membeli tiket, dan menikmati pengalaman secara digital maupun offline.
            Dengan tim yang berdedikasi, kami terus berinovasi agar setiap momen festival menjadi tak terlupakan.
          </p>
        </div>

        {/* Kolom kanan: Foto */}
        <div className="our-photo">
          <img src={O4} alt="" />
        </div>
      </section>
    </div>
  );
}
