// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // Impor Footer

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pustaka Anime Pribadi',
  description: 'Proyek Pustaka Anime Pribadi v2.0',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-900 flex flex-col min-h-screen`}>
        <Navbar /> {/* Ini berfungsi sebagai header */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}