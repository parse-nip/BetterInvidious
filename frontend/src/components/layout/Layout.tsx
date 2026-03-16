import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar, getSidebarStorage, setSidebarStorage } from './Sidebar';

function isDesktop() {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches;
}

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return isDesktop() ? getSidebarStorage() : false;
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      if (isDesktop()) setSidebarStorage(next);
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    if (!isDesktop()) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('yt-layout');
    document.body.classList.add('yt-layout');
    return () => {
      document.documentElement.classList.remove('yt-layout');
      document.body.classList.remove('yt-layout');
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Header isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onOverlayClick={closeSidebar} />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden h-[calc(100vh-56px)] flex flex-col items-start">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
