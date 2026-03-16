import { videos as defaultVideos } from '../data/mockData';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos?: any[];
  onChannelClick?: (channelName: string, channelAvatar: string) => void;
  onVideoClick?: (video: any) => void;
}

export function VideoGrid({ videos = defaultVideos, onChannelClick, onVideoClick }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10 p-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} onChannelClick={onChannelClick} onVideoClick={onVideoClick} />
      ))}
    </div>
  );
}
