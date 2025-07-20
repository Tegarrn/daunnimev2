import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const { data, error } = await supabase
      .from('anime')
      .select(
        `
        *,
        episodes (
          id,
          episode_number,
          gdrive_file_id_720p
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
      throw new Error(error.message);
    }

    return NextResponse.json({ data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(
      JSON.stringify({
        error: 'Gagal mengambil data detail anime',
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}