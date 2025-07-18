interface VideoPlayerProps {
  gdriveFileId: string;
}

export default function VideoPlayer({ gdriveFileId }: VideoPlayerProps) {
  if (!gdriveFileId) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
        <p className="text-gray-400">ID file video tidak valid.</p>
      </div>
    );
  }

  // URL ini adalah format standar untuk menyematkan pemutar video Google Drive
  const embedUrl = `https://drive.google.com/file/d/${gdriveFileId}/preview`;

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="border-0"
      ></iframe>
    </div>
  );
}