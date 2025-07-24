import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  try {
    const { data, error } = await supabase
      .from('anime')
      .select(
        `
        *,
        episodes (
          id,
          episode_number,
          gdrive_file_id_480p,
          gdrive_file_id_720p,
          gdrive_file_id_1080p
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new NextResponse(
          JSON.stringify({ error: `Anime dengan ID ${id} tidak ditemukan` }),
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Error fetching anime ID ${id}:`, errorMessage);

    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
}