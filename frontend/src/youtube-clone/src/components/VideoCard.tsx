interface VideoCardProps {
  key?: string;
  video: {
    id?: string;
    thumbnail: string;
    duration: string;
    title: string;
    channelName: string;
    channelAvatar: string;
    views: string;
    uploadedAt: string;
  };
  onChannelClick?: (channelName: string, channelAvatar: string) => void;
  onVideoClick?: (video: any) => void;
}

export function VideoCard({ video, onChannelClick, onVideoClick }: VideoCardProps) {
  return (
    <div 
      onClick={() => onVideoClick ? onVideoClick(video) : alert(`Playing video: ${video.title}`)}
      className="flex flex-col gap-3 cursor-pointer group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      <div className="flex gap-3 pr-6">
        <img 
          src={video.channelAvatar} 
          alt={video.channelName} 
          onClick={(e) => {
            e.stopPropagation();
            if (onChannelClick) onChannelClick(video.channelName, video.channelAvatar);
          }}
          className="w-9 h-9 rounded-full object-cover mt-0.5 hover:opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col">
          <h3 className="text-base font-semibold line-clamp-2 leading-tight mb-1 group-hover:text-blue-600">
            {video.title}
          </h3>
          <div className="text-sm text-gray-600 flex flex-col">
            <span 
              className="hover:text-gray-900"
              onClick={(e) => {
                e.stopPropagation();
                if (onChannelClick) onChannelClick(video.channelName, video.channelAvatar);
              }}
            >
              {video.channelName}
            </span>
            <span>{video.views} • {video.uploadedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
