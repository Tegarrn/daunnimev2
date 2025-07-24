import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const anime_id = searchParams.get('anime_id');
  const user_id_param = searchParams.get('user_id');

  // Mengambil semua item daftar untuk pengguna tertentu (untuk profil publik)
  if (user_id_param) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const { data, error } = await supabase
          .from('user_anime_list')
          .select('id, created_at, status, anime!inner(*)')
          .eq('user_id', user_id_param)
          .order('created_at', { ascending: false });

      if (error) {
          return new NextResponse(JSON.stringify({ error: 'Failed to fetch user anime list', details: error.message }), { status: 500 });
      }
      return NextResponse.json({ data });
  }

  // Mengambil status untuk anime tertentu untuk pengguna yang login
  const { user, error: authError, client } = await getSupabaseClient(request);
  if (authError || !user || !client) {
    return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
  }

  if (!anime_id) {
     return new NextResponse(JSON.stringify({ error: 'anime_id is required' }), { status: 400 });
  }

  try {
    const { data, error } = await client
      .from('user_anime_list')
      .select('status')
      .eq('user_id', user.id)
      .eq('anime_id', anime_id)
      .single();

    return NextResponse.json({ status: data?.status || null, error: error?.message });
  } catch (error) {
    const err = error as { code: string, message: string };
    if (err.code === 'PGRST116') { // Tidak ada record, bukan error
        return NextResponse.json({ status: null });
    }
    return new NextResponse(JSON.stringify({ error: 'Failed to check anime list status', details: err.message }), { status: 500 });
  }
}

// Menambah atau memperbarui item di daftar pengguna
export async function POST(request: NextRequest) {
  const { anime_id, status } = await request.json();
  const { user, error: authError, client } = await getSupabaseClient(request);

  if (authError || !user || !client) {
    return new NextResponse(JSON.stringify({ error: authError }), { status: 401 });
  }

  if (!anime_id || !status) {
    return new NextResponse(JSON.stringify({ error: 'anime_id and status are required' }), { status: 400 });
  }

  try {
    const { data, error } = await client
      .from('user_anime_list')
      .upsert({ user_id: user.id, anime_id, status })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to add/update user anime list', details: errorMessage }), { status: 500 });
  }
}

// Menghapus item dari daftar pengguna
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
        .from('user_anime_list')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', anime_id);
  
      if (error) throw error;
      return NextResponse.json({ message: 'Item removed from list successfully' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return new NextResponse(JSON.stringify({ error: 'Failed to remove item from list', details: errorMessage }), { status: 500 });
    }
}