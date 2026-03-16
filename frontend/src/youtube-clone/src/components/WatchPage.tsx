import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, AlignLeft } from 'lucide-react';
import { videos } from '../data/mockData';

interface WatchPageProps {
  video: any;
  onChannelClick: (name: string, avatar: string) => void;
  onVideoClick: (video: any) => void;
}

export function WatchPage({ video, onChannelClick, onVideoClick }: WatchPageProps) {
  const recommendedVideos = videos.filter(v => v.id !== video.id).slice(0, 10);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex-1">
        {/* Video Player Placeholder */}
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-red-600 transition-colors cursor-pointer">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <h1 className="text-xl font-bold mt-4 mb-2">{video.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={video.channelAvatar} 
              alt={video.channelName} 
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => onChannelClick(video.channelName, video.channelAvatar)}
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 
                className="font-semibold text-base cursor-pointer"
                onClick={() => onChannelClick(video.channelName, video.channelAvatar)}
              >
                {video.channelName}
              </h3>
              <p className="text-xs text-gray-600">{Math.floor(Math.random() * 900) + 100}K subscribers</p>
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-full font-medium ml-2 hover:bg-gray-800">
              Subscribe
            </button>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
            <div className="flex items-center bg-gray-100 rounded-full">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-l-full border-r border-gray-300">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm font-medium">{(Math.random() * 100).toFixed(1)}K</span>
              </button>
              <button className="px-4 py-2 hover:bg-gray-200 rounded-r-full">
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full whitespace-nowrap hidden md:flex">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-gray-100 rounded-xl p-3 mt-4 text-sm">
          <div className="font-medium mb-1">{video.views} views • {video.uploadedAt}</div>
          <p className="whitespace-pre-wrap">
            This is a placeholder description for the video "{video.title}". 
            Watch as we explore amazing content and share incredible moments.
            Don't forget to like, comment, and subscribe for more!
          </p>
        </div>

        {/* Comments Section */}
        <div className="mt-6">
          <div className="flex items-center gap-8 mb-6">
            <h2 className="text-xl font-bold">1,234 Comments</h2>
            <button className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-lg">
              <AlignLeft className="w-5 h-5" />
              Sort by
            </button>
          </div>
          
          {/* Add Comment */}
          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 bg-purple-600 rounded-full text-white flex items-center justify-center font-medium flex-shrink-0">U</div>
            <div className="flex-1">
              <input type="text" placeholder="Add a comment..." className="w-full border-b border-gray-300 focus:border-black outline-none py-1 bg-transparent transition-colors text-sm" />
              <div className="flex justify-end gap-2 mt-2">
                <button className="px-4 py-2 hover:bg-gray-100 rounded-full text-sm font-medium">Cancel</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">Comment</button>
              </div>
            </div>
          </div>

          {/* Comment List */}
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <img src={`https://picsum.photos/seed/user${i}/40/40`} alt={`User ${i}`} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                <div>
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-medium">@user{i}</span>
                    <span className="text-gray-600 text-xs">{i} days ago</span>
                  </div>
                  <p className="text-sm mb-2">This is a highly realistic comment section! Really enjoying the content here. Keep it up!</p>
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 hover:bg-gray-100 p-1.5 rounded-full"><ThumbsUp className="w-4 h-4" /> {i * 12}</button>
                    <button className="hover:bg-gray-100 p-1.5 rounded-full"><ThumbsDown className="w-4 h-4" /></button>
                    <button className="font-medium hover:bg-gray-100 px-3 py-1.5 rounded-full text-xs">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="w-full lg:w-[400px] flex flex-col gap-3">
        {recommendedVideos.map(v => (
          <div key={v.id} className="flex gap-2 cursor-pointer group" onClick={() => onVideoClick(v)}>
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">{v.duration}</div>
            </div>
            <div className="flex flex-col py-0.5 pr-2">
              <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 leading-tight mb-1">{v.title}</h4>
              <span className="text-xs text-gray-600 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); onChannelClick(v.channelName, v.channelAvatar); }}>{v.channelName}</span>
              <span className="text-xs text-gray-600">{v.views} • {v.uploadedAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
