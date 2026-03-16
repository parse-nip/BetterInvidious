import { History, PlaySquare, Clock, ThumbsUp } from 'lucide-react';
import { videos } from '../data/mockData';
import { VideoCard } from './VideoCard';

interface AccountPageProps {
  onVideoClick: (video: any) => void;
  onChannelClick: (name: string, avatar: string) => void;
}

export function AccountPage({ onVideoClick, onChannelClick }: AccountPageProps) {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-white min-h-full">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-purple-600 rounded-full text-white flex items-center justify-center text-4xl sm:text-5xl font-medium flex-shrink-0">
            U
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold mb-1">User Name</h1>
            <div className="text-gray-600 text-sm sm:text-base mb-3 flex items-center gap-2">
              <span className="font-medium text-gray-900">@username</span>
              <span>•</span>
              <span className="hover:text-gray-900 cursor-pointer">View channel</span>
            </div>
            <div className="flex gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full font-medium text-sm transition-colors">
                Switch account
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-black px-4 py-2 rounded-full font-medium text-sm transition-colors">
                Google Account
              </button>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="mb-10 border-b border-gray-200 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <History className="w-6 h-6" /> History
            </h2>
            <button className="text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {videos.slice(0, 5).map(v => (
              <div key={v.id} className="w-[280px] flex-shrink-0">
                <VideoCard video={v} onVideoClick={onVideoClick} onChannelClick={onChannelClick} />
              </div>
            ))}
          </div>
        </div>

        {/* Watch Later Section */}
        <div className="mb-10 border-b border-gray-200 pb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" /> Watch Later
            </h2>
            <button className="text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {videos.slice(5, 10).map(v => (
              <div key={v.id} className="w-[280px] flex-shrink-0">
                <VideoCard video={v} onVideoClick={onVideoClick} onChannelClick={onChannelClick} />
              </div>
            ))}
          </div>
        </div>
        
        {/* Liked Videos Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ThumbsUp className="w-6 h-6" /> Liked videos
            </h2>
            <button className="text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
              See all
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {videos.slice(2, 7).map(v => (
              <div key={v.id} className="w-[280px] flex-shrink-0">
                <VideoCard video={v} onVideoClick={onVideoClick} onChannelClick={onChannelClick} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
