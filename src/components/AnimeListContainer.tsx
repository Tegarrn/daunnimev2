/*
================================================================================
| FILE: src/components/AnimeListContainer.tsx
| DESKRIPSI: Komponen untuk menampilkan daftar anime dan logika filter genre.
| PERAN: Client Component - Mengelola interaksi pengguna di browser.
================================================================================
*/
'use client';

import { useState, useEffect } from 'react';
import { Anime } from '@/types';
import AnimeCard from './AnimeCard';
import GenreFilter from './GenreFilter';

// Kategori genre sesuai permintaan Anda
const genreCategories = {
  'Aksi & Pertarungan': ['Action', 'Martial Arts', 'Samurai', 'Supernatural', 'Delinquents', 'DPS', 'Mythology'],
  'Petualangan & Dunia Baru': ['Adventure', 'Fantasy', 'Isekai', 'Reincarnation', 'Time Travel', 'Video Game'],
  'Drama & Emosi': ['Drama', 'Psychological', 'Suspense', 'Tragedy'],
  'Komedi & Kehidupan Ringan': ['Comedy', 'School', 'Slice of Life', 'Childcare', 'Seinen', 'Shoujo'],
  'Romansa & Hubungan': ['Romance', 'Harem', 'Girls Love', 'Shounen Ai', 'Shoujo Ai'],
  'Genre Khusus & Unik': ['Sports', 'Team Sports', 'Detective', 'Historical', 'Medical', 'Mythology', 'Anthropomorphic', 'Racing'],
  'Demografi Umum': ['Shounen', 'Seinen', 'Josei', 'Shoujo', 'Adult Cast'],
};

interface AnimeListContainerProps {
  initialAnimeList: Anime[];
}

export default function AnimeListContainer({ initialAnimeList }: AnimeListContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>(initialAnimeList);

  // useEffect ini akan berjalan setiap kali pengguna memilih kategori baru.
  useEffect(() => {
    if (selectedCategory === 'Semua') {
      setFilteredAnime(initialAnimeList);
    } else {
      const activeGenres = genreCategories[selectedCategory as keyof typeof genreCategories];
      const newFilteredList = initialAnimeList.filter(anime =>
        // Cek apakah ada genre dari anime yang termasuk dalam daftar genre kategori yang aktif
        anime.genres.some(genre => activeGenres.includes(genre))
      );
      setFilteredAnime(newFilteredList);
    }
  }, [selectedCategory, initialAnimeList]);

  // Jika data awal kosong (misalnya karena API gagal), tampilkan pesan.
  if (!initialAnimeList || initialAnimeList.length === 0) {
    return (
        <div className="text-center py-20 text-gray-400 bg-gray-800 rounded-lg">
            <p>Gagal memuat daftar anime atau tidak ada anime yang tersedia.</p>
        </div>
    );
  }

  return (
    <div>
      <GenreFilter
        categories={genreCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      {filteredAnime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {filteredAnime.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 bg-gray-800 rounded-lg">
          <p>Tidak ada anime yang cocok dengan kategori "{selectedCategory}".</p>
        </div>
      )}
    </div>
  );
}
