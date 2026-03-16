import { Search, Mic, Video, Bell } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onHomeClick: () => void;
  onAccountClick: () => void;
}

export function Header({ isOpen, toggleSidebar, onHomeClick, onAccountClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 sticky top-0 bg-white z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full">
          <div className="flex flex-col justify-between w-[18px] h-[12px] transform transition-all duration-300 origin-center">
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 origin-left ${isOpen ? 'rotate-[42deg] w-[16px]' : ''}`}></div>
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 ${isOpen ? 'opacity-0 translate-x-4' : ''}`}></div>
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 origin-left ${isOpen ? '-rotate-[42deg] w-[16px]' : ''}`}></div>
          </div>
        </button>
        <div className="flex items-center gap-1 cursor-pointer" title="YouTube Home" onClick={onHomeClick}>
          <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
          </div>
          <span className="text-xl font-semibold tracking-tighter">YouTube</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-[720px] ml-10 mr-4">
        <div className="flex flex-1 items-center border border-gray-300 rounded-l-full px-4 py-0.5 bg-white shadow-inner focus-within:border-blue-500 ml-8">
          <Search className="w-5 h-5 text-gray-400 hidden md:block" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none px-2 py-1.5 text-base"
          />
        </div>
        <button type="submit" className="px-5 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100">
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button type="button" onClick={() => alert('Voice search activated')} className="p-2.5 ml-4 bg-gray-100 hover:bg-gray-200 rounded-full">
          <Mic className="w-5 h-5" />
        </button>
      </form>

      <div className="flex items-center gap-2">
        <button onClick={() => alert('Create video')} className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
          <Video className="w-6 h-6" />
        </button>
        <button onClick={() => alert('Notifications')} className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
          <Bell className="w-6 h-6" />
        </button>
        <button onClick={onAccountClick} className="p-1 ml-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center font-medium hover:opacity-90 transition-opacity">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
