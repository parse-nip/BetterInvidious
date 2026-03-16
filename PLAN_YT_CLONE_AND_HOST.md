# Plan: YouTube 1:1 Clone UI + Host on popped.dev

A practical plan to make BetterInvidious look like YouTube while keeping all Invidious benefits, then host it at **popped.dev**.

---

## Part 1: What You Have Today

- **Stack**: Invidious (Crystal backend, ECR templates, Pure.css, Ion Icons, Video.js).
- **Assets**: `invidious/assets/css/` (default.css, pure-min, carousel, player, search, etc.).
- **Key views**: `template.ecr` (global layout), `watch.ecr`, `search_homepage.ecr`, `feeds/popular.ecr`, `components/item.ecr`, `feed_menu.ecr`.
- **Branding**: "Invidious" in navbar, titles, footer, opensearch.
- **Config**: `config/config.example.yml` → copy to `config/config.yml`; `domain` and `https_only` control public URL.

---

## Part 2: YouTube Look & Feel (1:1 Clone)

Goal: Same layout, hierarchy, and visual language as YouTube. No change to backend or Invidious features (privacy, no tracking, quality selector, etc.).

### 2.1 Global layout (template + new CSS)

- **Top bar (header)**
  - Left: Hamburger (toggle sidebar), then **logo** (e.g. “popped” or YT-style logo linking to `/`).
  - Center: Search (full-width on desktop, expandable or full-width on mobile).
  - Right: Create/camera, notifications, avatar (or “Sign in”); keep theme toggle and preferences in a menu if you want.
- **Left sidebar** (collapsible, over/under content on small screens)
  - Home, Shorts (link to `/feed/shorts` if you add it or map to Trending), Subscriptions, Library, History, Watch later, etc. Map to existing Invidious feeds and playlists.
- **Main content**
  - Single column that expands; sidebar width fixed (e.g. 72px collapsed, ~240px expanded) like YT.
- **Footer**
  - Optional: minimal footer or YT-style links; keep “Invidious” / AGPL in a small “About” or “Legal” section for compliance.

**Files to touch**: `src/invidious/views/template.ecr`, new `assets/css/youtube-layout.css` (or replace `default.css` incrementally).

### 2.2 Theming (light/dark)

