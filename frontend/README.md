# Magic3T Frontend

[![Audit](https://github.com/King-witcher/Magic3T-Frontend/actions/workflows/audit.yml/badge.svg)](https://github.com/King-witcher/Magic3T-Frontend/actions/workflows/audit.yml)
[![Biome Lint](https://github.com/King-witcher/Magic3T-Frontend/actions/workflows/biome-lint.yml/badge.svg)](https://github.com/King-witcher/Magic3T-Frontend/actions/workflows/biome-lint.yml)

## Overview

Frontend application for Magic3T, built with React 19, TypeScript, Vite, and TanStack Router.

## Key Features

- **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Type-safe Routing**: TanStack Router with automatic route generation
- **Real-time Communication**: Socket.IO for game state synchronization
- **Observability**: Sentry integration for error tracking, performance monitoring, and session replay
- **Firebase Auth**: Google authentication provider
- **Responsive Design**: League of Legends themed UI

## How to run

### Using Docker

If you prefer to run magic3t locally using Docker:

```shell
docker build -t magic3t-frontend .
docker run -p 3000:3000 magic3t-frontend
```

### Local Development

1. Install dependencies:
```shell
npm install
```

2. Copy `.env.example` to `.env` and fill in the required values:
```shell
cp .env.example .env
```

3. Run the development server:
```shell
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Required environment variables (see `.env.example` for details):

- `VITE_API_URL` - Backend API URL
- `VITE_CDN_URL` - CDN URL for assets
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_SENTRY_DSN` - Sentry DSN (optional, only for production)
- `SENTRY_AUTH_TOKEN` - Sentry auth token for sourcemap upload (optional)

## Documentation

For detailed technical documentation, see [FRONTEND.md](./docs/FRONTEND.md).
