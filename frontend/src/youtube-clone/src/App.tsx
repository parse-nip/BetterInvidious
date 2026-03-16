/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CategoryBar } from './components/CategoryBar';
import { VideoGrid } from './components/VideoGrid';
import { ChannelPage } from './components/ChannelPage';
import { WatchPage } from './components/WatchPage';
import { AccountPage } from './components/AccountPage';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('Home');
  
  const [currentView, setCurrentView] = useState<'home' | 'channel' | 'watch' | 'account'>('home');
  const [selectedChannel, setSelectedChannel] = useState<{name: string, avatar: string} | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const handleChannelClick = (name: string, avatar: string) => {
    setSelectedChannel({ name, avatar });
    setCurrentView('channel');
    window.scrollTo(0, 0);
  };

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setCurrentView('watch');
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setActiveTab('Home');
    window.scrollTo(0, 0);
  };

  const handleAccountClick = () => {
    setCurrentView('account');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Header 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onHomeClick={handleHomeClick}
        onAccountClick={handleAccountClick}
      />
      <div className="flex flex-1 overflow-hidden">
        {currentView !== 'watch' && (
          <Sidebar isOpen={isSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-56px)] flex flex-col">
          {currentView === 'home' ? (
            <>
              <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
              <VideoGrid onChannelClick={handleChannelClick} onVideoClick={handleVideoClick} />
            </>
          ) : currentView === 'channel' && selectedChannel ? (
            <ChannelPage 
              channelName={selectedChannel.name} 
              channelAvatar={selectedChannel.avatar} 
              onChannelClick={handleChannelClick}
            />
          ) : currentView === 'watch' && selectedVideo ? (
            <WatchPage 
              video={selectedVideo}
              onChannelClick={handleChannelClick}
              onVideoClick={handleVideoClick}
            />
          ) : currentView === 'account' ? (
            <AccountPage 
              onVideoClick={handleVideoClick}
              onChannelClick={handleChannelClick}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