- **YouTube light**: White/grey background, black text, red accent (e.g. logo/primary actions).
- **YouTube dark**: Dark grey background (#212121, #181818), light text, same red accent.
- Use CSS variables (e.g. `--yt-bg`, `--yt-text`, `--yt-accent`) and a body class (e.g. `dark-theme` / `light-theme`) so one stylesheet works for both.
- **Files**: `default.css` and/or new `youtube-theme.css`, `themes.js` if you keep JS theme toggle.

### 2.3 Typography & base styles

- **Font**: Roboto (YouTube’s font). Add Google Fonts link in `template.ecr` and set `font-family` on `html`/`body`.
- **Base**: Remove or override Pure.css where it conflicts (e.g. navbar, grids). Keep Pure grid for feed grids only if it helps; otherwise use CSS Grid/Flexbox for YT-like behavior.

### 2.4 Homepage (feed)

- **Layout**: Grid of video cards (e.g. 4–5 columns on desktop, responsive).
- **Card**: Thumbnail (16:9), duration badge, avatar (small), title (2 lines max), channel name, view count + time (e.g. “123K views · 2 days ago”).
- **Source**: Reuse `components/item.ecr` and feed data; restyle in CSS to match YT cards (no structural change needed if markup is similar).
- **Files**: `feeds/popular.ecr`, `components/item.ecr`, `assets/css/default.css` or new `youtube-cards.css`.

### 2.5 Watch page

- **Layout**: Two columns on desktop — main (player + metadata + description + comments) and right sidebar (recommended/related).
- **Player**: Keep Video.js; optionally style controls to look more YT-like (progress bar, big play button, etc.) via `player.css` and Video.js skin.
- **Under player**: Title, view count, action buttons (Like, Dislike, Share, Save), then channel row (avatar, name, subscribe), then description with “Show more”.
- **Right column**: Related videos (reuse existing related list); card layout same as homepage (thumbnail, title, channel, views).
- **Files**: `watch.ecr`, `components/player.ecr`, `components/player_sources.ecr`, `assets/css/player.css`, `default.css`.

### 2.6 Search

- **Search results**: Top bar with search input (pre-filled); below, horizontal filter chips (Upload date, Type, Duration, etc.) if Invidious API supports them; then list or grid of results (video cards, channel strips, playlists).
- **Files**: `search.ecr`, `search_homepage.ecr`, `assets/css/search.css`.

### 2.7 Channel page

- **Banner** at top, **avatar + name + subscribe + bell**, then **tabs** (Videos, Playlists, etc.), then **grid of videos**.
- **Files**: `channel.ecr`, `views/components/channel_info.ecr`, CSS.

### 2.8 Branding

- Replace “Invidious” in:
  - `template.ecr`: navbar logo/text, page titles, opensearch title.
  - `search_homepage.ecr`: logo text.
  - Feed titles and any other visible “Invidious” strings (keep in footer/license if desired).
- Use “popped” or “popped.dev” (and favicon) so the clone is clearly yours while still looking like YT.

### 2.9 Icons

- You prefer not to use Lucide; use a YT-like set (e.g. Material Icons, or a custom SVG set that mimics YT’s) loaded in `template.ecr` and used in nav, buttons, and cards.

---

## Part 3: Preserve Invidious Benefits

- **Do not remove**: Proxy streaming, no Google login, quality/format selector, DASH/HLS, watch history (local), subscriptions (local), playlists, captions, embeds, API.
- **Optional**: Add a small “Powered by Invidious” or “Privacy-friendly YouTube front-end” in footer/settings for attribution; keep AGPL compliance (disclose source, same license).

---

## Part 4: Hosting on popped.dev

### 4.1 Config

- Copy `config/config.example.yml` to `config/config.yml`.
- Set:
  - `domain: popped.dev` (or subdomain, see below).
  - `https_only: true` (if you terminate TLS at a reverse proxy).
  - Database: `database_url` for PostgreSQL (required).
  - Other options: `external_port`, `login_enabled`, `registration_enabled`, etc., as needed.

### 4.2 Subdomain vs path

- **Option A – Subdomain**: e.g. `watch.popped.dev` or `v.popped.dev`. Easiest: point DNS to the server, reverse proxy to Invidious. Set `domain: watch.popped.dev` (or chosen subdomain).
- **Option B – Path on main site**: e.g. `popped.dev/watch`. Requires reverse proxy path-based routing (e.g. `/watch`, `/feed`, `/api` → Invidious). Invidious may need to know it’s served under a path (check `domain` and any `base_path`-style config if it exists).

### 4.3 Server & reverse proxy

- **Run Invidious**: Docker (use `invidious/docker/Dockerfile`) or build Crystal and run the binary. Ensure PostgreSQL is running and migrations applied.
- **Reverse proxy**: Nginx or Caddy in front of Invidious:
  - Proxy `Host` and `X-Forwarded-*` headers so `domain` and `https_only` work.
  - TLS: Caddy (auto Let’s Encrypt) or Nginx + certbot for `popped.dev` or chosen subdomain.

### 4.4 DNS

- A (and optionally AAAA) for `popped.dev` (or `watch.popped.dev`) pointing to your server IP.

### 4.5 Summary checklist

- [ ] PostgreSQL installed and `config.yml` `database_url` set.
- [ ] `config.yml`: `domain` = chosen host (e.g. `watch.popped.dev` or `popped.dev`), `https_only: true`.
- [ ] Invidious built/run (Docker or Crystal).
- [ ] Reverse proxy + TLS for that domain.
- [ ] DNS pointing to server.
- [ ] Test: open `https://<your-domain>/`, search, watch, subscribe (if enabled).

---

## Suggested order of work

1. **Config & branding**
   - Create `config/config.yml` from example, set `domain` and `https_only`.
   - Replace “Invidious” with “popped”/“popped.dev” in navbar, search home, and titles; keep footer/AGPL.

2. **Layout & theme**
   - Implement YT-style header + sidebar in `template.ecr` and new CSS (variables for light/dark).
   - Add Roboto and base YT colors.

3. **Homepage & cards**
   - Restyle feed and `item.ecr` to YT-like grid and card design.

4. **Watch page**
   - Two-column layout, player styling, metadata and related sidebar.

5. **Search & channel**
   - Search results and filter chips; channel banner, tabs, grid.

6. **Deploy**
   - Set up PostgreSQL, run Invidious, configure reverse proxy and DNS for popped.dev (or subdomain).

---

## File reference (quick map)

| Area              | Main files |
|-------------------|------------|
| Global layout     | `src/invidious/views/template.ecr` |
| CSS               | `assets/css/default.css`, new `youtube-layout.css` / `youtube-theme.css` |
| Homepage          | `views/feeds/popular.ecr`, `views/components/feed_menu.ecr`, `components/item.ecr` |
| Watch             | `views/watch.ecr`, `views/components/player.ecr`, `views/components/player_sources.ecr`, `assets/css/player.css` |
| Search            | `views/search.ecr`, `views/search_homepage.ecr`, `assets/css/search.css` |
| Channel           | `views/channel.ecr`, `views/components/channel_info.ecr` |
| Config            | `config/config.yml` (from `config.example.yml`) |

If you tell me whether you prefer starting with **UI clone** or **hosting** first, I can break the next steps into concrete tasks (e.g. first PR: template + header + sidebar + CSS variables).
