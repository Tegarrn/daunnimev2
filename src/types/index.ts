// Tipe ini dibuat berdasarkan skema tabel 'anime' di dokumentasi Anda
export interface Anime {
  id: number;
  created_at: string;
  title: string;
  synopsis: string;
  genres: string[];
  thumbnail_gdrive_id: string;
  info: any; // Anda bisa membuat tipe yang lebih spesifik jika perlu
  gdrive_folder_id: string;
  status: string;
  anime_type: string;
  release_date: string;
  rating_score: number;
}