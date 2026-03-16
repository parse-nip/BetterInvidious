import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Playlist } from '../lib/api';
import { VideoGrid } from '../components/VideoGrid';

export function PlaylistPage() {
  const [searchParams] = useSearchParams();
  const plid = searchParams.get('list');
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plid) {
      setError('No playlist ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getPlaylist(plid)
      .then(setPlaylist)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [plid]);

  if (!plid) {
    return (
      <div className="p-6 text-red-400">
        No playlist specified. Use ?list=PLAYLIST_ID
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Failed to load playlist: {error}
      </div>
    );
  }

  if (loading || !playlist) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--yt-bg-secondary)] rounded w-64 mb-4" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-video rounded-xl bg-[var(--yt-bg-secondary)]" />
              <div className="h-4 bg-[var(--yt-bg-secondary)] rounded mt-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const videos = playlist.videos ?? [];

  return (
    <div>
      <h1 className="text-2xl font-medium mb-2 text-[var(--yt-text)]">
        {playlist.title}
      </h1>
      {playlist.author && (
        <p className="text-sm text-[var(--yt-text-secondary)] mb-6">
          {playlist.author}
          {playlist.videoCount != null && ` • ${playlist.videoCount} videos`}
        </p>
      )}
      <VideoGrid videos={videos} />
    </div>
  );
}
