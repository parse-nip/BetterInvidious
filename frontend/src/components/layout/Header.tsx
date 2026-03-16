import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SvgSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const SvgMic = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const SvgVideo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </svg>
);

const SvgBell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

interface HeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isOpen, toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full">
          <div className="flex flex-col justify-between w-[18px] h-[12px] transform transition-all duration-300 origin-center">
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 origin-left ${isOpen ? 'rotate-[42deg] w-[16px]' : ''}`}></div>
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 ${isOpen ? 'opacity-0 translate-x-4' : ''}`}></div>
            <div className={`bg-black h-[1.5px] w-full transform transition-all duration-300 origin-left ${isOpen ? '-rotate-[42deg] w-[16px]' : ''}`}></div>
          </div>
        </button>
        <Link to="/" className="flex items-center gap-2 cursor-pointer" title="Invidious Home">
          <div className="w-8 h-6 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tighter leading-tight">Invidious</span>
            <span className="text-[9px] text-gray-500 leading-tight -mt-0.5">by popped.dev</span>
          </div>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-[720px] ml-10 mr-4">
        <div className="flex flex-1 items-center border border-gray-300 rounded-l-full px-4 py-0.5 bg-white shadow-inner focus-within:border-blue-500 ml-8">
          <span className="text-gray-400 hidden md:block mr-2"><SvgSearch /></span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none px-2 py-1.5 text-base"
          />
        </div>
        <button type="submit" className="px-5 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100">
          <SvgSearch />
        </button>
        <button type="button" className="p-2.5 ml-4 bg-gray-100 hover:bg-gray-200 rounded-full hidden md:block">
          <SvgMic />
        </button>
      </form>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
          <SvgVideo />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
          <SvgBell />
        </button>
        <div className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center font-medium hover:opacity-90 transition-opacity ml-2">
          U
        </div>
      </div>
    </header>
  );
}
