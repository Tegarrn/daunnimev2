'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  resolutions: {
    '480p'?: string | null;
    '720p'?: string | null;
    '1080p'?: string | null;
  };
}

export default function VideoPlayer({ resolutions }: VideoPlayerProps) {
  const [selectedResolution, setSelectedResolution] = useState<'480p' | '720p' | '1080p'>('720p');

  const availableResolutions = Object.entries(resolutions)
    .filter(([, gdriveId]) => gdriveId)
    .map(([quality]) => quality as '480p' | '720p' | '1080p');
  
  const gdriveFileId = resolutions[selectedResolution];

  if (availableResolutions.length === 0 || !gdriveFileId) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
        <p className="text-gray-400">Video tidak tersedia.</p>
      </div>
    );
  }

  const embedUrl = `https://drive.google.com/file/d/${gdriveFileId}/preview`;

  return (
    <div className="w-full">
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="border-0"
          key={gdriveFileId} // Ganti key untuk memaksa iframe memuat ulang
        ></iframe>
      </div>
      <div className="flex justify-center items-center gap-2 mt-2">
        <span className="text-sm text-gray-300">Pilih Resolusi:</span>
        {availableResolutions.map((res) => (
          <button
            key={res}
            onClick={() => setSelectedResolution(res)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedResolution === res
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {res}
          </button>
        ))}
      </div>
    </div>
  );
}