import { Link } from "react-router-dom";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7]">
      <div
        className="relative w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/bg-texture.png')" }}
      >
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Pembayaran Gagal
          </h1>
          <p className="text-gray-600 mb-8">
            Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau
            hubungi customer service jika masalah berlanjut.
          </p>

          {/* Error Info Card */}
          <div className="bg-white rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-3">Kemungkinan Penyebab:</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
              <li>Saldo tidak mencukupi</li>
              <li>Pembayaran dibatalkan</li>
              <li>Koneksi terputus</li>
              <li>Waktu pembayaran habis</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Link
              to="/ejpeace/payment"
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Coba Lagi
            </Link>

            <Link
              to="/ejpeace/store"
              className="px-6 py-3 border border-black text-black rounded-md hover:bg-black hover:text-white transition"
            >
              Kembali ke Store
            </Link>

            <Link
              to="/ejpeace/home"
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-100 transition"
            >
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>

      <footer className="w-full py-6 bg-black text-center text-white">
        <p className="text-sm">
          © {new Date().getFullYear()} Peacetival. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
