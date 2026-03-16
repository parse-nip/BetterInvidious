# Reverse Proxy & Cookie Troubleshooting

If you're running BetterInvidious behind a reverse proxy (e.g. invidious.popped.dev) and **Sign in/Sign up buttons don't change to your email** after logging in, the session cookie may not be working.

## Quick checks

1. **Use HTTPS** – Access the site via `https://invidious.popped.dev`, not `http://`. Cookies with `Secure` are only sent over HTTPS.

2. **Same origin** – The React app and API must be on the same origin. If the app is at `https://invidious.popped.dev`, API calls go to `https://invidious.popped.dev/api/...`. Don't set `VITE_API_BASE` unless you're intentionally using a different API origin.

3. **Proxy headers** – Ensure your proxy forwards:
   - `Host: invidious.popped.dev`
   - `X-Forwarded-Proto: https` (if using HTTPS)
   - `Set-Cookie` responses must not be stripped or modified

## Nginx example

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass_header Set-Cookie;
}
```

## Caddy example

```caddy
invidious.popped.dev {
    reverse_proxy localhost:3000
}
```

Caddy forwards headers by default.

## Cloudflare

- Disable "Rocket Loader" and similar optimizations if they break cookies.
- Ensure SSL/TLS mode is "Full" or "Full (strict)".

## Verify cookies in DevTools

1. Open DevTools → Application → Cookies → `https://invidious.popped.dev`
2. Log in
3. Check if an `SID` cookie appears
4. If it doesn't, the proxy or browser is blocking it

## If still broken

Try `https_only: false` in `docker-compose.pi.yml` (temporary) to see if `Secure` is the issue. If that fixes it, your proxy may be serving over HTTP or stripping secure flags.
