import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { VideoGrid } from '../components/VideoGrid';
import { getHistoryIds } from '../lib/history';

export function HistoryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const ids = getHistoryIds();
    if (!ids.length) {
      setVideos([]);
      setLoading(false);
      return;
    }
    Promise.allSettled(ids.slice(0, 50).map((id) => api.getVideo(id)))
      .then((results) => {
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Video> => r.status === 'fulfilled')
          .map((r) => r.value);
        setVideos(loaded);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-4">
      <h1 className="text-xl font-medium mb-4 text-[var(--yt-text)]">
        History
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
      ) : videos.length === 0 ? (
        <p className="text-[var(--yt-text-secondary)]">
          No watch history yet. Videos you watch will appear here.
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
