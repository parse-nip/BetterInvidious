import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { CategoriesBar } from '../components/CategoriesBar';
import { VideoGrid } from '../components/VideoGrid';

export function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = () => {
    setLoading(true);
    setError(null);
    const norm = (d: unknown): Video[] => Array.isArray(d) ? d : (d as { videos?: Video[] })?.videos ?? [];
    // Use Gaming type for home: default "livestreams" returns live items with sparse metadata (no views/length).
    // Gaming browse returns regular videos with full viewCount, lengthSeconds, etc.
    api
      .getTrending(undefined, 'Gaming')
      .then((data) => {
        const list = norm(data);
        if (list.length > 0) return list;
        return api.getPopular().then(norm);
      })
      .catch(() => api.getPopular().then(norm))
      .then((list) => {
        setVideos(list);
        // Enrich videos missing authorThumbnails in background (avoids blocking initial display)
        const needs = list.filter((v) => !v.authorThumbnails?.length && v.authorId);
        if (needs.length === 0) return;
        Promise.all(
          needs.map(async (v) => {
            try {
              const ch = await api.getChannel(v.authorId!);
              return { ...v, authorThumbnails: ch.authorThumbnails };
            } catch {
              return v;
            }
          })
        ).then((enriched) => {
          setVideos((prev) => {
            const next = [...prev];
            enriched.forEach((e) => {
              const i = next.findIndex((p) => p.videoId === e.videoId);
              if (i >= 0) next[i] = e;
            });
            return next;
          });
        });
      })
      .catch((e) => setError(e?.message ?? String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVideos();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <CategoriesBar />
        <div className="p-6 flex flex-col gap-4">
          <p className="text-red-500">Failed to load videos: {error}</p>
          <button
            onClick={() => { setError(null); loadVideos(); }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium w-fit"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <CategoriesBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 p-4">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
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
          ))
        ) : videos.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">
            <p className="mb-4">No videos loaded. Ensure Invidious is running with Companion.</p>
            <button
              onClick={loadVideos}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </div>
    </div>
  );
}
