import { Link, useLocation } from 'react-router-dom';

const icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>,
  Shorts: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.77 10.32l-4.95 4.95L6.14 9.36a1.97 1.97 0 0 0-2.8 0l-.8.8a1.97 1.97 0 0 0 0 2.8l6.68 6.68 6.68-6.68a1.97 1.97 0 0 0 0-2.8l-.8-.8a1.97 1.97 0 0 0-2.8 0z"/></svg>,
  Subscriptions: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.54L16 16z" /></svg>,
  History: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" /></svg>,
  PlaySquare: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z" /></svg>,
  Clock: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ThumbsUp: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.97 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>,
  MonitorPlay: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4l-6-3.27v6.54L16 16z" /></svg>,
  Flame: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-4.42 0-8-3.13-8-7 0-2.38 1.19-4.47 3-5.74V6c0-1.66 1.34-3 3-3s3 1.34 3 3v.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V6c0-3.31-2.69-6-6-6S6 2.69 6 6v4.26C4.19 11.53 4 13.62 4 16c0 3.87 3.58 7 8 7s8-3.13 8-7c0-2.38-1.19-4.47-3-5.74V6c0-1.66 1.34-3 3-3s-3 1.34-3 3v4.26C6.81 11.53 6 13.62 6 16c0 3.87 3.58 7 8 7z" /></svg>,
  Music: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>,
  Gamepad2: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0 0 16.53 5H7.47C5.48 5 3.79 6.46 3.51 8.43l-1.09 7.66C2.2 17.63 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.12.75 1.8.75 1.55 0 2.74-1.37 2.4-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm2 3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /></svg>,
  Newspaper: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm5-4H7v-2h12v2zm0-4H7V7h12v2z" /></svg>,
  Trophy: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96 2.47-.31 4.39-2.39 4.39-4.94V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" /></svg>,
};

const mainLinks = [
  { icon: 'Home', label: 'Home', path: '/' },
  { icon: 'Shorts', label: 'Shorts', path: '/feed/trending' },
  { icon: 'Subscriptions', label: 'Subscriptions', path: '/feed/trending' },
];

const youLinks = [
  { icon: 'History', label: 'History', path: '/feed/trending' },
  { icon: 'PlaySquare', label: 'Your videos', path: '/feed/trending' },
  { icon: 'Clock', label: 'Watch later', path: '/feed/trending' },
  { icon: 'ThumbsUp', label: 'Liked videos', path: '/feed/trending' },
];

const exploreLinks = [
  { icon: 'Flame', label: 'Trending', path: '/feed/trending' },
  { icon: 'Music', label: 'Music', path: '/search?q=Music' },
  { icon: 'Gamepad2', label: 'Gaming', path: '/search?q=Gaming' },
  { icon: 'Newspaper', label: 'News', path: '/search?q=News' },
  { icon: 'Trophy', label: 'Sports', path: '/search?q=Sports' },
];

const STORAGE_KEY = 'yt-sidebar-open';

interface SidebarProps {
  isOpen: boolean;
  onOverlayClick?: () => void;
}

export function Sidebar({ isOpen, onOverlayClick }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  const LinkItem = ({ link, mini = false }: { link: typeof mainLinks[0]; mini?: boolean }) => {
    const Icon = icons[link.icon as keyof typeof icons];
    const active = isActive(link.path);
    const className = mini
      ? `flex flex-col items-center justify-center w-16 h-18 rounded-lg hover:bg-gray-100 py-4 no-underline text-inherit ${active ? 'bg-gray-100' : ''}`
      : `w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 no-underline text-inherit ${active ? 'bg-gray-100 font-medium' : ''}`;
    return (
      <Link to={link.path} className={className}>
        {mini ? (
          <>
            <span className="mb-1">{Icon && <Icon />}</span>
            <span className="text-[10px] truncate w-full text-center">{link.label}</span>
          </>
        ) : (
          <>
            <span className="mr-5">{Icon && <Icon />}</span>
            <span className="text-sm">{link.label}</span>
          </>
        )}
      </Link>
    );
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[199] ${isOpen ? 'hidden' : 'md:hidden'} sm:hidden`} onClick={onOverlayClick} aria-hidden="true" />
      <aside className={`relative transition-[width] duration-300 ease-in-out h-[calc(100vh-56px)] hidden sm:block flex-shrink-0 bg-white z-40 border-r border-gray-200 ${isOpen ? 'w-60' : 'w-[72px]'}`}>
        {/* Mini Sidebar */}
        <div className={`absolute inset-0 w-[72px] overflow-y-auto pb-4 flex flex-col items-center pt-1 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
          {mainLinks.map((link) => (
            <LinkItem key={link.label} link={link} mini />
          ))}
          <Link to="/feed/trending" className={`flex flex-col items-center justify-center w-16 h-18 rounded-lg hover:bg-gray-100 py-4 ${location.pathname.includes('feed') ? 'bg-gray-100' : ''}`}>
            <span className="mb-1">{icons.History()}</span>
            <span className="text-[10px] truncate w-full text-center">You</span>
          </Link>
        </div>

        {/* Full Sidebar */}
        <div className={`absolute inset-0 w-60 overflow-y-auto pb-4 transition-opacity duration-300 bg-white ${isOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="p-3 border-b border-gray-200">
            {mainLinks.map((link) => (
              <LinkItem key={link.label} link={link} />
            ))}
          </div>
          <div className="p-3 border-b border-gray-200">
            <Link to="/feed/trending" className="w-full px-3 py-2 text-base font-semibold flex items-center hover:bg-gray-100 rounded-lg">
              You <span className="ml-2 text-xl leading-none">›</span>
            </Link>
            {youLinks.map((link) => (
              <Link key={link.label} to={link.path} className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 no-underline text-inherit ${isActive(link.path) ? 'bg-gray-100 font-medium' : ''}`}>
                <span className="mr-5">{icons[link.icon as keyof typeof icons]()}</span>
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="p-3 border-b border-gray-200">
            <h3 className="px-3 py-2 text-base font-semibold">Explore</h3>
            {exploreLinks.map((link) => (
              <Link key={link.label} to={link.path} className={`w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100 no-underline text-inherit ${isActive(link.path) ? 'bg-gray-100 font-medium' : ''}`}>
                <span className="mr-5">{icons[link.icon as keyof typeof icons]()}</span>
                <span className="text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="p-5 text-xs text-gray-500 font-medium">
            <p className="mb-3">About Press Copyright Contact us Creators Advertise Developers</p>
            <p className="mb-3">Terms Privacy Policy &amp; Safety How YouTube works Test new features</p>
            <p className="text-gray-400 font-normal">© 2026 Google LLC</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export function getSidebarStorage(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function setSidebarStorage(open: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}
