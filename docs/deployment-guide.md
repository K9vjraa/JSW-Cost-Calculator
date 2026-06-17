# JSW MCMS Deployment Guide

This guide describes the complete setup and deployment procedures for the JSW Metal Cost Management System (MCMS). It covers local installation, production containerization with Docker, PostgreSQL setup (both local and cloud-based), and environment variable configurations.

---

## 1. Environment Configurations

Both frontend and backend rely on configuration files (`.env`). Standardized variables must be configured properly for the application to function correctly.

### Backend Environment Variables (`apps/backend/.env`)

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string with SSL mode. | `postgresql://user:password@host:5432/dbname?sslmode=require` |
| `JWT_ACCESS_SECRET` | 64-character base64 encoded secret for access tokens. | Generate using: `openssl rand -base64 64` |
| `JWT_REFRESH_SECRET` | 64-character base64 encoded secret for refresh tokens. | Generate using: `openssl rand -base64 64` |
| `ACCESS_TOKEN_TTL` | Lifespan of the short-lived access JWT. | `15m` |
| `REFRESH_TOKEN_TTL_DAYS` | Lifespan of the refresh JWT in days. | `7` |
| `CLIENT_ORIGIN` | CORS allowed origin (Vite client URL). | `http://localhost:5173` or production URL |
| `PORT` | API Server listening port. | `4000` |
| `NODE_ENV` | Running environment mode. | `development` or `production` |
| `LOG_LEVEL` | Logging level. | `info`, `error`, `warn`, `debug` |

### Frontend Environment Variables (`apps/frontend/.env`)

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint URL for the backend API. | `http://localhost:4000/api` |
| `VITE_APP_VERSION` | Current application version. | `1.0.0` |

---

## 2. Local Setup Guide

Follow these steps to run the JSW MCMS on a local workstation for development and testing.

### Prerequisites

Ensure you have the following installed on your machine:

* **Node.js**: v18.x or v20.x (LTS recommended)
* **npm**: v9.x or later
* **PostgreSQL**: v14.x or later (running locally or in a container)

### Step-by-Step Local Setup

1. **Clone the repository and install workspace dependencies**:

   ```bash
   npm install
   ```

2. **Configure Backend Environment Variables**:

   Copy the template file to `.env` in the backend app folder:

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   ```

   Open `apps/backend/.env` and configure:
   * `DATABASE_URL`: Point to your local PostgreSQL database (e.g., `postgresql://postgres:postgres@localhost:5432/mcms?schema=public`).
   * Generate access and refresh tokens secrets using:
     ```bash
     openssl rand -base64 64
     ```

3. **Configure Frontend Environment Variables**:

   Copy the template file to `.env` in the frontend app folder:

   ```bash
   cp apps/frontend/.env.example apps/frontend/.env
   ```

   Make sure the `VITE_API_URL` points to `http://localhost:4000/api`.

4. **Initialize and Seed the Database**:

   Run migrations and seed the initial dataset using Prisma:

   ```bash
   npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma
   ```

   This command compiles database schemas, runs PostgreSQL migrations, and executes the seed script to populate users (including `DEMO_ADMIN` `demo.admin@jsw.in`), grades (IS 2062, IS 1786), metals, price catalogs, and initial cost calculations.

5. **Start Dev Servers**:

   Start both backend and frontend concurrently from the root directory:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` and the API server at `http://localhost:4000`.

---

## 3. Docker Production Setup

Docker enables self-contained, reproducible builds of JSW MCMS, isolating the client, server, and database into lightweight containers.

### Production Orchestration Overview

The production Docker Compose environment maps:
* **Client (frontend)**: Built with a multi-stage Node build, served using Nginx on port `80`.
* **API Server (backend)**: Built using multi-stage Node build, runs on port `5000`.
* **Database (postgres)**: PostgreSQL database containerized internally.

### Launching in Production

To build and launch the production container ecosystem, run the following command at the root level:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Production Health Checks

The composition configuration enforces automatic health monitoring:
* **Database Container**: Pings postgres using `pg_isready` command periodically to ensure database state is responsive.
* **API Server Container**: Executes a health check script to query the `/api/v1/health` endpoint, restarting automatically if the node API is unhealthy.

To verify container health statuses:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 4. Database Setup & Cloud Guide

JSW MCMS is designed to work with both local PostgreSQL instances and cloud PostgreSQL databases (such as Neon).

### Neon PostgreSQL Configuration (Recommended for Cloud)

1. Log in to the Neon Console and create a new project.
2. Under **Connection details**, select your database, and copy the connection string.
3. Paste this connection string into your `DATABASE_URL` field in `apps/backend/.env`.
4. Ensure `?sslmode=require` is appended to the connection string to secure all data transmissions.
5. Apply database schemas by running migrations:
   ```bash
   npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
   ```

### Backup and Restore Routines

To perform database backup and restore operations, JSW MCMS includes dedicated scripts in the backend workspace.
See [Database Backup & Recovery Guide](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/backup-recovery.md) for full instructions and rollback procedures.
