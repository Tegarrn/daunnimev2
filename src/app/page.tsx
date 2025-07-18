// src/app/page.tsx

import AnimeCard from '@/components/AnimeCard';
import { Anime } from '@/types';
import Link from 'next/link';

async function getLatestAnime(): Promise<Anime[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const res = await fetch(`${apiUrl}/anime/latest`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    
    const { data } = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching latest anime:", error);
    return [];
  }
}

export default async function Home() {
  const latestAnime = await getLatestAnime();

  return (
    <main className="container mx-auto px-4 py-8">
      
      {/* Seksi Hero/Welcome */}
      <section className="text-center bg-gray-800 p-8 rounded-lg mb-12">
        <h1 className="text-4xl font-bold text-white">Selamat Datang di Pustaka Anime</h1>
        <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
          Jelajahi, tonton, dan lacak koleksi anime pribadi Anda. Berinteraksi dengan komunitas dan naikkan level!
        </p>
        <div className="mt-6">
          <Link href="/anime" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
            Lihat Semua Koleksi
          </Link>
        </div>
      </section>

      {/* Seksi Anime Terbaru */}
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">Baru Ditambahkan</h2>
        {latestAnime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {latestAnime.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Belum ada anime yang ditambahkan.</p>
          </div>
        )}
      </section>
    </main>
  );
}