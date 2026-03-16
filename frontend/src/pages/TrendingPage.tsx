import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { VideoGrid } from '../components/VideoGrid';

export function TrendingPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTrending()
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load trending: {error}
      </div>
    );
  }

  return (
    <div className="p-4">
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-gray-200" />
              <div className="flex gap-3 mt-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
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
