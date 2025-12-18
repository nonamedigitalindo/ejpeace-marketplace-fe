import { useState } from "react";

export default function Footer() {
  const [showTerms, setShowTerms] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  const termsContent = `
    1. Pengantar
    Selamat datang di situs resmi EJPeace Entertainment. Dengan mengakses dan menggunakan situs ini, Anda menyetujui untuk terikat oleh syarat dan ketentuan berikut. Apabila Anda tidak menyetujui salah satu dari syarat ini, mohon untuk tidak menggunakan situs ini.

    2. Definisi
    "Layanan" berarti seluruh produk dan jasa yang ditawarkan oleh EJPeace Entertainment, termasuk namun tidak terbatas pada produksi kreatif, penyediaan konten, dan manajemen talent.
    "Pengguna" berarti setiap individu atau entitas yang mengakses atau menggunakan situs dan layanan kami.

    3. Akses dan Penggunaan Situs
    Pengguna dilarang untuk:
    - Melakukan tindakan yang melanggar hukum atau norma etika.
    - Mengakses, mengubah, atau meretas sistem situs kami.
    - Menggunakan data atau konten dalam situs ini untuk kepentingan komersial tanpa persetujuan tertulis dari kami.

    4. Hak Kekayaan Intelektual
    Seluruh konten yang terdapat dalam situs ini, termasuk tetapi tidak terbatas pada teks, grafik, logo, audio, video, dan perangkat lunak adalah milik EJPeace Entertainment dan dilindungi oleh hukum hak cipta yang berlaku. Dilarang keras menduplikasi, menggunakan, atau menyebarluaskan konten tanpa izin resmi.

    5. Informasi Pengguna
    Kami mengumpulkan informasi tertentu dari pengguna sesuai dengan Kebijakan Privasi kami. Dengan menggunakan situs ini, Anda menyetujui pengumpulan dan penggunaan informasi sebagaimana diatur dalam kebijakan tersebut.

    6. Transaksi dan Pembayaran
    Seluruh transaksi dilakukan melalui sistem pembayaran elektronik yang aman, termasuk metode kartu kredit.
    Pengguna bertanggung jawab atas keakuratan informasi pembayaran.
    Pembayaran dianggap sah setelah dikonfirmasi oleh sistem kami.

    7. Pembatalan dan Refund
    Kebijakan pembatalan dan pengembalian dana diatur secara terpisah pada bagian Refund Policy. Pastikan Anda membacanya sebelum melakukan transaksi.

    8. Perubahan Ketentuan
    EJPeace Entertainment berhak sewaktu-waktu untuk mengubah, memperbarui, atau mengganti bagian dari syarat dan ketentuan ini tanpa pemberitahuan terlebih dahulu. Perubahan akan segera berlaku setelah dipublikasikan di situs ini.

    9. Hukum yang Berlaku
    Syarat dan Ketentuan ini diatur oleh dan ditafsirkan berdasarkan hukum Republik Indonesia.
  `;

  const refundContent = `
    💳 Refund Policy
    Kebijakan Pengembalian Dana EJPeace Entertainment

    1. Ketentuan Umum
    EJPeace Entertainment berkomitmen untuk memberikan layanan berkualitas tinggi. Namun, dalam kondisi tertentu, kami menyediakan opsi pengembalian dana (refund) sesuai dengan ketentuan berikut.

    2. Kelayakan Pengembalian Dana
    Pengajuan refund dapat dipertimbangkan apabila:

    Layanan belum dimulai atau diproses.

    Terjadi kesalahan sistem pembayaran seperti transaksi ganda.

    Kegagalan layanan dari pihak kami yang dapat dibuktikan secara objektif.

    3. Layanan yang Tidak Memenuhi Syarat Refund
    Pengembalian dana tidak berlaku untuk:

    Layanan digital atau kreatif (desain, video, audio) yang sudah dimulai proses produksi.

    Booking studio, talent, atau acara yang dibatalkan sepihak oleh klien tanpa pemberitahuan 3 hari sebelumnya.

    Ketidakpuasan subjektif yang tidak disertai pelanggaran terhadap deskripsi layanan.

    4. Prosedur Pengajuan Refund
    Untuk mengajukan pengembalian dana, silakan:

    Kirim email ke: ej.peace2@gmail.com dengan subjek: Permintaan Refund

    Sertakan: nama lengkap, nomor transaksi, tanggal transaksi, dan alasan refund.

    Permintaan harus diajukan maksimal 3 hari kalender setelah transaksi.

    Tim kami akan meninjau dan memberikan keputusan dalam waktu 5–7 hari kerja.

    5. Proses Pengembalian Dana
    Jika disetujui, pengembalian dana akan dilakukan ke metode pembayaran awal dalam jangka waktu maksimal 14 hari kerja, tergantung pada kebijakan bank atau penyedia layanan pembayaran yang digunakan.
  `;

  return (
    <>
      <footer className="w-full bg-black text-white mt-10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Brand */}
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold">eJPeace</h2>
              <p className="text-sm text-gray-400">
                Event • Store • Entertainment
              </p>
            </div>
            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm mt-6">
              © 2025 eJPeace — All Rights Reserved.
            </div>
            {/* Navigation */}
            <div className="flex flex-col gap-6 text-sm">

              {/* Top Menu - 3 kolom */}
              <div className="grid grid-cols-3 gap-4 text-center md:text-left">
                <a href="/ejpeace/home" className="hover:text-yellow-400 transition">HOME</a>
                <a href="/ejpeace/event" className="hover:text-yellow-400 transition">EVENT</a>
                <a href="/ejpeace/store" className="hover:text-yellow-400 transition">STORE</a>
              </div>

              {/* Bottom Menu - 2 kolom */}
              <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                <button
                  onClick={() => setShowTerms(true)}
                  className="hover:text-yellow-400 transition underline"
                >
                  Terms & Conditions
                </button>

                <button
                  onClick={() => setShowRefund(true)}
                  className="hover:text-yellow-400 transition underline"
                >
                  Refund Policy
                </button>
              </div>

            </div>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Terms & Conditions</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="whitespace-pre-line text-sm text-gray-700">
              {termsContent}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Policy Modal */}
      {showRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Refund Policy</h2>
              <button
                onClick={() => setShowRefund(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="whitespace-pre-line text-sm text-gray-700">
              {refundContent}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRefund(false)}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
