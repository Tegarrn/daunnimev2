// src/app/search/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimeCard from '@/components/AnimeCard';
import { Anime } from '@/types';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/anime/search?q=${query}`)
      .then(res => res.json())
      .then(({ data }) => {
        setResults(data || []);
      })
      .catch(err => console.error("Failed to fetch search results:", err))
      .finally(() => setLoading(false));

  }, [query]);

  if (loading) {
    return <p className="text-center text-gray-400 py-20">Mencari...</p>;
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6">
        Hasil Pencarian untuk: <span className="text-indigo-400">{query}</span>
      </h1>
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {results.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-20">Tidak ada hasil yang ditemukan untuk "{query}".</p>
      )}
    </>
  );
}


export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<div className="text-center text-gray-400 py-20">Loading...</div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}