import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

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

interface HeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isOpen, toggleSidebar }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<{ email: string; csrf_token: string } | null | undefined>(undefined);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const handleSignOut = async () => {
    if (!user?.csrf_token) return;
    await api.signout(user.csrf_token);
    setUser(null);
    setUserMenuOpen(false);
    window.location.reload();
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 h-14 sticky top-0 bg-white z-50 border-b border-gray-200">
      <div className="flex items-center gap-4 shrink-0">
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

      <form onSubmit={handleSearch} className="absolute left-1/2 -translate-x-1/2 flex items-center w-full max-w-[640px] px-4">
        <div className="flex flex-1 items-center border border-gray-300 rounded-l-full px-4 py-0.5 bg-white shadow-inner focus-within:border-blue-500">
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

      <div className="w-[220px] shrink-0 flex items-center justify-end gap-2">
        {user === undefined ? (
          <div className="w-20 h-9 rounded-full bg-gray-100 animate-pulse" />
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white max-w-[160px] truncate"
              title={user.email}
            >
              {user.email}
              <span className="text-xs opacity-80">▼</span>
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[140px]">
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-2 rounded-full font-medium text-sm text-gray-700 hover:bg-gray-100 no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white no-underline"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
