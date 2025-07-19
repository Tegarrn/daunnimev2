import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Fungsi helper untuk mendapatkan Supabase client yang sudah terotentikasi dengan token pengguna.
// Ini memastikan semua operasi (tambah/hapus) dilakukan oleh pengguna yang sah.
async function getSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized', client: null };
  }
  const token = authHeader.split(' ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { user: null, error: 'Invalid token', client: null };
  }

  return { user, error: null, client: supabase };
}

// Handler untuk GET request
// Digunakan untuk 2 kasus:
// 1. Mengecek status bookmark satu anime untuk pengguna yang login.
// 2. Mengambil semua daftar bookmark untuk ditampilkan di halaman profil publik.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const anime_id = searchParams.get('anime_id');
  const user_id_param = searchParams.get('user_id');

  // Kasus 2: Mengambil daftar bookmark untuk profil publik
  if (user_id_param) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data, error } = await supabase
          .from('bookmarks')
          .select('id, created_at, anime!inner(*)')
          .eq('user_id', user_id_param)
          .order('created_at', { ascending: false });

      if (error) {
          return new NextResponse(JSON.stringify({ error: 'Failed to fetch bookmarks', details: error.message }), { status: 500 });
      }
      return NextResponse.json({ data });
  }

  // Kasus 1: Cek status bookmark untuk pengguna yang login
  const { user, error: authError, client } = await getSupabaseClient(request);
  if (authError || !user || !client) {
    return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
  }

  if (!anime_id) {
     return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
  }

  try {
    const { data, error } = await client
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('anime_id', anime_id)
      .single();

    return NextResponse.json({ isBookmarked: !!data, error: error?.message });
  } catch (error: any) {
    // Tidak perlu mengembalikan error jika tidak ditemukan (single() akan error), cukup kembalikan isBookmarked: false
    if (error.code === 'PGRST116') {
        return NextResponse.json({ isBookmarked: false });
    }
    return new NextResponse(JSON.stringify({ error: 'Failed to check bookmark status', details: error.message }), { status: 500 });
  }
}

// Handler untuk POST request: Menambah bookmark baru
export async function POST(request: NextRequest) {
  const { anime_id } = await request.json();
  const { user, error: authError, client } = await getSupabaseClient(request);

  if (authError || !user || !client) {
    return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
  }

  if (!anime_id) {
    return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
  }

  try {
    const { data, error } = await client
      .from('bookmarks')
      .insert({ user_id: user.id, anime_id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: 'Failed to add bookmark', details: error.message }), { status: 500 });
  }
}

// Handler untuk DELETE request: Menghapus bookmark
export async function DELETE(request: NextRequest) {
    const { anime_id } = await request.json();
    const { user, error: authError, client } = await getSupabaseClient(request);
  
    if (authError || !user || !client) {
      return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
    }
  
    if (!anime_id) {
      return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
    }
  
    try {
      const { error } = await client
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', anime_id);
  
      if (error) throw error;
      return NextResponse.json({ message: 'Bookmark removed successfully' });
    } catch (error: any) {
      return new NextResponse(JSON.stringify({ error: 'Failed to remove bookmark', details: error.message }), { status: 500 });
    }
  }
