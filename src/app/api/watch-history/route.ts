import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { episode_id } = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Missing token.' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Invalid token.' }),
        { status: 401 }
      );
    }

    const user_id = user.id;
    const XP_PER_EPISODE = 10;

    const { data: existingRecord, error: checkError } = await supabase
      .from('watch_history')
      .select('id')
      .eq('user_id', user_id)
      .eq('episode_id', episode_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from('watch_history')
        .insert({ user_id, episode_id });
      if (insertError) throw insertError;

      const { error: rpcError } = await supabase.rpc('add_xp', {
        user_id_input: user_id,
        xp_amount: XP_PER_EPISODE,
      });
      if (rpcError) throw rpcError;

      return NextResponse.json({ message: 'History recorded and XP awarded' });
    }

    return NextResponse.json({ message: 'Episode already watched' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Watch History Error:', errorMessage);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to process watch history',
        details: errorMessage,
      }),
      { status: 500 }
    );
  }
}