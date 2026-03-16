import { useRef, useEffect, useState } from 'react';
import type { Video, FormatStream } from '../lib/api';

interface VideoPlayerProps {
  video: Video;
  autoPlay?: boolean;
}

/** Pick best format from formatStreams (prefer mp4, then by resolution) */
function pickBestFormat(streams: FormatStream[]): FormatStream | null {
  if (!streams?.length) return null;
  const mp4 = streams.filter((s) => s.type?.includes('mp4'));
  const candidates = mp4.length ? mp4 : streams;
  const withHeight = candidates.filter((s) => (s.height ?? 0) > 0 || s.qualityLabel);
  const sorted = withHeight.length
    ? [...withHeight].sort((a, b) => {
        const ah = a.height ?? (parseInt(String(a.qualityLabel ?? '0'), 10) || 0);
        const bh = b.height ?? (parseInt(String(b.qualityLabel ?? '0'), 10) || 0);
        return bh - ah;
      })
    : candidates;
  return sorted[0] ?? candidates[0];
}

export function VideoPlayer({ video, autoPlay }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const formatStreams = video.formatStreams ?? [];
  const hlsUrl = video.hlsUrl;

  const format = pickBestFormat(formatStreams);
  const videoUrl = format?.url
    ? `/latest_version?id=${video.videoId}&itag=${format.itag}`
    : null;

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (autoPlay) {
      el.play().catch(() => {});
    }
  }, [autoPlay, video.videoId]);

  if (video.liveNow && hlsUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay={autoPlay}
          playsInline
          src={hlsUrl}
        />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay={autoPlay}
          playsInline
          src={videoUrl}
          onError={() => setError('Failed to load video')}
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center text-[var(--yt-text-secondary)]">
      No playable format available
    </div>
  );
}
