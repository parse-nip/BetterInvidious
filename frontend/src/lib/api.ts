/**
 * Invidious API client - fetches from /api/v1/ with credentials for cookies
 */

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface VideoThumbnail {
  quality: string;
  url: string;
  width: number;
  height: number;
}

export interface AuthorThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface FormatStream {
  url: string;
  itag: string;
  type: string;
  quality?: string;
  qualityLabel?: string;
  size?: string;
  resolution?: string;
  height?: number;
  width?: number;
}

export interface Caption {
  label: string;
  language_code: string;
  url: string;
}

export interface Video {
  type?: string;
  title: string;
  videoId: string;
  videoThumbnails?: VideoThumbnail[];
  author: string;
  authorId: string;
  authorUrl?: string;
  authorThumbnails?: AuthorThumbnail[];
  authorVerified?: boolean;
  viewCount?: number;
  viewCountText?: string;
  lengthSeconds?: number;
  published?: number;
  publishedText?: string;
  description?: string;
  formatStreams?: FormatStream[];
  adaptiveFormats?: FormatStream[];
  hlsUrl?: string;
  dashUrl?: string;
  captions?: Caption[];
  recommendedVideos?: Video[];
  liveNow?: boolean;
  subCountText?: string;
}

export interface Channel {
  author: string;
  authorId: string;
  authorUrl?: string;
  authorThumbnails?: AuthorThumbnail[];
  authorBanners?: { url: string; width: number; height: number }[];
  subCount?: number;
  totalViews?: number;
  description?: string;
  latestVideos?: Video[];
  relatedChannels?: { author: string; authorId: string; authorThumbnails?: AuthorThumbnail[] }[];
}

export interface PlaylistVideo extends Video {
  index?: number;
}

export interface Playlist {
  title: string;
  playlistId: string;
  videos: PlaylistVideo[];
  videoCount?: number;
  author?: string;
  authorId?: string;
}

export interface SearchResult {
  type: 'video' | 'channel' | 'playlist';
  title?: string;
  videoId?: string;
  author?: string;
  authorId?: string;
  authorThumbnails?: AuthorThumbnail[];
  videoThumbnails?: VideoThumbnail[];
  playlistThumbnail?: string;
  viewCount?: number;
  viewCountText?: string;
  lengthSeconds?: number;
  publishedText?: string;
  videoCount?: number;
  description?: string;
  playlistId?: string;
  [key: string]: unknown;
}

export interface AuthPreferences {
  dark_mode?: string;
  locale?: string;
  [key: string]: unknown;
}

export interface CommentAuthorThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Comment {
  commentId: string;
  author: string;
  authorId: string;
  authorUrl?: string;
  authorThumbnails?: CommentAuthorThumbnail[];
  contentHtml: string;
  published?: number;
  publishedText?: string;
  likeCount?: number;
  verified?: boolean;
  replies?: { replyCount: number; continuation: string };
}

