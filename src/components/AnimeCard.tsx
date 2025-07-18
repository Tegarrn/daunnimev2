import Link from 'next/link';
import Image from 'next/image'; // Gunakan komponen Image dari Next.js
import { Anime } from '@/types';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  // Buat URL ke API proxy kita dengan GDrive ID dari database
  const imageUrl = `/api/image-proxy/${anime.thumbnail_gdrive_id}`;

  return (
    <Link href={`/anime/${anime.id}`} className="block group">
      <div className="aspect-[2/3] w-full bg-gray-700 rounded-lg overflow-hidden relative">
        {anime.thumbnail_gdrive_id ? (
          <Image
            src={imageUrl}
            alt={`Thumbnail for ${anime.title}`}
            fill // 'fill' akan mengisi div parent, pastikan parent memiliki posisi 'relative'
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            unoptimized // Diperlukan jika GDrive mengubah URL secara dinamis
          />
        ) : (
          // Fallback jika tidak ada thumbnail ID
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
      <h3 className="mt-2 text-md font-semibold text-white truncate group-hover:text-indigo-400">
        {anime.title}
      </h3>
      <p className="text-sm text-gray-400">{anime.anime_type}</p>
    </Link>
  );
}