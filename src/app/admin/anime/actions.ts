// src/app/admin/anime/actions.ts

'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createAnime(formData: FormData) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // FIX: The delete method only takes the cookie name
          cookieStore.delete(name);
        },
      },
    }
  );

  const animeData = {
    title: formData.get('title') as string,
    synopsis: formData.get('synopsis') as string,
    genres: (formData.get('genres') as string).split(',').map(g => g.trim()),
    thumbnail_gdrive_id: formData.get('thumbnail_gdrive_id') as string,
    gdrive_folder_id: formData.get('gdrive_folder_id') as string,
    status: formData.get('status') as string,
    anime_type: formData.get('anime_type') as string,
    release_date: formData.get('release_date') as string,
    rating_score: parseFloat(formData.get('rating_score') as string),
    info: { studio: formData.get('studio') as string }
  };

  const { error } = await supabase.from('anime').insert(animeData);

  if (error) {
    console.error('Error creating anime:', error.message);
    return;
  }

  revalidatePath('/admin/anime');
  revalidatePath('/anime');
  revalidatePath('/');
  redirect('/admin/anime');
}

export async function updateAnime(id: number, formData: FormData) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: CookieOptions) {
              // FIX: The delete method only takes the cookie name
              cookieStore.delete(name);
            },
          },
        }
    );

    const animeData = {
        title: formData.get('title') as string,
        synopsis: formData.get('synopsis') as string,
        genres: (formData.get('genres') as string).split(',').map(g => g.trim()),
        thumbnail_gdrive_id: formData.get('thumbnail_gdrive_id') as string,
        gdrive_folder_id: formData.get('gdrive_folder_id') as string,
        status: formData.get('status') as string,
        anime_type: formData.get('anime_type') as string,
        release_date: formData.get('release_date') as string,
        rating_score: parseFloat(formData.get('rating_score') as string),
        info: { studio: formData.get('studio') as string }
    };
  
    const { error } = await supabase.from('anime').update(animeData).eq('id', id);
  
    if (error) {
      console.error('Error updating anime:', error.message);
      return;
    }
  
    revalidatePath(`/admin/anime/${id}/edit`);
    revalidatePath('/admin/anime');
    revalidatePath(`/anime/${id}`);
    redirect('/admin/anime');
}

export async function deleteAnime(id: number) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: CookieOptions) {
              // FIX: The delete method only takes the cookie name
              cookieStore.delete(name);
            },
          },
        }
    );

    const { error: episodeError } = await supabase.from('episodes').delete().eq('anime_id', id);
    if (episodeError) {
        console.error('Error deleting episodes:', episodeError.message);
        return;
    }

    const { error: animeError } = await supabase.from('anime').delete().eq('id', id);
    if (animeError) {
        console.error('Error deleting anime:', animeError.message);
        return;
    }

    revalidatePath('/admin/anime');
    revalidatePath('/anime');
    redirect('/admin/anime');
}