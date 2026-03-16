import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { addToHistory } from '../lib/history';
import type { Video } from '../lib/api';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentsSection } from '../components/CommentsSection';
import { formatViews, getAuthorThumbnail, getThumbnailUrl } from '../lib/api';

const SvgThumbsUp = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.97 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>;
const SvgThumbsDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.27-.27.44-.65.44-1.06v-2c0-.26-.05-.5-.14-.73l3.02-7.05C16.54 3.5 15.83 3 15 3zm4 0v12h4V3h-4z" /></svg>;
const SvgShare2 = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const SvgDownload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const SvgMoreHorizontal = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>;
function RelatedVideo({ v }: { v: Video }) {
  const thumbUrl = getThumbnailUrl({ videoId: v.videoId, videoThumbnails: v.videoThumbnails });
  const duration = v.lengthSeconds != null ? `${Math.floor(v.lengthSeconds / 60)}:${(v.lengthSeconds % 60).toString().padStart(2, '0')}` : '0:00';
  return (
    <Link to={`/watch?v=${v.videoId}`} className="flex gap-2 cursor-pointer group no-underline text-inherit">
      <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
        <img src={thumbUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{duration}</div>
      </div>
      <div className="flex flex-col py-0.5 pr-2">
        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 leading-tight mb-1">{v.title}</h4>
        <Link to={`/channel/${v.authorId}`} className="text-xs text-gray-600 hover:text-gray-900 no-underline" onClick={(e) => e.stopPropagation()}>{v.author}</Link>
        <span className="text-xs text-gray-600">{v.viewCount != null ? formatViews(v.viewCount) + ' views' : ''} • {v.publishedText}</span>
      </div>
    </Link>
  );
}

export function WatchPage() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoreDesc, setShowMoreDesc] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!videoId) {
      setError('No video ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    api.getVideo(videoId, true).then(setVideo).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false));
  }, [videoId]);

  useEffect(() => {
    if (videoId && video) {
      addToHistory(videoId);
    }
  }, [videoId, video]);


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  if (!videoId) return <div className="p-6 text-red-500">No video specified. Use ?v=VIDEO_ID</div>;
  if (error) {
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const is429 = /429|rate limit|limiting/i.test(error);
    const isUnavailable = /video unavailable|404/i.test(error);
    return (
      <div className="pt-4 px-4 sm:px-6 max-w-xl w-full">
        <p className="text-red-500 mb-4">Failed to load video: {error}</p>
        {is429 && (
          <p className="text-gray-600 text-sm mb-4">
            YouTube is rate limiting this instance. This may last up to 24 hours. You can watch directly on YouTube:
          </p>
        )}
        {isUnavailable && !is429 && (
          <p className="text-gray-600 text-sm mb-4">
            YouTube may be blocking this Invidious instance. You can try watching directly on YouTube:
          </p>
        )}
        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium no-underline"
        >
          Watch on YouTube
        </a>
      </div>
    );
  }
  if (loading || !video) {
    return (
      <div className="p-4 lg:p-6 animate-pulse">
        <div className="aspect-video bg-gray-200 rounded-xl" />
        <div className="mt-4 h-6 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  const recommended = video.recommendedVideos ?? [];
  const likeCount = (video as Video & { likeCount?: number }).likeCount ?? 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex-1">
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
          <VideoPlayer video={video} autoPlay={false} />
        </div>
        <h1 className="text-xl font-bold mt-4 mb-2">{video.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={`/channel/${video.authorId}`}>
              {getAuthorThumbnail(video) ? (
                <img src={getAuthorThumbnail(video)} alt={video.author} className="w-10 h-10 rounded-full cursor-pointer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600" />
              )}
            </Link>
            <div>
              <Link to={`/channel/${video.authorId}`} className="font-semibold text-base cursor-pointer no-underline text-inherit block">
                {video.author}
              </Link>
              <p className="text-xs text-gray-600">{video.subCountText ?? '0'} subscribers</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-full font-medium ml-2 hover:bg-gray-800">
              Subscribe
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
            <div className="flex items-center bg-gray-100 rounded-full">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-l-full border-r border-gray-300">
                <SvgThumbsUp />
                <span className="text-sm font-medium">{formatViews(likeCount)}</span>
              </button>
              <button className="px-4 py-2 hover:bg-gray-200 rounded-r-full">
                <SvgThumbsDown />
              </button>
            </div>
            <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap">
              <SvgShare2 />
              <span className="text-sm font-medium">{shareCopied ? 'Copied!' : 'Share'}</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap hidden md:flex">
              <SvgDownload />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
              <SvgMoreHorizontal />
            </button>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 mt-4 text-sm">
          <div className="font-medium mb-1">{video.viewCount != null ? formatViews(video.viewCount) + ' views' : ''} • {video.publishedText}</div>
          <p className="whitespace-pre-wrap">
            {video.description?.slice(0, showMoreDesc ? undefined : 300)}
            {!showMoreDesc && video.description && video.description.length > 300 ? '...' : ''}
          </p>
          {video.description && video.description.length > 300 && (
            <button className="mt-2 font-medium text-blue-600 hover:underline" onClick={() => setShowMoreDesc((v) => !v)}>
              {showMoreDesc ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
        {!loading && !error && videoId && (
          <div className="mt-6">
            <CommentsSection videoId={videoId} />
          </div>
        )}
      </div>
      <div className="w-full lg:w-[400px] flex flex-col gap-3">
        {recommended.slice(0, 10).map((v) => (
          <RelatedVideo key={v.videoId} v={v} />
        ))}
      </div>
    </div>
  );
}
