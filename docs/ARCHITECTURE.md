# Architecture

High-level architecture of SchoolSpace.

## Diagram

![SchoolSpace architecture diagram](https://github.com/user-attachments/assets/30eb20fc-5ffc-4f4e-8a89-fc59a98c8e10)

## Overview

- **Client:** React SPA (Vite + TypeScript) in the browser. Communicates with the backend over HTTP/HTTPS. Handles auth (access/refresh tokens), routing, and UI state (e.g. Redux).

- **Backend:** .NET 9 Web API (ASP.NET Core). Stateless; uses JWT for access tokens and Redis for refresh and verification tokens. Persists data in MySQL via Entity Framework Core. Optional use of RabbitMQ for async messaging.

- **Data and infrastructure:**
  - **MySQL** — Primary relational store (users, courses, assignments, etc.)
  - **Redis** — Caching, rate limiting, and token storage (refresh/verification)
  - **RabbitMQ** — Message queue for background or async tasks (if enabled)

- **Deployment:** The app can run locally (Node + .NET), via Docker Compose (frontend, backend, MySQL, Redis, RabbitMQ), or on Kubernetes using the provided manifests (`schoolspace.yml`).

There is no separate “worker” service in the current setup; background work (if any) is handled within the backend or via queue consumers as needed.

For folder structure and conventions, see [DEVELOPERS.md](DEVELOPERS.md). For configuration, see [CONFIGURATION.md](CONFIGURATION.md).
