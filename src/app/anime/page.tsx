// src/app/anime/page.tsx

import AnimeCard from '@/components/AnimeCard';
import { Anime } from '@/types';

async function getAllAnime(): Promise<Anime[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    // Mengambil semua data anime dari endpoint yang sudah ada
    const res = await fetch(`${apiUrl}/anime`, { next: { revalidate: 3600 } }); // Revalidate setiap 1 jam
    if (!res.ok) return [];
    
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching all anime:", error);
    return [];
  }
}

export default async function AllAnimePage() {
  const animeList = await getAllAnime();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Daftar Semua Anime</h1>
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>Tidak ada data anime yang ditemukan.</p>
        </div>
      )}
    </div>
  );
}