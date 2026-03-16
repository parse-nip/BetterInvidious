import { Link } from 'react-router-dom';
import type { Video, SearchResult } from '../lib/api';
import { getThumbnailUrl, getAuthorThumbnail, formatDuration, getViewCountDisplay, getPublishedDisplay } from '../lib/api';

interface VideoCardProps {
  video: Video | SearchResult;
  showChannelAvatar?: boolean;
}

export function VideoCard({ video, showChannelAvatar = true }: VideoCardProps) {
  const id = (video as Video).videoId ?? (video as SearchResult).videoId;
  const title = (video as Video).title ?? (video as SearchResult).title ?? '';
  const author = (video as Video).author ?? (video as SearchResult).author ?? '';
  const authorId = (video as Video).authorId ?? (video as SearchResult).authorId ?? '';
  const publishedText = getPublishedDisplay((video as Video).publishedText ?? (video as SearchResult).publishedText);
  const lengthSeconds = (video as Video).lengthSeconds ?? (video as SearchResult).lengthSeconds ?? 0;
  const duration = lengthSeconds > 0 ? formatDuration(lengthSeconds) : '0:00';
  const viewCountText = getViewCountDisplay(video as Video & SearchResult);
  const thumbUrl = id ? getThumbnailUrl({ videoId: id, videoThumbnails: video.videoThumbnails }) : '';
  const avatarUrl = getAuthorThumbnail(video);

  if (!id) return null;

  return (
    <Link to={`/watch?v=${id}`} className="flex flex-col gap-3 cursor-pointer group no-underline text-inherit">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <img src={thumbUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" loading="lazy" />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">{duration}</div>
      </div>
      <div className="flex gap-3 pr-6">
        {showChannelAvatar && (
          authorId ? (
            <Link to={`/channel/${authorId}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={author} className="w-9 h-9 rounded-full object-cover mt-0.5 hover:opacity-80" loading="lazy" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-300 mt-0.5" />
              )}
            </Link>
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-300 mt-0.5 shrink-0" />
          )
        )}
        <div className="flex flex-col">
          <h3 className="text-base font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-blue-600">{title}</h3>
          <div className="text-sm text-gray-600 flex flex-col">
            {authorId ? (
              <Link to={`/channel/${authorId}`} className="hover:text-gray-900 no-underline text-inherit" onClick={(e) => e.stopPropagation()}>
                {author || '-'}
              </Link>
            ) : (
              <span>{author || '-'}</span>
            )}
            <span>{[viewCountText, publishedText].filter(Boolean).join(' • ') || '—'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
