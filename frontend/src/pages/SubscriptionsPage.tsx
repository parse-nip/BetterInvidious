import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { VideoGrid } from '../components/VideoGrid';

export function SubscriptionsPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getFeed(1)
      .then((data) => setVideos(data.videos ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load feed: {error}</p>
        <p className="text-[var(--yt-text-secondary)] mt-2">
          You may need to <a href="/login" className="text-[var(--yt-accent)]">log in</a> to view your subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <h1 className="text-xl font-medium mb-4 text-[var(--yt-text)]">
        Subscriptions
      </h1>
      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 gap-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-[var(--yt-bg-secondary)]" />
              <div className="flex gap-3 mt-3">
                <div className="w-9 h-9 rounded-full bg-[var(--yt-bg-secondary)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[var(--yt-bg-secondary)] rounded w-full" />
                  <div className="h-3 bg-[var(--yt-bg-secondary)] rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
