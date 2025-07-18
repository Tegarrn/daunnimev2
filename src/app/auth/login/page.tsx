'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Redirect or show success message.
      // For now, we just show a message.
      setMessage('Login berhasil! Anda akan diarahkan...');
      // In a real app, you'd redirect:
      // window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white">Login</h2>
      <form className="space-y-6" onSubmit={handleLogin}>
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}
      <p className="mt-4 text-sm text-center text-gray-400">
        Belum punya akun?{' '}
        <Link href="/auth/register" className="font-medium text-indigo-400 hover:text-indigo-300">
          Daftar di sini
        </Link>
      </p>
    </div>
  );
}