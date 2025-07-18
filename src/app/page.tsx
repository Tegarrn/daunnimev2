import AnimeCard from '@/components/AnimeCard';
import { Anime } from '@/types';

// Fungsi untuk mengambil data anime dari API internal kita
async function getAnimeList(): Promise<Anime[]> {
  // Mengambil URL dasar dari environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Pengecekan jika variabel tidak terdefinisi
  if (!apiUrl) {
    console.error("API URL is not defined in environment variables.");
    return [];
  }

  try {
    // Menggabungkan URL dasar dengan endpoint spesifik
    const res = await fetch(`${apiUrl}/anime`, { cache: 'no-store' });

    if (!res.ok) {
      console.error("Failed to fetch anime list:", await res.text());
      return [];
    }
    
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching from API route:", error);
    return [];
  }
}

export default async function Home() {
  const animeList = await getAnimeList();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Daftar Anime</h1>
      {animeList && animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
          <p className="text-gray-400">
            Tidak ada data anime. Pastikan tabel 'anime' di Supabase sudah terisi.
          </p>
        </div>
      )}
    </main>
  );
}
