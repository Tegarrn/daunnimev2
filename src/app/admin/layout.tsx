// src/app/admin/layout.tsx

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  // ... rest of the component is correct
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Dasbor Admin</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <aside className="md:col-span-1">
                <nav className="flex flex-col gap-2 bg-gray-800 p-4 rounded-lg">
                    <Link href="/admin" className="p-2 rounded hover:bg-gray-700">Beranda</Link>
                    <Link href="/admin/anime" className="p-2 rounded hover:bg-gray-700">Kelola Anime</Link>
                </nav>
            </aside>
            <main className="md:col-span-3">
                {children}
            </main>
        </div>
    </div>
  );
}