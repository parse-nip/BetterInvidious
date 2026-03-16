import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Playlist } from '../lib/api';

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getPlaylists()
      .then(setPlaylists)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load playlists: {error}</p>
        <p className="text-[var(--yt-text-secondary)] mt-2">
          You may need to <a href="/login" className="text-[var(--yt-accent)]">log in</a> to view your playlists.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <h1 className="text-xl font-medium mb-4 text-[var(--yt-text)]">
        Library
      </h1>
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-[var(--yt-bg-secondary)]" />
              <div className="h-4 bg-[var(--yt-bg-secondary)] rounded mt-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <p className="text-[var(--yt-text-secondary)]">
          No playlists yet. Create playlists from the playlist page.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {playlists.map((pl) => (
            <Link
              key={pl.playlistId}
              to={`/playlist?list=${pl.playlistId}`}
              className="block no-underline text-inherit hover:opacity-90"
            >
              <div className="aspect-video rounded-xl overflow-hidden bg-[var(--yt-bg-secondary)]">
                {pl.videos?.[0] && (
                  <img
                    src={`/vi/${pl.videos[0].videoId}/mqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="text-sm font-medium mt-2 line-clamp-2 text-[var(--yt-text)]">
                {pl.title}
              </h3>
              <p className="text-xs text-[var(--yt-text-secondary)]">
                {(pl as { videoCount?: number }).videoCount ?? pl.videos?.length ?? 0} videos
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
