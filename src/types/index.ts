export interface AnimeInfo {
  studio?: string;
  duration?: string;
  [key: string]: unknown;
}

export interface Anime {
  id: number;
  created_at: string;
  title: string;
  synopsis: string;
  genres: string[];
  thumbnail_gdrive_id: string;
  info: AnimeInfo | null;
  gdrive_folder_id: string;
  status: string;
  anime_type: string;
  release_date: string;
  rating_score: number;
}

export interface Rating {
  id: number;
  score: number;
  review: string | null;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  }
}