# Configuration

This document describes how to configure the application via environment variables.

## Setting up .env files

Generate `.env` skeletons for the frontend and backend:

**Windows:** `.\app.ps1 env`  
**Linux/macOS:** `./app.ps1 env`

Or run `scripts/powershell/env.ps1` / `scripts/shell/env.sh` from the repo root.

The script creates:

- `frontend/.env` — Vite/React
- `backend/.env` — .NET API

---

## Frontend environment variables

The frontend is built with Vite. All variables exposed to the client **must** be prefixed with `VITE_`.

### Server

| Variable | Description |
|----------|-------------|
| `VITE_FRONTEND_URL` | Public URL of the frontend (e.g. `http://localhost:3040`) |
| `VITE_BACKEND_URL` | Backend API base URL (e.g. `http://localhost:8040`) |

### OAuth

| Variable | Description |
|----------|-------------|
| `VITE_MSAL_CLIENT_ID` | Microsoft Entra (Azure AD) client ID |
| `VITE_MSAL_AUTHORITY` | MSAL authority (e.g. `https://login.microsoftonline.com/common`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Other

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_RECAPTCHA` | reCAPTCHA site key (if used) |

---

## Backend environment variables

The backend is a .NET 9 web API. It loads `.env` from the backend directory (or inherits from the current directory).

### Configuration

| Variable | Description |
|----------|-------------|
| `ENVIRONMENT` | `development`, `test`, or `production`. Default: `development` |
| `LOG_LEVEL` | Logging level (e.g. `info`, `debug`, `warn`) |

### Database and infrastructure

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string. Example: `Server=localhost;Port=3306;Database=appdb;User=root;Password=yourpassword` (or use a URL-style string that your app parses) |
| `REDIS_URL` | Redis connection (e.g. `localhost:6379` or `redis://127.0.0.1:6379`) |
| `RABBITMQ_URL` | RabbitMQ connection (e.g. `amqp://guest:guest@localhost:5672`) |

### Authentication

| Variable | Description |
|----------|-------------|
| `JWT_SECRET_ACCESS` | Secret key used to sign and validate JWT access tokens. Must be long and secure. Refresh and verification tokens are stored in Redis, not as separate JWTs. |

### CORS

| Variable | Description |
|----------|-------------|
| `CORS_WHITELIST` | JSON array of allowed origins (e.g. `["http://localhost:3040","http://localhost:5173"]`) |

### OAuth

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (backend validation) |
| `MS_CLIENT_ID` | Microsoft Entra client ID |
| `MS_TENANT_ID` | Microsoft Entra tenant ID (optional) |

Register apps at [Google Cloud Console](https://console.cloud.google.com/) and [Azure Entra ID](https://www.microsoft.com/en-ca/security/business/identity-access/microsoft-entra-id).

### Email (SMTP)

| Variable | Description |
|----------|-------------|
| `EMAIL_USER` | SMTP username / sender address |
| `EMAIL_PASSWORD` or `EMAIL_PASS` | SMTP password or app password |
| `SMTP_SERVER` | SMTP host (optional, depending on implementation) |

Set these to enable email verification and password reset flows.

### Optional (e.g. PayPal)

| Variable | Description |
|----------|-------------|
| `PAYPAL_CLIENT_ID` | PayPal client ID (if using payments) |
| `PAYPAL_SECRET_ID` | PayPal secret |
| `PAYPAL_API` | PayPal API base URL (e.g. sandbox) |

---

## Summary

- **Frontend:** Only `VITE_*` variables are available in the browser.
- **Backend:** All variables above are read from the environment or from `backend/.env`.
- There is no separate worker process; the backend and optional queue consumers (if any) use the same configuration.

For setup steps, see [SETUP.md](SETUP.md). For project structure, see [DEVELOPERS.md](DEVELOPERS.md).
