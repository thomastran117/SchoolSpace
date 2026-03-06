# Setup

This guide explains how to run SchoolSpace locally for development or demos, with or without Docker.

## Requirements

### Docker (recommended)

Docker provides a consistent environment and runs MySQL, Redis, and RabbitMQ for you.

- [Windows Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Linux Docker Engine](https://docs.docker.com/engine/)

Verify Docker:

```bash
docker --version
```

### Local development (without Docker)

You need:

- **Node.js** (v18+) — for the frontend and Playwright tests
- **.NET SDK** (9.0) — for the backend
- **MySQL** — primary database
- **Redis** — caching and token storage
- **RabbitMQ** — message queue (optional for core features)

Links:

- [Node.js](https://nodejs.org/en/download)
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Redis](https://redis.io/downloads/)
- [MySQL](https://dev.mysql.com/downloads/)
- [RabbitMQ](https://www.rabbitmq.com/tutorials)

[Installing Redis on Windows](https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/install-redis-on-windows/)  
[Installing RabbitMQ on Windows](https://www.rabbitmq.com/docs/download)

Verify your environment:

```bash
node --version
dotnet --version
redis-cli ping
# RabbitMQ: sudo rabbitmq-diagnostics ping  (Linux) or check service (Windows)
```

## Before installation

### 1. Clone the project

```bash
git clone https://github.com/thomastran117/SchoolSpace.git
cd SchoolSpace
```

### 2. Create .env files

From the repo root, generate `.env` templates for the frontend and backend:

**Windows (PowerShell):**

```powershell
.\app.ps1 env
```

**Linux/macOS:**

```bash
./app.ps1 env
```

Or run the script directly: `scripts/powershell/env.ps1` or `scripts/shell/env.sh`.  
Edit the generated `.env` files in `frontend/` and `backend/` with your database URLs, Redis, JWT secret, etc. See [CONFIGURATION.md](CONFIGURATION.md).

## Running with Docker (recommended)

From the repo root:

**Windows:**

```powershell
.\app.ps1 docker
```

**Linux/macOS:**

```bash
./app.ps1 docker
```

This builds and starts the frontend, backend, MySQL, Redis, and RabbitMQ.  
Frontend: http://localhost:3040 — Backend API: http://localhost:8040

## Running locally (without Docker)

1. **Install dependencies**

   **Windows:**

   ```powershell
   .\app.ps1 setup
   ```

   **Linux/macOS:**

   ```bash
   ./app.ps1 setup
   ```

   This runs `npm install` in the frontend and `dotnet restore` in the backend.

2. **Apply database migrations (first time)**

   From the repo root, with MySQL running and `DATABASE_URL` set in `backend/.env`:

   ```bash
   cd backend
   dotnet ef database update
   ```

   To add a new migration: `.\app.ps1 migrate` (or `dotnet ef migrations add YourMigrationName --project backend` from repo root).

3. **Start the app**

   **Windows:**

   ```powershell
   .\app.ps1 local
   ```

   **Linux/macOS:**

   ```bash
   ./app.ps1 local
   ```

   This starts the frontend (Vite) and the .NET backend in one go. Stop with **Ctrl+C**.

## Accessing the application

- **Frontend:** http://localhost:3040  
- **Backend API:** http://localhost:8040 (routes are prefixed with `/api`)

Use the React frontend for full flows; it handles auth (JWT access/refresh), request bodies, and UI.

For more detail, see [DEVELOPERS.md](DEVELOPERS.md) and [CONFIGURATION.md](CONFIGURATION.md).
