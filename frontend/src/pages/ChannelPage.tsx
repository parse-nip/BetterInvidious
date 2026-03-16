import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { Channel, Video } from '../lib/api';
import { getAuthorThumbnail, getThumbnailUrl, formatDuration, formatViews } from '../lib/api';

const TABS = ['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community'] as const;

function ChannelVideoCard({ video }: { video: Video }) {
  const thumbUrl = getThumbnailUrl({ videoId: video.videoId, videoThumbnails: video.videoThumbnails });
  const duration = video.lengthSeconds != null ? formatDuration(video.lengthSeconds) : '0:00';
  return (
    <Link to={`/watch?v=${video.videoId}`} className="flex flex-col gap-3 cursor-pointer group no-underline text-inherit">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <img src={thumbUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">{duration}</div>
      </div>
      <div className="flex gap-3 pr-6">
        <img src={getAuthorThumbnail(video)} alt="" className="w-9 h-9 rounded-full object-cover mt-0.5" />
        <div className="flex flex-col">
          <h3 className="text-base font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-blue-600">{video.title}</h3>
          <div className="text-sm text-gray-600 flex flex-col">
            <span>{video.viewCount != null ? formatViews(video.viewCount) + ' views' : ''}</span>
            <span>{video.publishedText}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ChannelPage() {
  const { ucid } = useParams<{ ucid: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') ?? 'Home';
  const activeTab = TABS.includes(tabParam as (typeof TABS)[number]) ? (tabParam as (typeof TABS)[number]) : 'Home';

  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelVideos, setChannelVideos] = useState<Video[]>([]);
  const [channelPlaylists, setChannelPlaylists] = useState<{ title: string; playlistId: string; videoCount?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!ucid) {
      setError('No channel ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.getChannel(ucid).then(setChannel).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [ucid]);

  useEffect(() => {
    if (!ucid || !channel) return;
    if (activeTab === 'Videos') {
      setTabLoading(true);
      api.getChannelVideos(ucid).then((r) => setChannelVideos(r.videos ?? [])).catch(() => setChannelVideos([])).finally(() => setTabLoading(false));
    } else if (activeTab === 'Playlists') {
      setTabLoading(true);
      api.getChannelPlaylists(ucid).then((r) => setChannelPlaylists(r.playlists ?? [])).catch(() => setChannelPlaylists([])).finally(() => setTabLoading(false));
    }
  }, [ucid, channel, activeTab]);

  const setTab = (t: (typeof TABS)[number]) => setSearchParams((p) => {
    const next = new URLSearchParams(p);
    if (t === 'Home') next.delete('tab');
    else next.set('tab', t);
    return next;
  });

  if (!ucid) return <div className="p-6 text-red-500">No channel specified</div>;
  if (error) return <div className="p-6 text-red-500">Failed to load channel: {error}</div>;
  if (loading || !channel) {
    return (
      <div className="animate-pulse">
        <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-gray-200" />
        <div className="max-w-[1280px] mx-auto px-4 py-6 flex gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  const banner = channel.authorBanners?.[0]?.url;
  const avatarUrl = getAuthorThumbnail(channel);
  const latestVideos = channel.latestVideos ?? [];
  const subCount = channel.subCount != null ? channel.subCount.toLocaleString() : '';
  const videoCount = latestVideos.length;
  const videos = activeTab === 'Videos' ? channelVideos : activeTab === 'Shorts' ? latestVideos.filter((v) => (v.lengthSeconds ?? 0) <= 60) : activeTab === 'Live' ? latestVideos.filter((v) => v.liveNow) : latestVideos;
  const playlists = activeTab === 'Playlists' ? channelPlaylists : [];

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="w-full h-32 sm:h-48 md:h-56 lg:h-64 bg-gray-200">
        {banner && <img src={banner} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {avatarUrl ? (
            <img src={avatarUrl} alt={channel.author} className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-purple-600" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{channel.author}</h1>
            <div className="text-gray-600 text-sm mb-3 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">@{ucid.replace('@', '')}</span>
              <span>•</span>
              <span>{subCount} subscribers</span>
              <span>•</span>
              <span>{videoCount} videos</span>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl line-clamp-2 mb-4">
              {channel.description?.slice(0, 200) ?? `Welcome to ${channel.author}!`}
            </p>
            <button
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                isSubscribed ? 'bg-gray-100 text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200 mt-4">
        <div className="flex gap-8 text-sm font-medium text-gray-600 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab ? 'border-black text-black' : 'border-transparent hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto pt-6 pb-12">
        <h2 className="px-4 sm:px-6 lg:px-8 text-lg font-bold mb-2">{activeTab === 'Home' ? 'For You' : activeTab}</h2>
        {activeTab === 'Playlists' ? (
          tabLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video rounded-xl bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <p className="px-4 text-gray-600">No playlists</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 p-4">
              {playlists.map((pl) => (
                <Link key={pl.playlistId} to={`/playlist?list=${pl.playlistId}`} className="flex flex-col gap-3 no-underline text-inherit">
                  <div className="aspect-video rounded-xl bg-gray-200" />
                  <h3 className="text-base font-semibold line-clamp-2">{pl.title}</h3>
                  <p className="text-sm text-gray-600">{pl.videoCount ?? 0} videos</p>
                </Link>
              ))}
            </div>
          )
        ) : activeTab === 'Community' ? (
          <p className="px-4 text-gray-600">Community tab</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 p-4">
            {(tabLoading && activeTab === 'Videos' ? [] : videos).length === 0 ? (
              tabLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video rounded-xl bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded mt-3 w-3/4" />
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No videos</p>
              )
            ) : (
              videos.map((v) => <ChannelVideoCard key={v.videoId} video={v} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
