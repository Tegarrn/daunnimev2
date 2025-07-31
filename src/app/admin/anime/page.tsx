// src/app/admin/anime/page.tsx

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Anime } from '@/types';
import { deleteAnime } from './actions';

function DeleteButton({ id }: { id: number }) {
  const deleteAnimeWithId = deleteAnime.bind(null, id);
  return (
    <form action={deleteAnimeWithId}>
      <button 
        type="submit" 
        className="text-red-400 hover:text-red-300 text-xs"
        onClick={(e) => {
            if (!confirm('Apakah Anda yakin ingin menghapus anime ini? Semua episode terkait juga akan dihapus.')) {
                e.preventDefault();
            }
        }}
      >
        Hapus
      </button>
    </form>
  );
}

export default async function ManageAnimePage() {
  // FIX: Add 'await' here
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  const { data: animeList } = await supabase.from('anime').select('*').order('title');

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Kelola Anime</h2>
        <Link href="/admin/anime/new" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm">
          + Tambah Anime Baru
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-3">Judul</th>
              <th className="p-3">Tipe</th>
              <th className="p-3">Status</th>
              <th className="p-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(animeList as Anime[])?.map(anime => (
              <tr key={anime.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-3 font-medium">{anime.title}</td>
                <td className="p-3">{anime.anime_type}</td>
                <td className="p-3">{anime.status}</td>
                <td className="p-3 flex items-center gap-4">
                  <Link href={`/admin/anime/${anime.id}/edit`} className="text-indigo-400 hover:text-indigo-300 text-xs">
                    Edit
                  </Link>
                  <DeleteButton id={anime.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}