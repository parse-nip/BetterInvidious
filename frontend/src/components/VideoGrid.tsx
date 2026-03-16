import type { Video, SearchResult } from '../lib/api';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: (Video | SearchResult)[];
  showChannelAvatar?: boolean;
}

export function VideoGrid({ videos, showChannelAvatar = true }: VideoGridProps) {
  const videoItems = videos.filter((v) => (v as Video).videoId || (v as SearchResult).videoId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
      {videoItems.map((video) => (
        <VideoCard
          key={(video as Video).videoId ?? (video as SearchResult).videoId}
          video={video}
          showChannelAvatar={showChannelAvatar}
        />
      ))}
    </div>
  );
}
