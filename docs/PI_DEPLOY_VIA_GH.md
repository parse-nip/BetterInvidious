# Deploy to Pi via GitHub

Build on your PC (fast), push image to GitHub Container Registry, pull on Pi. No 40-min build on the Pi.

---

## One-time setup

### 1. GitHub Container Registry auth (PC)

Create a Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Scope: `write:packages` (and `read:packages` if you want)
4. Copy the token

Login to ghcr.io:

```powershell
docker login ghcr.io -u parse-nip -p YOUR_TOKEN
```

### 2. Make the package public (optional)

If the image is private, the Pi needs to authenticate to pull. To make it public:

1. GitHub → Your profile → Packages
2. Find `betterinvidious-invidious`
3. Package settings → Change visibility → Public

Then the Pi can pull without logging in.

---

## Workflow

### On your PC

```powershell
cd C:\Users\rootbeer\Downloads\BetterInvidious

# 1. Build React UI (if not done)
.\scripts\build-react-ui.ps1

# 2. Build ARM64 image and push to ghcr.io (5-15 min)
.\scripts\build-for-pi.ps1

# 3. Push code to GitHub
git add -A
git commit -m "Update"
git push
```

### On the Pi

```bash
cd ~/BetterInvidious
git pull

cd invidious
docker compose -f docker-compose.pi-prebuilt.yml pull
docker compose -f docker-compose.pi-prebuilt.yml up -d
```

---

## Quick reference

| Step | PC | Pi |
|------|----|-----|
| Build image | `.\scripts\build-for-pi.ps1` | — |
| Push code | `git push` | — |
| Get code | — | `git pull` |
| Pull image | — | `docker compose -f docker-compose.pi-prebuilt.yml pull` |
| Start | — | `docker compose -f docker-compose.pi-prebuilt.yml up -d` |

---

## If package is private

On the Pi, login once before pulling:

```bash
echo YOUR_GITHUB_PAT | docker login ghcr.io -u parse-nip --password-stdin
```

Use the same PAT with `read:packages` scope.
