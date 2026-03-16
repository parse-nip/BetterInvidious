# Deploy BetterInvidious to invidious.popped.dev

This guide deploys BetterInvidious to Fly.io with the custom domain **invidious.popped.dev**.

## Prerequisites

1. **Fly CLI** – [Install](https://fly.io/docs/hands-on/install-flyctl/) and run `fly auth login`
2. **Docker Desktop** – Running (for local builds)
3. **Domain access** – You must control `popped.dev` to add the `invidious` subdomain

---

## Step 1: Build the React UI

From the project root:

```powershell
cd c:\Users\rootbeer\Downloads\BetterInvidious
.\scripts\build-react-ui.ps1
```

This builds the frontend and copies it into `invidious/assets/react/`.

---

## Step 2: Create Fly Postgres (first time only)

```powershell
fly postgres create --name betterinvidious-db
```

- Choose a region (e.g. `iad` for US East)
- Use database name `invidious` when prompted

---

## Step 3: Create the Fly apps (first time only)

```powershell
cd invidious

# Main app
fly apps create betterinvidious

# Companion (for video playback)
fly apps create betterinvidious-companion
```

---

## Step 4: Attach Postgres to the main app

```powershell
fly postgres attach betterinvidious-db -a betterinvidious
```

This sets the `DATABASE_URL` secret on `betterinvidious`.

---

## Step 5: Set Companion secret

Generate a 16-character key (use the same for both apps):

```powershell
# PowerShell - generate random hex
$key = -join ((1..8) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
Write-Host "Companion key: $key"
```

Then:

```powershell
fly secrets set SERVER_SECRET_KEY="$key" -a betterinvidious-companion
```

**Save this key** – you need it for the next step.

---

## Step 6: Set Invidious secrets

```powershell
# Same key as SERVER_SECRET_KEY
fly secrets set INVIDIOUS_INVIDIOUS_COMPANION_KEY="<YOUR_16_CHAR_KEY>" -a betterinvidious

# Generate HMAC key (20+ chars)
fly secrets set INVIDIOUS_HMAC_KEY="$(openssl rand -hex 12)" -a betterinvidious
```

If you don't have `openssl`, use any 24+ character random string for `INVIDIOUS_HMAC_KEY`.

---

## Step 7: Deploy the Companion first

```powershell
cd invidious
fly deploy -c companion/fly.toml -a betterinvidious-companion
```

Wait for it to finish. The companion must be running before the main app.

---

## Step 8: Deploy the main app

```powershell
fly deploy -a betterinvidious
```

First deploy takes **15–30 minutes** (Crystal compiles in Docker).

---

## Step 9: Add custom domain invidious.popped.dev

```powershell
fly certs add invidious.popped.dev -a betterinvidious
```

Then check the DNS instructions:

```powershell
fly certs show invidious.popped.dev -a betterinvidious
```

Add the CNAME record to your DNS for `popped.dev`:

| Type | Name   | Value                          |
|------|--------|--------------------------------|
| CNAME| invidious | betterinvidious.fly.dev     |

(Or use the exact hostname Fly shows – it may be `invidious.popped.dev` → `betterinvidious.fly.dev`.)

---

## Step 10: Verify

```powershell
fly certs check invidious.popped.dev -a betterinvidious
```

When the certificate is issued, open **https://invidious.popped.dev**.

---

## Updating

```powershell
# Rebuild React UI
.\scripts\build-react-ui.ps1

# Deploy
cd invidious
fly deploy -a betterinvidious
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Invidious companion is not available" | Ensure companion is deployed: `fly status -a betterinvidious-companion` |
| Database errors | Re-run `fly postgres attach betterinvidious-db -a betterinvidious` |
| Build fails | Ensure React UI was built: `.\scripts\build-react-ui.ps1` |
| Certificate pending | Check DNS: `fly certs check invidious.popped.dev -a betterinvidious` |
