# API Reference

How to use the **SchoolSpace API**.

## Accessing the API

- **Production:** Use the deployed base URL (e.g. `https://api.schoolspace.io`). Protected routes require a valid **Bearer** token in the `Authorization` header.
- **Local:** With the backend running (`.\app.ps1 local` or Docker), the API is at **http://localhost:8040**. All routes are under the `/api` prefix.

No API key is required at this time; authentication is via JWT (login/signup and refresh).

---

## Base URL and prefix

- Base URL (local): `http://localhost:8040`
- All API routes are prefixed with **`/api`** (e.g. `/api/auth/login`).

---

## Auth

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | `{ "email", "password" }` | Login; returns access token (and refresh token if implemented). |
| POST | `/api/auth/signup` | `{ "email", "password", "role" }` | Register; may return a message to verify email. |
| GET | `/api/auth/verify` | — | Query: `?token=...`. Verify email with token. |
| POST | `/api/auth/refresh` | `{ "refreshToken" }` (or similar) | Issue new access (and optionally refresh) token. |

Responses and exact field names depend on the backend DTOs (e.g. `id`, `token`, `role`, or nested objects). Use the React frontend or inspect OpenAPI/Swagger if enabled.

---

## Users

User-related endpoints (exact paths and payloads may vary; check controllers):

- **GET** `/api/users/...` — Get current user or profile (authenticated).
- **PUT** `/api/users/...` — Update profile (authenticated).
- **DELETE** — Account or resource deletion if implemented.

---

## Other resources

The API may expose resources for **courses**, **enrollments**, **assignments**, **submissions**, **grades**, **discussions**, **announcements**, and **contents**. Endpoints and request/response shapes are defined in the backend controllers and DTOs.

For the authoritative list of routes and parameters:

1. Check the backend **controllers** under `backend/src/app/controllers/`.
2. Run the backend and use **Swagger/OpenAPI** if configured (e.g. `/swagger`).
3. Use the **React frontend** to see which endpoints are called for each feature.

---

## Authentication header

For protected routes, send the JWT access token:

```http
Authorization: Bearer <access_token>
```

If the token is expired, use the refresh endpoint to obtain a new access token, then retry the request.
