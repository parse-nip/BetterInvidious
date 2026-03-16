import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { TrendingPage } from './pages/TrendingPage';
import { SearchPage } from './pages/SearchPage';
import { WatchPage } from './pages/WatchPage';
import { ChannelPage } from './pages/ChannelPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { HistoryPage } from './pages/HistoryPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="feed/popular" element={<HomePage />} />
          <Route path="feed/trending" element={<TrendingPage />} />
          <Route path="feed/subscriptions" element={<SubscriptionsPage />} />
          <Route path="feed/history" element={<HistoryPage />} />
          <Route path="feed/playlists" element={<PlaylistsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="watch" element={<WatchPage />} />
          <Route path="channel/:ucid" element={<ChannelPage />} />
          <Route path="playlist" element={<PlaylistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