export interface CommentsJsonResponse {
  commentCount?: number;
  videoId?: string;
  comments: Comment[];
  continuation?: string;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getPopular: () => fetchApi<Video[]>('/api/v1/popular'),
  getTrending: (region?: string, type?: string) => {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    const q = params.toString();
    return fetchApi<Video[]>(`/api/v1/trending${q ? `?${q}` : ''}`);
  },
  getVideo: (id: string, local = false) =>
    fetchApi<Video>(`/api/v1/videos/${id}${local ? '?local=true' : ''}`),
  getComments: (videoId: string, options?: { format?: 'html' | 'json'; continuation?: string; sortBy?: string }) => {
    const params = new URLSearchParams();
    params.set('format', options?.format ?? 'html');
    if (options?.continuation) params.set('continuation', options.continuation);
    if (options?.sortBy) params.set('sort_by', options.sortBy);
    return fetchApi<{ contentHtml: string; commentCount?: number; continuation?: string }>(
      `/api/v1/comments/${videoId}?${params}`
    );
  },
  getCommentsJson: (videoId: string, options?: { continuation?: string; sortBy?: string }) => {
    const params = new URLSearchParams({ format: 'json' });
    if (options?.continuation) params.set('continuation', options.continuation);
    if (options?.sortBy) params.set('sort_by', options.sortBy);
    return fetchApi<CommentsJsonResponse>(`/api/v1/comments/${videoId}?${params}`);
  },
  search: (q: string, options?: { type?: string; region?: string }) => {
    const params = new URLSearchParams({ q });
    if (options?.type) params.set('type', options.type);
    if (options?.region) params.set('region', options.region);
    return fetchApi<SearchResult[]>(`/api/v1/search?${params}`);
  },
  getChannel: (ucid: string, sortBy = 'newest') =>
    fetchApi<Channel>(`/api/v1/channels/${ucid}?sort_by=${sortBy}`),
  getChannelPlaylists: (ucid: string, sortBy = 'last', continuation?: string) => {
    const params = new URLSearchParams({ sort_by: sortBy });
    if (continuation) params.set('continuation', continuation);
    return fetchApi<{
      playlists: { title: string; playlistId: string; videoCount?: number; author?: string; playlistThumbnail?: string }[];
      continuation?: string;
    }>(`/api/v1/channels/${ucid}/playlists?${params}`);
  },
  getChannelVideos: (ucid: string, sortBy = 'newest', continuation?: string) => {
    const params = new URLSearchParams({ sort_by: sortBy });
    if (continuation) params.set('continuation', continuation);
    return fetchApi<{ videos: Video[]; continuation?: string }>(
      `/api/v1/channels/${ucid}/videos?${params}`
    );
  },
  getPlaylist: (plid: string, continuation?: string) => {
    const params = continuation ? `?continuation=${continuation}` : '';
    return fetchApi<Playlist>(`/api/v1/playlists/${plid}${params}`);
  },
  getAuthPreferences: () => fetchApi<AuthPreferences>('/api/v1/auth/preferences'),
  setPreferences: (prefs: Partial<AuthPreferences>) =>
    fetch(API_BASE + '/api/v1/auth/preferences', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    }),
  getSubscriptions: () => fetchApi<{ author: string; authorId: string }[]>('/api/v1/auth/subscriptions'),
  getFeed: (page = 1, maxResults?: number) => {
    const params = new URLSearchParams({ page: String(page) });
    if (maxResults) params.set('max_results', String(maxResults));
    return fetchApi<{ videos: Video[]; notifications: Video[] }>(`/api/v1/auth/feed?${params}`);
  },
  getHistory: (page = 1) =>
    fetchApi<string[]>(`/api/v1/auth/history?page=${page}`),
  getPlaylists: () =>
    fetchApi<Playlist[]>(`/api/v1/auth/playlists`),
  markWatched: (id: string) =>
    fetch(API_BASE + `/api/v1/auth/history/${id}`, {
      method: 'POST',
      credentials: 'include',
    }),
  subscribeChannel: (ucid: string) =>
    fetch(API_BASE + `/api/v1/auth/subscriptions/${ucid}`, {
      method: 'POST',
      credentials: 'include',
    }),
  unsubscribeChannel: (ucid: string) =>
    fetch(API_BASE + `/api/v1/auth/subscriptions/${ucid}`, {
      method: 'DELETE',
      credentials: 'include',
    }),
};

/** Get best thumbnail URL for a video (prefer maxresdefault or hqdefault). Always returns relative path so thumbnails load from same origin. */
export function getThumbnailUrl(video: { videoId: string; videoThumbnails?: VideoThumbnail[] }): string {
  if (video.videoThumbnails?.length) {
    const maxres = video.videoThumbnails.find((t) => t.quality === 'maxresdefault' || t.quality === 'maxres');
    const hq = video.videoThumbnails.find((t) => t.quality === 'hqdefault' || t.quality === 'high');
    const mq = video.videoThumbnails.find((t) => t.quality === 'mqdefault' || t.quality === 'medium');
    const chosen = maxres ?? hq ?? mq ?? video.videoThumbnails[0];
    if (chosen?.url) {
      try {
        const path = new URL(chosen.url).pathname;
        if (path.startsWith('/vi/')) return path;
      } catch {
        /* fall through */
      }
    }
  }
  return `/vi/${video.videoId}/mqdefault.jpg`;
}

/** Get author avatar URL - use proxy path for ggpht URLs */
export function getAuthorThumbnail(item: { authorThumbnails?: AuthorThumbnail[] }): string {
  if (item.authorThumbnails?.length) {
    const thumb = item.authorThumbnails.find((t) => t.width >= 48) ?? item.authorThumbnails[item.authorThumbnails.length - 1];
    let url = thumb.url;
    if (url.startsWith('http') && url.includes('ggpht.com')) {
      try {
        const parsed = new URL(url);
        url = '/ggpht' + parsed.pathname + parsed.search;
      } catch {
        /* use as-is */
      }
    }
    return url;
  }
  return '';
}

/** Format duration from seconds to HH:MM:SS or MM:SS */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format view count (e.g. 1.2M) */
export function formatViews(count: number): string {
  if (count >= 1e9) return (count / 1e9).toFixed(1) + 'B';
  if (count >= 1e6) return (count / 1e6).toFixed(1) + 'M';
  if (count >= 1e3) return (count / 1e3).toFixed(1) + 'K';
  return String(count);
}

/** Get display text for views - use viewCountText when viewCount is 0/missing (e.g. rate-limited responses). Hides "0 views" from rate-limited data. */
export function getViewCountDisplay(video: { viewCount?: number; viewCountText?: string }): string {
  if (video.viewCount != null && video.viewCount > 0) return formatViews(video.viewCount) + ' views';
  if (video.viewCountText && !/^0(\s*views?)?$/i.test(video.viewCountText.trim())) return video.viewCountText;
  return '';
}

/** Get published text - hides "0 seconds ago" from rate-limited/partial responses */
export function getPublishedDisplay(publishedText?: string): string {
  if (!publishedText) return '';
  if (/^0\s*(second|minute|hour)s?\s*ago$/i.test(publishedText.trim())) return '';
  return publishedText;
}

