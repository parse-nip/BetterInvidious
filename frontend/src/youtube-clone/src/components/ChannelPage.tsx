import { useState } from 'react';
import { VideoGrid } from './VideoGrid';
import { videos } from '../data/mockData';

interface ChannelPageProps {
  channelName: string;
  channelAvatar: string;
  onChannelClick: (name: string, avatar: string) => void;
}

export function ChannelPage({ channelName, channelAvatar, onChannelClick }: ChannelPageProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  const tabs = ['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community'];

  // Generate some channel-specific videos
  const channelVideos = videos.map(v => ({
    ...v,
    channelName,
    channelAvatar
  })).slice(0, 8);

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* Banner */}
      <div className="w-full h-32 sm:h-48 md:h-56 lg:h-64 bg-gray-200">
        <img 
          src={`https://picsum.photos/seed/${channelName.replace(/\s+/g, '')}-banner/1200/300`} 
          alt={`${channelName} banner`}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Channel Info */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img 
            src={channelAvatar} 
            alt={channelName}
            className="w-20 h-20 sm:w-32 sm:h-32 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-2">{channelName}</h1>
            <div className="text-gray-600 text-sm mb-3 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">@{channelName.replace(/\s+/g, '').toLowerCase()}</span>
              <span>•</span>
              <span>{Math.floor(Math.random() * 900) + 100}K subscribers</span>
              <span>•</span>
              <span>{Math.floor(Math.random() * 500) + 50} videos</span>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl line-clamp-2 mb-4">
              Welcome to {channelName}! We post amazing videos every week. Subscribe to stay updated with our latest content.
            </p>
            <button 
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                isSubscribed 
                  ? 'bg-gray-100 text-black hover:bg-gray-200' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200 mt-4">
        <div className="flex gap-8 text-sm font-medium text-gray-600 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? 'border-black text-black' 
                  : 'border-transparent hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Videos */}
      <div className="max-w-[1280px] mx-auto pt-6 pb-12">
        <h2 className="px-4 sm:px-6 lg:px-8 text-lg font-bold mb-2">{activeTab === 'Home' ? 'For You' : activeTab}</h2>
        <VideoGrid videos={channelVideos} onChannelClick={onChannelClick} />
      </div>
    </div>
  );
}
