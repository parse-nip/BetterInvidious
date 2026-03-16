import { Home, Compass, PlaySquare, Clock, ThumbsUp, History, MonitorPlay, Flame, Music, Gamepad2, Newspaper, Trophy } from 'lucide-react';

const mainLinks = [
  { icon: Home, label: 'Home' },
  { icon: Compass, label: 'Shorts' },
  { icon: MonitorPlay, label: 'Subscriptions' },
];

const youLinks = [
  { icon: History, label: 'History' },
  { icon: PlaySquare, label: 'Your videos' },
  { icon: Clock, label: 'Watch later' },
  { icon: ThumbsUp, label: 'Liked videos' },
];

const exploreLinks = [
  { icon: Flame, label: 'Trending' },
  { icon: Music, label: 'Music' },
  { icon: Gamepad2, label: 'Gaming' },
  { icon: Newspaper, label: 'News' },
  { icon: Trophy, label: 'Sports' },
];

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ isOpen, activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside 
      className={`relative transition-[width] duration-300 ease-in-out h-[calc(100vh-56px)] hidden sm:block flex-shrink-0 bg-white z-40 ${
        isOpen ? 'w-60' : 'w-[72px]'
      }`}
    >
      {/* Mini Sidebar */}
      <div className={`absolute inset-0 w-[72px] overflow-y-auto pb-4 flex flex-col items-center pt-1 transition-opacity duration-300 scrollbar-hide ${
        isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'
      }`}>
        {mainLinks.map((link) => (
          <button 
            key={link.label} 
            onClick={() => setActiveTab(link.label)}
            className={`flex flex-col items-center justify-center w-16 h-18 rounded-lg hover:bg-gray-100 py-4 ${activeTab === link.label ? 'bg-gray-100' : ''}`}
          >
            <link.icon className={`w-6 h-6 mb-1 ${activeTab === link.label ? 'fill-current' : ''}`} />
            <span className="text-[10px] truncate w-full text-center">{link.label}</span>
          </button>
        ))}
        <button 
          onClick={() => setActiveTab('You')}
          className={`flex flex-col items-center justify-center w-16 h-18 rounded-lg hover:bg-gray-100 py-4 ${activeTab === 'You' ? 'bg-gray-100' : ''}`}
        >
          <History className={`w-6 h-6 mb-1 ${activeTab === 'You' ? 'fill-current' : ''}`} />
          <span className="text-[10px] truncate w-full text-center">You</span>
        </button>
      </div>

      {/* Full Sidebar */}
      <div className={`absolute inset-0 w-60 overflow-y-auto pb-4 hover:scrollbar-thin scrollbar-thumb-gray-300 transition-opacity duration-300 bg-white ${
        isOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-3 border-b border-gray-200">
          {mainLinks.map((link) => (
            <button 
              key={link.label} 
              onClick={() => setActiveTab(link.label)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 ${activeTab === link.label ? 'bg-gray-100 font-medium' : ''}`}
            >
              <link.icon className={`w-6 h-6 mr-5 ${activeTab === link.label ? 'fill-current' : ''}`} />
              <span className="text-sm">{link.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <button onClick={() => setActiveTab('You')} className="w-full px-3 py-2 text-base font-semibold flex items-center hover:bg-gray-100 rounded-lg">
            You <span className="ml-2 text-xl leading-none">›</span>
          </button>
          {youLinks.map((link) => (
            <button 
              key={link.label} 
              onClick={() => setActiveTab(link.label)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 ${activeTab === link.label ? 'bg-gray-100 font-medium' : ''}`}
            >
              <link.icon className={`w-6 h-6 mr-5 ${activeTab === link.label ? 'fill-current' : ''}`} />
              <span className="text-sm">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-b border-gray-200">
          <h3 className="px-3 py-2 text-base font-semibold">Explore</h3>
          {exploreLinks.map((link) => (
            <button 
              key={link.label} 
              onClick={() => setActiveTab(link.label)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 ${activeTab === link.label ? 'bg-gray-100 font-medium' : ''}`}
            >
              <link.icon className={`w-6 h-6 mr-5 ${activeTab === link.label ? 'fill-current' : ''}`} />
              <span className="text-sm">{link.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-5 text-xs text-gray-500 font-medium">
          <p className="mb-3">About Press Copyright Contact us Creators Advertise Developers</p>
          <p className="mb-3">Terms Privacy Policy &amp; Safety How YouTube works Test new features</p>
          <p className="text-gray-400 font-normal">© 2026 Google LLC</p>
        </div>
      </div>
    </aside>
  );
}
