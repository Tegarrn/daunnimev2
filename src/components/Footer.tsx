// src/components/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        <p>Pustaka Anime Pribadi v2.0 &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">Dibuat dengan Next.js, Tailwind CSS, dan Supabase.</p>
      </div>
    </footer>
  );
}