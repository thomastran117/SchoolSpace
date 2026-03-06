# Testing

This document describes how to run tests locally and in CI. All changes should pass the full test suite before merge.

## Running all tests

From the repo root:

**Windows:**

```powershell
.\app.ps1 test
```

**Linux/macOS:**

```bash
./app.ps1 test
```

This runs:

1. **Backend tests** — `dotnet test` in the `backend/` directory  
2. **Playwright E2E tests** — `npx playwright test` in the `playwright/` directory  

By default, the script stops at the first failure. To run all steps even if one fails (e.g. for local debugging):

```powershell
.\app.ps1 test -ContinueOnFail
```

---

## Backend tests

The backend uses .NET and xUnit (or the test framework in `backend/backend.csproj`). Tests cover controllers, services, repositories, and integration flows.

Run backend tests only:

```bash
cd backend
dotnet test
```

Run a specific project, filter, or test:

```bash
dotnet test --filter "FullyQualifiedName~Auth"
dotnet test --logger "console;verbosity=detailed"
```

---

## Frontend unit tests

Frontend unit tests (if present) are run via the frontend tooling, for example:

```bash
cd frontend
npm run test
```

See `frontend/package.json` for the exact script.

---

## End-to-end (Playwright)

Playwright tests run against the running frontend and backend to simulate real user flows and API behavior.

Prerequisites: Node.js, Playwright dependencies (`npx playwright install` if needed).

Run E2E only:

```bash
cd playwright
npx playwright test
```

With UI or specific project:

```bash
npx playwright test --ui
npx playwright test --project=chromium
```

Ensure the app is running (e.g. `.\app.ps1 local`) or that Playwright is configured to start it (see `playwright.config.*`).

---

## CI/CD

In CI, run the same commands:

1. `.\app.ps1 setup` (or `npm ci` + `dotnet restore`)
2. `.\app.ps1 test` (fail-fast)

Use the same script on Windows and Unix for consistency. See [SETUP.md](SETUP.md) and [DEVELOPERS.md](DEVELOPERS.md) for more context.
