# Developers

Technical overview of the SchoolSpace repo for contributors.

**See also:**  
[ARCHITECTURE.md](ARCHITECTURE.md) · [CONFIGURATION.md](CONFIGURATION.md) · [SETUP.md](SETUP.md) · [TESTING.md](TESTING.md) · [API.md](API.md)

---

## Languages and stack

- **Frontend:** [TypeScript](https://www.typescriptlang.org/) + [React](https://react.dev/) (Vite). Assumes basic knowledge of TypeScript/JavaScript.
- **Backend:** [C#](https://learn.microsoft.com/en-us/dotnet/csharp/) with [.NET 9](https://dotnet.microsoft.com/). ASP.NET Core Web API, Entity Framework Core, MySQL, Redis, RabbitMQ.

---

## Pull / merge requests

Pull requests should be peer-reviewed by at least one core developer. Use this format:

- **Summary:** Fixes, problems addressed, or new feature
- **Issues:** What issue or bug the PR addresses
- **Test:** How to verify the change
- **Extra notes:** Anything else future developers should know

## Git strategy

SchoolSpace uses [GitLab Flow](https://about.gitlab.com/topics/version-control/what-is-gitlab-flow/) (or similar branch-based workflow). Check with maintainers for the current convention.

---

## Architecture

SchoolSpace is a client–server app:

- **Client:** Browser-based React SPA (single-page application).
- **Server:** .NET Web API — modular monolith with clear separation between controllers, services, and repositories (MVC-style).

Possible future directions (not current):

- SSR/SEO (e.g. Next.js)
- Microservices (e.g. NATS)
- Mobile app (e.g. React Native)

---

## Frontend structure

The frontend lives under `frontend/`. Main areas:

- **`src/assets/`** — Static assets (e.g. SVGs)
- **`src/components/`** — React components, grouped by feature and shared components
- **`src/configs/`** — Configuration (e.g. EnvManager)
- **`src/pages/`** — Page-level components (auth, courses, etc.)
- **`src/routes/`** — Route definitions; router mounted in `routes/index.jsx` (or equivalent)
- **`src/stores/`** — Redux store and state
- **`src/styles/`** — Global and component CSS (e.g. on top of Bootstrap/Tailwind)
- **`App.tsx`** — Root layout and router mount
- **`Main.tsx`** — App mount, Redux provider, global imports

---

## Backend structure

The backend is a .NET 9 web API under `backend/`. All API responses are JSON. The backend is stateless; session-like data (e.g. refresh and verification tokens) is stored in Redis.

Main folders under `backend/src/app/`:

| Folder | Purpose |
|--------|--------|
| **`configurations/`** | App bootstrap: security (JWT, CORS, rate limiting), database, Redis, DI, routes, middleware |
| **`controllers/`** | HTTP controllers; handle requests and call services |
| **`services/`** | Business logic; interfaces in `interfaces/`, implementations in `implementations/` (e.g. auth, tokens, captcha, cache) |
| **`repositories/`** | Data access; interfaces and EF-based implementations for entities (e.g. User, Report, Contact) |
| **`models/`** | Domain and EF entities (e.g. `User`, `Report`) |
| **`dtos/`** | Request/response DTOs (e.g. auth, user, report) |
| **`errors/`** | HTTP exception types (e.g. 400, 401, 404) |
| **`attributes/`** | Validation and other attributes |
| **`utilities/`** | Logging, error handling, helpers |

Top-level entry points:

- **`Program.cs`** — Host builder, services, middleware pipeline
- **`appsettings*.json`** — Optional app settings (env vars and `.env` take precedence)

Database migrations are in `backend/Migrations/` and are applied with Entity Framework Core (`dotnet ef database update`).

---

## Scripts (root and `scripts/`)

From the repo root you can use `app.ps1` (Windows PowerShell or cross-platform):

| Command | Description |
|--------|-------------|
| `.\app.ps1 setup` | Install frontend (npm) and backend (dotnet restore) dependencies |
| `.\app.ps1 local` | Run frontend and backend locally (Node + .NET) |
| `.\app.ps1 docker` | Run stack via Docker Compose |
| `.\app.ps1 env` | Generate `.env` templates for frontend and backend |
| `.\app.ps1 format` | Format backend (dotnet format) and frontend (npm run format) |
| `.\app.ps1 migrate` | Add a new EF Core migration (prompts for name) |
| `.\app.ps1 test` | Run backend tests (dotnet test) and Playwright E2E tests |
| `.\app.ps1 port` | Clear ports 3040 and 8040 (Windows) |
| `.\app.ps1 k8` | Build images and deploy to Kubernetes (see `schoolspace.yml`) |

Equivalent shell scripts live in `scripts/shell/` for Linux/macOS.
