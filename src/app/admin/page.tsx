// Tidak ada impor atau logika server yang diperlukan di sini, cukup tampilkan UI.
// Ini akan memperbaiki error "Cannot find module './actions'".
export default function AdminDashboardPage() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Selamat Datang, Admin!</h2>
      <p className="text-gray-300">
        Gunakan menu navigasi di samping untuk mulai mengelola konten Pustaka Anime.
      </p>
    </div>
  );
}