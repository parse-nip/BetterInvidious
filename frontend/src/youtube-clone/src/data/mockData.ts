export const categories = [
  "All", "Gaming", "Music", "Live", "Mixes", "Podcasts", "News", "Sports", "Learning", "Fashion & Beauty", "Recently uploaded", "Watched", "New to you"
];

export const videos = Array.from({ length: 20 }).map((_, i) => ({
  id: i.toString(),
  thumbnail: `https://picsum.photos/seed/yt-thumb-${i}/640/360`,
  duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  title: `Amazing Video Title ${i + 1} - Must Watch!`,
  channelName: `Channel ${i + 1}`,
  channelAvatar: `https://picsum.photos/seed/yt-avatar-${i}/48/48`,
  views: `${Math.floor(Math.random() * 900) + 10}K views`,
  uploadedAt: `${Math.floor(Math.random() * 11) + 1} months ago`,
}));
