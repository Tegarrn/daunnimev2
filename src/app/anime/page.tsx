import { Anime } from '@/types';
import AnimeListContainer from '@/components/AnimeListContainer'; // Impor komponen baru

// Fungsi ini berjalan di server untuk mengambil semua data anime
async function getAllAnime(): Promise<Anime[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Jika URL API tidak ada, kembalikan array kosong untuk mencegah error
  if (!apiUrl) {
    console.error("API URL is not defined.");
    return [];
  }

  try {
    // Mengambil data dari endpoint API internal
    const res = await fetch(`${apiUrl}/anime`, { 
      next: { revalidate: 3600 } // Cache data selama 1 jam
    });

    if (!res.ok) {
      console.error("Failed to fetch anime list:", res.statusText);
      return [];
    }
    
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching all anime:", error);
    return [];
  }
}

export default async function AllAnimePage() {
  // Panggil fungsi untuk mendapatkan data di server
  const animeList = await getAllAnime();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Daftar Semua Anime</h1>
      
      {/* Kirim data awal (initialAnimeList) sebagai prop ke Client Component.
        Ini membuat halaman memuat dengan cepat dengan data yang sudah ada.
      */}
      <AnimeListContainer initialAnimeList={animeList} />
    </div>
  );
}