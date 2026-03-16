/**
 * Local watch history - stored in browser localStorage.
 * No server/login required.
 */

const STORAGE_KEY = 'betterinvidious-watch-history';
const MAX_ITEMS = 200;

export interface HistoryEntry {
  videoId: string;
  watchedAt: number;
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        e && typeof e.videoId === 'string' && typeof e.watchedAt === 'number'
    );
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ITEMS)));
  } catch {
    /* ignore */
  }
}

/** Add a video to watch history (most recent first) */
export function addToHistory(videoId: string) {
  const entries = loadHistory();
  const filtered = entries.filter((e) => e.videoId !== videoId);
  filtered.unshift({ videoId, watchedAt: Date.now() });
  saveHistory(filtered);
}

/** Get video IDs from history, most recent first */
export function getHistoryIds(): string[] {
  return loadHistory().map((e) => e.videoId);
}
