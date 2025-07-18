import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('anime') // Mengambil dari tabel 'anime'
      .select('*') // Mengambil semua kolom
      .order('title', { ascending: true }); // Mengurutkan berdasarkan judul

    if (error) {
      console.error('Supabase error:', error.message);
      throw new Error(error.message);
    }

    return NextResponse.json({ data });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Gagal mengambil data anime', details: error.message }),
      { status: 500 }
    );
  }
}