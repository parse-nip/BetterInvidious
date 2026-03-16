import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Video } from '../lib/api';
import { getThumbnailUrl, getAuthorThumbnail, formatDuration, getViewCountDisplay } from '../lib/api';
import { CategoriesBar } from '../components/CategoriesBar';

function VideoCard({ video }: { video: Video }) {
  const thumbUrl = getThumbnailUrl({ videoId: video.videoId, videoThumbnails: video.videoThumbnails });
  const avatarUrl = getAuthorThumbnail(video);
  const viewCountText = getViewCountDisplay(video);
  const publishedText = video.publishedText ?? '';
  const duration = video.lengthSeconds != null ? formatDuration(video.lengthSeconds) : '0:00';

  return (
    <Link to={`/watch?v=${video.videoId}`} className="flex flex-col gap-3 cursor-pointer group no-underline text-inherit">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <img
          src={thumbUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <div className="flex gap-3 pr-6">
        <Link to={`/channel/${video.authorId}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={video.author} className="w-9 h-9 rounded-full object-cover mt-0.5 hover:opacity-80" loading="lazy" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 mt-0.5" />
          )}
        </Link>
        <div className="flex flex-col">
          <h3 className="text-base font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-blue-600">
            {video.title}
          </h3>
          <div className="text-sm text-gray-600 flex flex-col">
            <Link to={`/channel/${video.authorId}`} className="hover:text-gray-900 no-underline text-inherit" onClick={(e) => e.stopPropagation()}>
              {video.author}
            </Link>
            <span>{[viewCountText, publishedText].filter(Boolean).join(' • ') || '\u2014'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
      .then(setVideos)
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
          videos.map((video) => <VideoCard key={video.videoId} video={video} />)
        )}
      </div>
    </div>
  );
}
