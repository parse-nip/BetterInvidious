# Database & Auth Setup for BetterInvidious

This guide covers setting up PostgreSQL, creating the database, and enabling user accounts (login, registration, recommended feed).

---

## Option A: Docker (Raspberry Pi / Recommended)

When using `docker-compose.pi.yml`, **everything is configured automatically**:

- **PostgreSQL** runs in a container; `invidious-db` creates the database and user
- **Tables** are created on first start via `init-invidious-db.sh` (runs SQL files)
- **Login & registration** are enabled in `INVIDIOUS_CONFIG`
- **check_tables: true** ensures any missing tables/columns are created

### Steps

1. Ensure `invidious/assets/react/` exists (run `.\scripts\build-react-ui.ps1` on your PC first)
2. Copy project to Pi
3. On Pi: `cd ~/BetterInvidious/invidious && docker compose -f docker-compose.pi.yml up -d --build`
4. Wait for first build (45–90 min on Pi 4)
5. Visit `http://<pi-ip>:3000` or your tunnel URL
6. Click **Sign in** → create account (email + password)

No manual database setup needed.

---

## Option B: Local / Non-Docker (Development)

### 1. Install PostgreSQL

**Windows (PowerShell):**
```powershell
# Install via Chocolatey or download from https://www.postgresql.org/download/windows/
choco install postgresql
```

**Linux / macOS:**
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql
```

### 2. Create Database and User

```bash
# Connect as postgres superuser
sudo -u postgres psql

-- In psql:
CREATE USER kemal WITH PASSWORD 'kemal';
CREATE DATABASE invidious OWNER kemal;
\q
```

Or use the same credentials as in `config/config.example.yml` (user: kemal, password: kemal, dbname: invidious).

### 3. Create config.yml

```bash
cd invidious
./scripts/setup-config.sh
```

Or manually:

```bash
cp config/config.example.yml config/config.yml
```

Then edit `config/config.yml` and set:

- `db.user`, `db.password`, `db.host`, `db.port`, `db.dbname` (or `database_url`)
- `check_tables: true`
- `login_enabled: true`
- `registration_enabled: true`
- `hmac_key: "<random-20-char-string>"` (generate with `openssl rand -hex 16`)

### 4. Run Migrations (if using Crystal directly)

```bash
cd invidious
./invidious --migrate
```

This creates/updates tables. If `check_tables: true`, Invidious will also fix missing tables on startup.

### 5. Start Invidious

```bash
./invidious
```

Or with Crystal:

```bash
crystal run src/invidious.cr
```

### 6. Create First Account

1. Open `http://localhost:3000`
2. Click **Sign in**
3. Enter email and password
4. If registration is enabled, a new account is created
5. If registration is disabled, you need an existing account

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Failed to connect to PostgreSQL" | Check `db` / `database_url` in config; ensure PostgreSQL is running |
| "hmac_key is required" | Set `hmac_key` in config (any non-empty string; use `openssl rand -hex 16` for production) |
| "Registration disabled" | Set `registration_enabled: true` in config |
| "Login disabled" | Set `login_enabled: true` in config |
| Tables missing | Set `check_tables: true` and restart; or run `./invidious --migrate` |
| Docker: "Connection refused" to companion | Ensure tinyproxy is running and listening on 0.0.0.0:3128 |

---

## Summary Checklist

- [ ] PostgreSQL installed and running
- [ ] Database `invidious` and user `kemal` created (or your config values)
- [ ] `config/config.yml` exists with `db` or `database_url`, `hmac_key`, `check_tables: true`, `login_enabled: true`, `registration_enabled: true`
- [ ] Migrations run (`./invidious --migrate`) if not using Docker
- [ ] Invidious starts without errors
- [ ] Can sign in and create account
