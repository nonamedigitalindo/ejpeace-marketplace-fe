// Slides
import b1 from "../assets/Banner/b1.png";
import b2 from "../assets/Banner/b2.png";
import b3 from "../assets/Banner/b3.png";
import b4 from "../assets/Banner/b4.png";
import b5 from "../assets/Banner/b5.png";

// Divisions
import studioImg from "../assets/Division/STUDIO.png";
import coffeImg from "../assets/Division/COFF.png";
import clubImg from "../assets/Division/CLUB.png";
import entImg from "../assets/Division/ENT.png";
import coco from "../assets/Coco.jpg";
import ejp from "../assets/eJPeace.jpg";
import papilo from "../assets/Papilonia.jpg";
import acadImg from "../assets/Division/ACAD.png";
import divStud from "../assets/Banner/divStud.png";


// ============ DATA SLIDES ============
export const slides = [
  { title: "eJPeace Coffe", image: b1 },
  { title: "eJPeace Entertainment" , image: b2 },
  { title: "eJPeace Studio", image: b3 },
  { title: "Peace Club", image: b4 },
  { title: "Revi Model Academy", image: b5 },
];


// ============ DATA DIVISIONS ============
export const divisions = [
  {
    id: 1,
    title: "Revi Model Academy",
    banner: b5,
    image: acadImg,
    description: `
   <!-- HERO / INTRO -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div class="bg-white shadow-lg rounded-2xl p-6 sm:p-10">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">Revi Model Academy</h1>
        <p class="text-lg sm:text-xl text-gray-600 mb-6">Empowering Confidence. Shaping Future Talents.</p>

        <p class="text-gray-700 leading-relaxed mb-4">
          Revi Model Academy atau dikenal sebagai RMA adalah lembaga pelatihan talenta kreatif yang lahir dari sebuah visi sederhana namun kuat: membentuk generasi muda yang percaya diri, ekspresif, dan siap bersinar di panggung kehidupan.
        </p>

        <p class="text-gray-700 leading-relaxed mb-4">
          Didirikan oleh Bunda Revi dan kini berkolaborasi dengan eJPeace Entertainment, RMA menjadi wadah belajar yang bukan hanya mengajarkan skill modeling, tetapi juga seni akting, tarian, ekspresi, serta pembentukan karakter.
        </p>

        <p class="text-gray-700 leading-relaxed">
          Kami percaya bahwa setiap anak dan remaja punya potensi yang berbeda-beda. Karena itu, RMA hadir sebagai ruang aman, suportif, dan fun untuk menemukan jati diri sekaligus mengembangkan bakat dengan bimbingan para mentor profesional.
        </p>
      </div>
    </div>

    <!-- PENDEKATAN BELAJAR -->
    <div class="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 sm:mb-10">Pendekatan Belajar: Langsung Praktik</h2>

        <p>RMA menggunakan pendekatan Experiential Learning dimana siswa belajar dengan melakukan Setiap sesi berisi:</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">

          <div class="p-6 bg-white shadow rounded-xl">Latihan langsung bersama mentor</div>
          <div class="p-6 bg-white shadow rounded-xl">Simulasi panggung, kamera, dan real project</div>
          <div class="p-6 bg-white shadow rounded-xl">Pembiasaan attitude & profesionalisme</div>

          <!-- Card 4 -->
          <div class="p-6 bg-white shadow rounded-xl">Evaluasi progres setiap pertemuan</div>

          <!-- Card 5 panjang -->
          <div class="p-6 bg-white shadow rounded-xl md:col-span-2">
            Pembelajaran dengan suasana positif, kreatif, dan tidak mengintimidasi
          </div>
        </div>
      </div>
    </div>

    <!-- DIDUKUNG EJPEACE -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h2 class="text-3xl font-bold mb-8 sm:mb-10">Didukung Oleh eJPeace Entertainment</h2>

      <p class="text-gray-700 leading-relaxed mb-6">
        Dengan bergabungnya RMA ke dalam ekosistem eJPeace maka Talent Agency, TikTok Live Agency, Creative Youth Community, dan Event Organizer siswa mendapatkan peluang nyata untuk:
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

        <div class="p-6 bg-white shadow rounded-xl">Photoshoot & Videoshoot Profesional</div>
        <div class="p-6 bg-white shadow rounded-xl">Tampil di Event Live</div>
        <div class="p-6 bg-white shadow rounded-xl">Bergabung di Talent Management</div>

        <div class="p-6 bg-white shadow rounded-xl md:col-span-3">Mengerjakan Proyek Konten</div>
        <div class="p-6 bg-white shadow rounded-xl md:col-span-3">
          Mempersiapkan karier di dunia entertainment modern
        </div>

      </div>
    </div>

    <!-- PROGRAM PEMBELAJARAN -->
    <div class="bg-gray-50 py-12 sm:py-16 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-8 sm:mb-10">Program Pembelajaran RMA</h2>

        <p class="text-gray-700 leading-relaxed mb-8">
          RMA kini memiliki 4 kelas utama, masing-masing dirancang untuk menggali dan memperkuat bakat secara menyeluruh.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

          <!-- Model Basic -->
          <div class="bg-white p-8 shadow rounded-xl">
            <h3 class="text-2xl font-semibold mb-4">Model Basic Class</h3>
            <ul class="text-gray-700 space-y-2">
              <li>• Basic runway walk</li>
              <li>• Pose & ekspresi dasar</li>
              <li>• Posture & body awareness</li>
              <li>• Confidence building</li>
              <li>• Pengenalan kamera</li>
              <li>• Attitude dasar model profesional</li>
            </ul>
          </div>

          <!-- Advance Model -->
          <div class="bg-white p-8 shadow rounded-xl">
            <h3 class="text-2xl font-semibold mb-4">Advance Model Class</h3>
            <ul class="text-gray-700 space-y-2">
              <li>• Advanced runway & stage presence</li>
              <li>• Editorial & commercial posing</li>
              <li>• Acting for photo/video</li>
              <li>• Fashion knowledge</li>
              <li>• Stage character management</li>
              <li>• Pengembangan portfolio profesional</li>
            </ul>
          </div>

          <!-- Acting -->
          <div class="bg-white p-8 shadow rounded-xl">
            <h3 class="text-2xl font-semibold mb-4">Acting Class</h3>
            <ul class="text-gray-700 space-y-2">
              <li>• Acting fundamentals</li>
              <li>• Ekspresi wajah & bahasa tubuh</li>
              <li>• Improvisasi</li>
              <li>• Voice control & public speaking</li>
              <li>• Camera acting</li>
              <li>• Mini skenario & short performance</li>
            </ul>
          </div>

          <!-- Dance -->
          <div class="bg-white p-8 shadow rounded-xl">
            <h3 class="text-2xl font-semibold mb-4">Dance Class</h3>
            <ul class="text-gray-700 space-y-2">
              <li>• Basic choreography</li>
              <li>• Musicality & timing</li>
              <li>• Stage movement</li>
              <li>• Dance expression</li>
              <li>• Hip-hop / modern dance</li>
              <li>• Group dance performance</li>
            </ul>
          </div>

        </div>
      </div>
    </div>

    <!-- FAST CLASS -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h2 class="text-3xl font-bold mb-8 sm:mb-10">Fast Class Series</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div class="p-6 bg-white rounded-xl shadow">
          <h3 class="text-xl font-semibold mb-3">Fast Class Model Project</h3>
          <p class="text-gray-600">Didesain untuk siswa advance yang ingin memperdalam teknik runway dan performance secara intensif. Cocok untuk siswa yang akan turun ke panggung atau proyek modeling nyata.</p>
        </div>

        <div class="p-6 bg-white rounded-xl shadow">
          <h3 class="text-xl font-semibold mb-3">Fast Class Photoshoot</h3>
          <p class="text-gray-600">Fokus pada pemahaman kamera, building pose, editorial movement, ekspresi wajah, dan gaya foto profesional. Tidak memerlukan skill awal.</p>
        </div>

        <div class="p-6 bg-white rounded-xl shadow">
          <h3 class="text-xl font-semibold mb-3">Fast Class Model Basic</h3>
          <p class="text-gray-600">Kelas pengenalan singkat untuk pemula yang ingin mengetahui dasar modeling tanpa mengikuti kelas panjang.</p>
        </div>
      </div>
    </div>
    <!-- FINAL EXAM -->
<div class="bg-gray-50 py-16 px-6">
  <div class="max-w-5xl mx-auto">
    <h2 class="text-3xl font-bold mb-10">Final Exam & Real Showcase</h2>

    <p class="text-gray-700 leading-relaxed mb-10">
      Setiap siswa akan menampilkan hasil belajarnya melalui Final Exam Showcase yang
      dirancang menyerupai event profesional.
    </p>

    <div class="bg-white p-10 rounded-xl shadow">

      <p class="text-gray-700 mb-6">Siswa akan menampilkan:</p>

      <!-- GRID CARD -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">

        <!-- Card 1 -->
        <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
          <p class="font-medium text-gray-800">Runway performance</p>
        </div>

        <!-- Card 2 -->
        <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
          <p class="font-medium text-gray-800">Acting scene</p>
        </div>

        <!-- Card 3 -->
        <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
          <p class="font-medium text-gray-800">Group dance performance</p>
        </div>

        <!-- Card 4 -->
        <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
          <p class="font-medium text-gray-800">Ekspresi & karakter</p>
        </div>

        <!-- Card 5 — MEMANJANG KE KANAN -->
        <div class="p-5 bg-gray-50 rounded-lg shadow-sm md:col-span-2">
          <p class="font-medium text-gray-800">Perkembangan percaya diri</p>
        </div>

      </div>

      <p class="mt-4 text-gray-700">
        Setelah showcase, siswa menerima
        <strong>Sertifikat Kelulusan RMA resmi dari Dinas Pendidikan</strong>
        dan bagi yang lulus dapat melanjutkan ke program tingkat lanjut. <br>
        Final Exam bukan sekadar ujian — ini adalah perayaan perjalanan mereka.
      </p>

    </div>
  </div>
</div>
</section>

          `,
    noted: "Skills development in modeling, acting, and performance."
  },
  { id: 2,
    title: "eJPeace Coffee", 
    banner: b1,
    image: coffeImg,     
    description: `
     <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

  <!-- TITLE CARD -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8">
    <h2 class="text-3xl font-bold text-gray-900">EJ PEACE COFFEE</h2>
    <p class="text-gray-700 leading-relaxed mt-4 text-base sm:text-lg">
      EJ Peace Coffee bukan sekadar coffee shop. Kami adalah playground anak muda Bandung
      yang hidup dari kreativitas, visual, dan pengalaman. Di sini kopi bukan cuma minuman —
      tapi medium untuk berkarya, tempat nongkrong yang relatable, dan ruang aman buat semua vibes yang chill.
    </p>
  </div>

  <!-- OUR STORY -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8">
    <h3 class="text-2xl font-semibold text-gray-900 mb-4">Our Story</h3>
    <p class="text-gray-700 leading-relaxed text-base sm:text-lg">
      EJ Peace Coffee didirikan pada tahun 2023 sebagai bagian dari EJ Peace Entertainment,
      sebuah rumah kreatif yang bergerak di bidang musik, visual, dan pengalaman hiburan.
      Dengan fondasi tersebut, EJ Peace Coffee hadir sebagai coffee shop yang tidak hanya
      menawarkan produk, tetapi juga menghadirkan ruang dengan karakter
      <strong>entertainment driven experience</strong>.
      <br><br>
      Kami memposisikan diri sebagai entertainment space, tempat di mana kualitas kopi,
      suasana nyaman, dan sentuhan kreativitas berpadu. Setiap elemen yang kami hadirkan —
      mulai dari ambience, event, hingga pelayanan — dirancang untuk memberikan pengalaman
      yang relevan bagi generasi muda dan komunitas kreatif.
      <br><br>
      EJ Peace Coffee bukan sekadar destinasi untuk menikmati minuman, tetapi sebuah ruang 
      yang mendukung aktivitas, inspirasi, dan interaksi.
      <br><br>
      <strong>EJ Peace Coffee — where coffee meets experience.</strong>
    </p>
  </div>

  <!-- LOCATIONS -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8">
    <h3 class="text-2xl font-semibold text-gray-900 mb-6">Location</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-4 bg-gray-50 border rounded-lg">
        <h4 class="font-semibold text-lg text-gray-900">EJ Peace Coffee Sritunggal</h4>
        <p class="text-gray-700 mt-1"><strong>Opening Hours:</strong> 16.00 - 01.00</p>
        <p class="text-gray-700 mt-1">
          Jl. Sritunggal No.4, Cigereleng, Kec. Regol, Kota Bandung, Jawa Barat 40253
        </p>
      </div>

      <div class="p-4 bg-gray-50 border rounded-lg">
        <h4 class="font-semibold text-lg text-gray-900">EJ Peace Coffee Mutumanikam</h4>
        <p class="text-gray-700 mt-1"><strong>Opening Hours:</strong> 10.00 - 01.00</p>
        <p class="text-gray-700 mt-1">
          Jl. Mutumanikam No.69, Cijagra, Kec. Lengkong, Kota Bandung, Jawa Barat 40265
        </p>
      </div>
    </div>
  </div>

  <!-- EVENT & COLLAB -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8">
    <h3 class="text-2xl font-semibold text-gray-900 mb-4">Event & Collaboration</h3>
    <p class="text-gray-700 leading-relaxed text-base sm:text-lg">
      EJ Peace Coffee selalu terbuka untuk kolaborasi dan penyelenggaraan event. Kami telah bekerja sama
      dengan berbagai komunitas, brand, sekolah, dan kampus untuk menghadirkan pengalaman yang relevan.
      <br><br>
      Bagi kami, setiap kolaborasi adalah kesempatan untuk menciptakan cerita baru — menggabungkan kreativitas,
      audiens, dan tujuan bersama dalam satu ruang yang hidup.
      <br><br>
      <strong>Mari bangun pengalaman dan cerita berikutnya bersama kami.</strong>
    </p>
  </div>

  <!-- FACILITIES -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8">
    <h3 class="text-2xl font-semibold text-gray-900 mb-4">Facility</h3>

    <p class="text-gray-700 leading-relaxed text-base sm:text-lg mb-6">
      EJ Peace Coffee menyediakan fasilitas yang dirancang untuk kenyamanan aktivitas harian, kerja,
      hingga pertemuan komunitas.
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div class="p-4 bg-gray-50 border rounded-lg">Wi-Fi cepat dan stabil</div>
      <div class="p-4 bg-gray-50 border rounded-lg">Comfort Seating</div>
      <div class="p-4 bg-gray-50 border rounded-lg">Smoking Area</div>
      <div class="p-4 bg-gray-50 border rounded-lg">Colokan di setiap area</div>
      <div class="p-4 bg-gray-50 border rounded-lg">Event-Friendly Space</div>
      <div class="p-4 bg-gray-50 border rounded-lg">Parking Area</div>
    </div>
  </div>

  <!-- TAGLINE -->
  <div class="bg-white shadow-md rounded-xl p-6 sm:p-8 text-center">
    <p class="text-xl sm:text-2xl font-semibold text-gray-900 leading-relaxed">
      Everyday Moments, Entertainment-Driven. <br class="hidden sm:block">
      Community Friendly, Coffee & Stories.
    </p>
  </div>

</section>

    `,
    noted: "Everyday Moments, Entertainment-Driven. Coffee & Stories."},
  { id: 3,
    title: "Peace Club", 
    banner: b4,
    image: clubImg, 
    description: `
      <section class="max-w-6xl mx-auto px-6 py-10 space-y-8">

  <!-- CARD : Title Intro -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-3xl font-bold text-gray-900 mb-3">
      🕊️ PEACE CLUB — Creative Hub for The Next Generation
    </h2>
    <p class="text-gray-700 leading-relaxed">
      Talent Agency • TikTok Live Agency • Creative Youth Community • Event Organizer
      <br><br>
      Peace Club adalah inisiatif kreatif di bawah naungan PT EJPeace Karya Indonesia 
      yang hadir sebagai ruang berkembang bagi generasi muda di era digital. Kami percaya 
      setiap anak muda memiliki potensi kreatif yang unik, dan tugas kami adalah memberikan 
      panggung, bimbingan, serta kesempatan agar potensi itu tumbuh dan terlihat.
      <br><br>
      Peace Club berperan sebagai <strong>Creative Ecosystem Hub</strong>, tempat kreativitas 
      bertemu kesempatan dan talent muda terhubung dengan dunia profesional.
    </p>
  </div>

  <!-- GRID 4 SECTION -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <!-- CARD 1: Talent Agency -->
    <div class="bg-white shadow-md rounded-xl p-6">
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">1. Talent Agency</h3>
      <p class="text-gray-700 leading-relaxed">
        Peace Club Talent Agency menjadi wadah untuk menemukan, membina, serta 
        mengembangkan talent muda berbakat. Kami memberikan pendampingan profesional, 
        pelatihan dasar, hingga kesempatan tampil di berbagai proyek kreatif.
      </p>

      <ul class="list-disc pl-5 mt-3 space-y-2 text-gray-700">
        <li>Pelatihan modeling dan presenting</li>
        <li>Creative content development</li>
        <li>Peluang tampil di project kreatif</li>
        <li>Pendampingan profesional dan karakter</li>
      </ul>
    </div>

    <!-- CARD 2: TikTok Live Agency -->
    <div class="bg-white shadow-md rounded-xl p-6">
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">2. TikTok Live Agency</h3>
      <p class="text-gray-700 leading-relaxed">
        Peace Club mendampingi kreator dari tahap dasar hingga menjadi performer 
        percaya diri dan stabil dalam dunia live entertainment.
      </p>

      <ul class="list-disc pl-5 mt-3 space-y-2 text-gray-700">
        <li>Pelatihan performa & komunikasi</li>
        <li>Pendampingan kreatif dan improvisasi</li>
        <li>Quality control & evaluasi performa</li>
        <li>Peluang monetisasi yang sehat</li>
      </ul>
    </div>

    <!-- CARD 3: Creative Youth Community -->
    <div class="bg-white shadow-md rounded-xl p-6">
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">3. Creative Youth Community</h3>
      <p class="text-gray-700 leading-relaxed">
        Peace Club adalah komunitas kreatif terbuka bagi seluruh anak muda untuk 
        bereksplorasi, belajar, dan bertumbuh dalam suasana yang positif dan suportif.
      </p>

      <ul class="list-disc pl-5 mt-3 space-y-2 text-gray-700">
        <li>Creative Meet-Up</li>
        <li>Creative Talks</li>
        <li>Creative Exploration Session</li>
        <li>Safe space untuk eksplorasi</li>
      </ul>
    </div>

    <!-- CARD 4: Event Organizer -->
    <div class="bg-white shadow-md rounded-xl p-6">
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">4. Event Organizer (EO)</h3>
      <p class="text-gray-700 leading-relaxed">
        Peace Club EO fokus pada event kreatif, edukatif, dan youth-oriented yang 
        dikemas dengan sentuhan estetika yang segar dan relevan bagi generasi muda.
      </p>

      <ul class="list-disc pl-5 mt-3 space-y-2 text-gray-700">
        <li>Seminar inspiratif</li>
        <li>Creative expo</li>
        <li>Youth movement events</li>
        <li>Festival kabaret & musik</li>
      </ul>
    </div>

  </div>

  <!-- CARD: Ecosystem -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Peace Club sebagai Ekosistem Kreatif</h3>
    <p class="text-gray-700 leading-relaxed">
      Keempat lini Peace Club saling terhubung dan membentuk ekosistem yang utuh:
    </p>

    <div class="mt-4 p-4 bg-gray-50 rounded-lg border text-center font-semibold text-gray-800">
      Talent → Creative Community → Event → Industry Opportunity
    </div>

    <p class="text-gray-700 leading-relaxed mt-4">
      Dengan pendekatan ini, Peace Club mampu memberikan perjalanan lengkap bagi anak muda, 
      mulai dari mengenal kreativitas hingga mendapatkan kesempatan tampil dan bekerja 
      di industri kreatif.
    </p>
  </div>

  <!-- CARD: Mission -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Misi Peace Club</h3>

    <ul class="list-disc pl-5 space-y-3 text-gray-700 leading-relaxed">
      <li>Membantu generasi muda menemukan dan mengembangkan potensi kreatif.</li>
      <li>Memberikan ruang aman untuk eksplorasi dan belajar.</li>
      <li>Menyediakan peluang nyata melalui kolaborasi dan jaringan industri.</li>
      <li>Menghubungkan komunitas, talent, dan dunia profesional.</li>
      <li>Berperan dalam perkembangan industri kreatif Indonesia.</li>
    </ul>
  </div>

</section>

    `,
    noted: "Talent & Live Agency • Creative Youth Movement • Event Organizer." },
  { id: 4,
    title: "eJPeace Entertainment", 
    banner: b2,
    image: entImg, 
    description: `
        <section class="max-w-6xl mx-auto px-6 py-10 space-y-8">

  <!-- TITLE CARD -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h2 class="text-3xl font-bold text-gray-900">eJPeace Entertainment</h2>
    <p class="text-gray-700 leading-relaxed mt-3">
      <strong>Create. Develop. Transform Entertainment.</strong><br>
      eJPeace Entertainment adalah perusahaan hiburan modern yang bergerak di bidang Music Label, 
      Digital Entertainment Company, dan Artist Management. Kami menghadirkan ekosistem kreatif 
      yang profesional, relevan, dan berkelanjutan untuk talenta muda, musisi, kreator digital, 
      hingga performer.
      <br><br>
      Hiburan bukan hanya tentang karya yang tampil di layar atau panggung, tetapi perjalanan 
      membentuk identitas, proses kreatif, dan keberanian tampil sebagai diri sendiri.
    </p>
  </div>

  <!-- MAIN PILLAR -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Pilar Utama: Industri Hiburan Modern yang Terintegrasi</h3>
    <p class="text-gray-700 leading-relaxed">
      Sebagai bagian dari ekosistem kreatif eJPeace, kami menjalankan tiga lini utama: Music Label, 
      Digital Entertainment Company, dan Artist Management.
    </p>
  </div>

  <!-- MUSIC LABEL -->
  <div class="bg-white shadow-md rounded-xl p-6 space-y-6 max-w-5xl mx-auto">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">🎵 Music Label</h3>

    <p class="text-gray-700 leading-relaxed">
      eJPeace Entertainment berperan dalam produksi musik dengan pendekatan kreatif dan strategis. Talent 
      mendapatkan dukungan lengkap mulai dari songwriting, recording, production, branding, dan digital release.
      <br><br>
      Tujuan kami bukan hanya merilis lagu — tetapi membangun artis dengan karakter kuat dan fanbase nyata.
    </p>

   <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

  <!-- Card 1 -->
  <div class="">
    <iframe
      style="border-radius:12px"
      src="https://open.spotify.com/embed/track/58uO701GoHUFU3epegyb8i?utm_source=generator&theme=0"
      width="100%"
      height="352"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy">
    </iframe>
  </div>

  <!-- Card 2 -->
  <div class="">
    <iframe
      style="border-radius:12px"
      src="https://open.spotify.com/embed/track/0Jo4zVPyXGI4Zke68b7pHV?utm_source=generator&theme=0"
      width="100%"
      height="352"
      frameborder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy">
    </iframe>
  </div>

  <!-- Card 3 (Full width + no border + height dua kali) -->
  <div class="w-full  col-span-2">
    <iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/album/2MopWLAkCQq2ZSwCYjc6t0?utm_source=generator&theme=0" width="100%" height="152" 
    frameBorder="0" allowfullscreen="" 
    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
  </div>
</div>


  <!-- DIGITAL ENTERTAINMENT -->
    <div class="bg-white shadow-md rounded-xl p-6 space-y-6 max-w-5xl mx-auto">
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">🎬 Digital Entertainment Company</h3>

      <p class="text-gray-700 leading-relaxed">
        Di era digital, konten adalah panggung. Kami menghadirkan short content, web-series, music video, 
        creator program, hingga kolaborasi brand dengan produksi yang estetis dan strategis.
      </p>

      <!-- YouTube Grid (2 videos) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Video 1 -->
        <div class="aspect-video w-full rounded-xl overflow-hidden shadow-md">
          <iframe 
            class="w-full h-full"
            src="https://www.youtube.com/embed/zPuQMM2zTzE"
            title="YouTube video player"
            allowfullscreen>
          </iframe>
        </div>

        <!-- Video 2 -->
        <div class="aspect-video w-full rounded-xl overflow-hidden shadow-md">
          <iframe 
            class="w-full h-full"
            src="https://www.youtube.com/embed/34orYleZ_14"
            title="YouTube video player"
            allowfullscreen>
          </iframe>
        </div>

      </div>
    </div>


  <!-- ARTIST MANAGEMENT -->
  <div class="bg-white shadow-md rounded-xl p-6 space-y-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">⭐ Artist Management</h3>

    <p class="text-gray-700 leading-relaxed">
      Kami menjadi rumah bagi talent yang ingin berkembang secara profesional. Mulai dari personal branding, 
      media training, skill development, monetisasi, hingga career roadmap.
    </p>

    <!-- 3 Artist Photos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

  <!-- CARD ITEM -->
  <div class="relative group rounded-xl overflow-hidden shadow-md cursor-pointer">
    <img src="${ejp}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <span class="text-white text-lg font-semibold">eJPeace - Comedy Boyband</span>
    </div>
  </div>

  <!-- CARD ITEM -->
  <div class="relative group rounded-xl overflow-hidden shadow-md cursor-pointer">
    <img src="${coco}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <span class="text-white text-lg font-semibold">Coco - Kids GirlGroup</span>
    </div>
  </div>

  <!-- CARD ITEM -->
  <div class="relative group rounded-xl overflow-hidden shadow-md cursor-pointer">
    <img src="${papilo}" class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
      <span class="text-white text-lg font-semibold">Papilonia - Poppunk Band</span>
    </div>
  </div>

</div>


  <!-- ECOSYSTEM SUPPORT -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Ekosistem eJPeace</h3>
    <p class="text-gray-700 leading-relaxed">
      Talent mendapatkan akses penuh ke Talent Agency, Creative Youth Community, Production Studio, 
      Event Organizer, hingga kesempatan tampil di showcase dan proyek komersial.
    </p>
  </div>

  <!-- PROGRAMS -->
  <div class="bg-white shadow-md rounded-xl p-6 space-y-4">
    <h3 class="text-2xl font-semibold text-gray-900">Program & Aktivitas</h3>

    <ul class="list-disc pl-6 space-y-2 text-gray-700">
      <li><strong>Talent Development Program</strong> — mentoring musikalitas, performa, public speaking, & digital branding.</li>
      <li><strong>Content Talent Lab</strong> — kolaborasi konsisten untuk produksi konten kreatif.</li>
      <li><strong>Music & Creative Production Line</strong> — pipeline profesional untuk lagu, video, dan konten unggulan.</li>
      <li><strong>Industry & Brand Activation Program</strong> — koneksi talent dengan brand, komunitas, dan event komersial.</li>
    </ul>
  </div>

  <!-- EXPERIENCE -->
  <div class="bg-white shadow-md rounded-xl p-6">
    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Showcase, Release & Real-World Experience</h3>
    <p class="text-gray-700 leading-relaxed">
      Talent mendapatkan pengalaman nyata melalui performance stage, digital release, creator showcase, 
      music release, hingga brand collaboration.
    </p>
  </div>

<!-- VISION -->
<div class="bg-white shadow-md rounded-xl p-6">
  <h3 class="text-2xl font-semibold text-gray-900 mb-6">
    Visi eJPeace Entertainment
  </h3>

  <!-- GRID CARD -->
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Profesional secara skill dan attitude
      </p>
    </div>

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Berani menjadi diri sendiri
      </p>
    </div>

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Siap tampil di skala lokal hingga global
      </p>
    </div>

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Memiliki identitas artistik yang kuat
      </p>
    </div>

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Tumbuh dari ekosistem hiburan yang sehat dan suportif
      </p>
    </div>

    <div class="p-5 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-gray-800 font-medium">
        Membawa identitas kreatif Bandung ke panggung nasional & internasional
      </p>
    </div>

  </div>
</div>

  <!-- TAGLINE -->
  <div class="bg-white shadow-md rounded-xl p-6 text-center">
    <p class="text-xl font-semibold text-gray-900">
      Empowering music, digital content, and rising creative talent.
    </p>
  </div>

</section>
    ` ,
    noted: "Empowering music, digital content, and rising creative talent."},
  { id: 5,
    title: "eJPeace Studio", 
    banner: b3,
    image: studioImg, 
    description: `
    <div class="max-w-5xl mx-auto space-y-10">

  <!-- HEADER -->
  <div class="bg-white p-6 rounded-xl shadow-md space-y-4">
    <h2 class="text-3xl font-bold text-gray-900">EJPeace Studio</h2>

    <p class="text-gray-700 leading-relaxed">
      EJPeace Studio adalah ruang kreatif yang dirancang khusus untuk talenta, komunitas seni, dan individu
      yang ingin berkembang melalui seni pergerakan dan ekspresi. Sebagai bagian dari ekosistem EJPeace,
      studio ini hadir bukan hanya sebagai ruang fisik, tetapi sebagai wadah tumbuhnya karya, disiplin,
      dan budaya kreatif di Bandung.
      <br><br>
      Dengan fasilitas yang terjaga, pencahayaan optimal, dan area yang dirancang profesional serta estetis,
      EJPeace Studio menawarkan pengalaman ruang latihan dan produksi konten yang lebih personal,
      lebih profesional, dan lebih kreatif.
    </p>
  </div>



  <!-- DANCE STUDIO -->
  <div class="bg-white p-6 rounded-xl shadow-md space-y-6">
    <h3 class="text-2xl font-semibold text-gray-900">💃 Dance Studio</h3>

    <p class="text-gray-700 leading-relaxed">
      Dance Studio EJPeace menawarkan lantai nyaman, cermin berdimensi besar, dan sistem audio berkualitas.
      Cocok untuk:
    </p>

    <ul class="text-gray-700 space-y-1 list-disc ml-6">
      <li>Latihan dance profesional & komunitas</li>
      <li>Kelas dance publik atau privat</li>
      <li>Rehearsal koreografi</li>
      <li>Shooting konten dance, TikTok, atau komersial</li>
      <li>Persiapan kompetisi atau showcase</li>
    </ul>

    <p class="text-gray-700 leading-relaxed">
      Dance Studio EJPeace menjadi pilihan utama bagi penari, koreografer, performer, dan content creator
      yang mengutamakan kenyamanan ruang dan kualitas fasilitas.
    </p>

    <!-- Dance Studio Image -->
    <div class="w-full h-64 rounded-xl overflow-hidden">
      <img src="https://via.placeholder.com/900x500" class="w-full h-full object-cover" />
    </div>
  </div>



  <!-- MODELING STUDIO -->
  <div class="bg-white p-6 rounded-xl shadow-md space-y-6">
    <h3 class="text-2xl font-semibold text-gray-900">📸 Modeling Studio</h3>

    <p class="text-gray-700 leading-relaxed">
      Modeling Studio EJPeace adalah ruang untuk runway practice, latihan posture, ekspresi pose,
      hingga persiapan profesional di dunia modeling & entertainment.
      Cocok untuk:
    </p>

    <ul class="text-gray-700 space-y-1 list-disc ml-6">
      <li>Latihan runway dan posture</li>
      <li>Kelas modeling profesional</li>
      <li>Personal practice untuk model & public figure</li>
      <li>Photo session & video portfolio</li>
      <li>Persiapan casting dan kompetisi modeling</li>
    </ul>

    <p class="text-gray-700 leading-relaxed">
      Ruang ini dirancang agar talent menemukan kepercayaan diri, eksplorasi diri, dan pengalaman belajar
      yang mendalam dengan lingkungan yang private dan profesional.
    </p>

    <!-- Modeling Studio Image -->
    <div class="w-full h-64 rounded-xl overflow-hidden">
      <img src="https://via.placeholder.com/900x500" class="w-full h-full object-cover" />
    </div>
  </div>



  <!-- FOR WHO -->
  <div class="bg-white p-6 rounded-xl shadow-md space-y-6">
    <h3 class="text-2xl font-semibold text-gray-900">Untuk Siapa EJPeace Studio?</h3>

    <ul class="text-gray-700 space-y-2">
      <li>✔ Model dan penari profesional</li>
      <li>✔ Talent yang sedang berkembang</li>
      <li>✔ Komunitas seni, dancer, atau kreator sosial media</li>
      <li>✔ Brand & agency yang membutuhkan studio</li>
      <li>✔ Pengajar untuk kelas privat atau workshop</li>
    </ul>

    <p class="text-gray-700 leading-relaxed">
      Dengan akses mudah, sistem booking modern, dan pengalaman penyewaan yang aman dan transparan,
      EJPeace Studio menjawab kebutuhan ruang kreatif yang fleksibel dan profesional.
    </p>
  </div>



  <!-- CLOSING -->
  <div class="bg-white p-6 rounded-xl shadow-md space-y-4">
    <h3 class="text-2xl font-semibold text-gray-900">Lebih dari Sekadar Studio</h3>

    <p class="text-gray-700 leading-relaxed">
      EJPeace Studio adalah bagian dari visi besar EJPeace: membangun ruang di mana kreativitas tumbuh,
      talent berkembang, dan komunitas bergerak maju bersama.
      <br><br>
      Ini bukan sekadar ruang sewa—ini adalah tempat di mana proses menjadi sama pentingnya dengan hasil.
      <br><br>
      <strong>Selamat datang di EJPeace Studio. Tempat di mana gerakan menjadi bahasa, dan kreativitas menjadi identitas.</strong>
    </p>
  </div>

</div>

    `,
    noted: "Dance and modeling studio offering space for talent and creators." },
];



