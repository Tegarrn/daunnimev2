'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setMessage('');

    // Proses pendaftaran menggunakan Supabase Auth
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Menyimpan username ke metadata pengguna
        // Sesuai dokumentasi, ini akan digunakan oleh trigger DB
        // untuk membuat profil baru.
        data: {
          username: username,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        'Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold text-center text-white">Buat Akun Baru</h2>
      <form className="space-y-4" onSubmit={handleRegister}>
        <Input
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={20}
        />
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
          minLength={6}
          placeholder="Minimal 6 karakter"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}
      <p className="mt-4 text-sm text-center text-gray-400">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300">
          Login di sini
        </Link>
      </p>
    </div>
  );
}