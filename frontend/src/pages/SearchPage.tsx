import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { SearchResult } from '../lib/api';
import { VideoGrid } from '../components/VideoGrid';
import { CategoriesBar } from '../components/CategoriesBar';
import { getAuthorThumbnail } from '../lib/api';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    api
      .search(q)
      .then(setResults)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  const videoResults = results.filter((r) => r.type === 'video' || r.videoId);
  const channelResults = results.filter((r) => r.type === 'channel');
  const playlistResults = results.filter((r) => r.type === 'playlist');

  return (
    <>
      <CategoriesBar />
      <div className="pt-4 px-4">
        {!q.trim() ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <div className="text-4xl font-bold text-black mb-6">
              <span className="text-red-600">Invidious</span>
            </div>
            <p className="text-gray-600">Enter a search term above</p>
          </div>
        ) : error ? (
          <div className="p-6 text-red-500">Search failed: {error}</div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 p-4">
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
          <div className="space-y-8 p-4">
            {channelResults.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">Channels</h2>
                <div className="flex flex-wrap gap-4">
                  {channelResults.map((ch) => (
                    <Link
                      key={ch.authorId ?? ch.title}
                      to={`/channel/${ch.authorId ?? ''}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 no-underline text-inherit"
                    >
                      <img
                        src={getAuthorThumbnail(ch)}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-black">{ch.author ?? ch.title}</p>
                        <p className="text-xs text-gray-600">
                          {(ch as { videoCount?: number }).videoCount ?? ch.videoCount ?? 0} videos
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {playlistResults.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">Playlists</h2>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                  {playlistResults.map((pl) => (
                    <Link
                      key={pl.playlistId ?? pl.title}
                      to={`/playlist?list=${pl.playlistId ?? ''}`}
                      className="block no-underline text-inherit hover:opacity-90"
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-200">
                        {(pl.playlistThumbnail || pl.videoThumbnails?.[0]?.url) && (
                          <img
                            src={pl.playlistThumbnail ?? pl.videoThumbnails![0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-sm font-medium mt-2 line-clamp-2 text-black">
                        {pl.title}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {(pl as { videoCount?: number }).videoCount ?? pl.videoCount ?? 0} videos
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {videoResults.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4">Videos</h2>
                <VideoGrid videos={videoResults} />
              </section>
            )}
            {!loading && videoResults.length === 0 && channelResults.length === 0 && playlistResults.length === 0 && q.trim() && (
              <p className="text-gray-600 py-8">No results found</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
