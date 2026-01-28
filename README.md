# Magic3T Monorepo

[![Audit](https://github.com/King-witcher/Magic3T/actions/workflows/audit.yml/badge.svg)](https://github.com/King-witcher/Magic3T/actions/workflows/audit.yml)
[![Biome CI](https://github.com/King-witcher/Magic3T/actions/workflows/biome.yml/badge.svg)](https://github.com/King-witcher/Magic3T/actions/workflows/biome.yml)


## Description
This is the Magic3T monorepo, which includes the backend, the frontend and some shared type libraries.

## Projects
- **[backend](./packages/backend)**: The backend server built with NestJS.
- **[frontend](./packages/frontend)**: The frontend application built with React and Vite.

## Running Locally

First off, install dependencies for all projects:

```bash
npm install
```

### Backend

- Navigate to the `backend` directory.

- Provide the necessary environment variables by copying the `.env.example` file to `.env` and filling in the required values.

> You will need to provide Firebase admin credentials in the `FIREBASE_ADMIN_CREDENTIALS` environment variable in a base64 encoded JSON format.

- To run the backend server locally, navigate to the `backend` directory and start the server:

```bash
npm run start:dev
```

### Frontend

- Navigate to the `frontend` directory.

- Provide the necessary environment variables by copying the `.env.example` file to `.env` and filling in the required values, if any.

- To run the frontend application locally, use the following command:

```bash
npm run dev
```
