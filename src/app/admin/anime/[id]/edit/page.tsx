// src/app/admin/anime/[id]/edit/page.tsx

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { updateAnime } from '../../actions';
import { AnimeForm } from '../../new/page';
import Link from 'next/link';

export default async function EditAnimePage({ params }: { params: { id: string } }) {
  // CONFIRM: Ensure 'await' is here
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

  const { data: anime } = await supabase
    .from('anime')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!anime) {
    notFound();
  }
  
  const updateAnimeWithId = updateAnime.bind(null, anime.id);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Edit: {anime.title}</h2>
      <form action={updateAnimeWithId} className="space-y-4">
        <AnimeForm anime={anime} />
        <div className="flex justify-end gap-4 mt-6">
            <Link href="/admin/anime" className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Batal</Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Perbarui</button>
        </div>
      </form>
    </div>
  );
}