import { createAnime } from '../actions';
import Link from 'next/link';

export default function NewAnimePage() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Tambah Anime Baru</h2>
      <form action={createAnime} className="space-y-4">
        <AnimeForm />
        <div className="flex justify-end gap-4 mt-6">
            <Link href="/admin/anime" className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-500">Batal</Link>
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Simpan</button>
        </div>
      </form>
    </div>
  );
}

export function AnimeForm({ anime }: { anime?: any } = {}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300">Judul</label>
                    <input type="text" name="title" id="title" defaultValue={anime?.title || ''} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="synopsis" className="block text-sm font-medium text-gray-300">Sinopsis</label>
                    <textarea name="synopsis" id="synopsis" rows={6} defaultValue={anime?.synopsis || ''} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"></textarea>
                </div>
                 <div>
                    <label htmlFor="genres" className="block text-sm font-medium text-gray-300">Genre (pisahkan dengan koma)</label>
                    <input type="text" name="genres" id="genres" defaultValue={anime?.genres?.join(', ') || ''} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label htmlFor="thumbnail_gdrive_id" className="block text-sm font-medium text-gray-300">ID Thumbnail Google Drive</label>
                    <input type="text" name="thumbnail_gdrive_id" id="thumbnail_gdrive_id" defaultValue={anime?.thumbnail_gdrive_id || ''} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <div>
                    <label htmlFor="gdrive_folder_id" className="block text-sm font-medium text-gray-300">ID Folder Google Drive</label>
                    <input type="text" name="gdrive_folder_id" id="gdrive_folder_id" defaultValue={anime?.gdrive_folder_id || ''} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="anime_type" className="block text-sm font-medium text-gray-300">Tipe</label>
                        <input type="text" name="anime_type" id="anime_type" defaultValue={anime?.anime_type || 'TV'} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
                        <input type="text" name="status" id="status" defaultValue={anime?.status || 'Completed'} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="release_date" className="block text-sm font-medium text-gray-300">Tanggal Rilis</label>
                        <input type="date" name="release_date" id="release_date" defaultValue={anime?.release_date || ''} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="rating_score" className="block text-sm font-medium text-gray-300">Rating Awal</label>
                        <input type="number" step="0.1" name="rating_score" id="rating_score" defaultValue={anime?.rating_score || '0'} required className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                    </div>
                </div>
                <div>
                    <label htmlFor="studio" className="block text-sm font-medium text-gray-300">Studio</label>
                    <input type="text" name="studio" id="studio" defaultValue={anime?.info?.studio || ''} className="w-full mt-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
                </div>
            </div>
        </div>
    );
}