import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { CategoriesBar } from '../components/CategoriesBar';
import { VideoGrid } from '../components/VideoGrid';

export function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [feedLabel, setFeedLabel] = useState<'Recommended' | 'Trending' | null>(null);

  const loadVideos = () => {
    setLoading(true);
    setError(null);
    setFeedLabel(null);
    const norm = (d: unknown): Video[] => Array.isArray(d) ? d : (d as { videos?: Video[] })?.videos ?? [];
    const fallback = () =>
      api.getTrending(undefined, 'Gaming').then((data) => {
        const list = norm(data);
        if (list.length > 0) return list;
        return api.getPopular().then(norm);
      }).catch(() => api.getPopular().then(norm));
    // Try recommended first (auth required); fallback to trending/popular for guests or on error
    api
      .getRecommended()
      .then((list) => {
        if (list.length > 0) {
          setFeedLabel('Recommended');
          return list;
        }
        setFeedLabel('Trending');
        return fallback();
      })
      .catch(() => {
        setFeedLabel('Trending');
        return fallback();
      })
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
      {feedLabel && (
        <div className="px-4 pt-2">
          <span className="text-sm font-medium text-gray-500">
            {feedLabel === 'Recommended' ? 'Recommended for you' : 'Trending'}
          </span>
        </div>
      )}
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
        ) : videos.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
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
