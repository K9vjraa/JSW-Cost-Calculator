# MCMS Docker Development Guide & Troubleshooting Instructions

This document outlines the standard commands, workflows, and solutions to common errors for running the JSW Metal Cost Management System (MCMS) with Docker.

---

## 🚀 Docker Setup & Commands

### 1. Build Services
Build or rebuild the docker containers (needed if dependencies or Dockerfiles change):
```bash
docker compose build
```

### 2. Start Services
Run the full-stack system in background (detached mode):
```bash
docker compose up -d
```

### 3. Service Logs
Stream terminal logs from all containers in real time:
```bash
docker compose logs -f
```
Or view logs for a specific service (e.g., the backend API):
```bash
docker compose logs -f api
```

### 4. Stop Services
Stop and shut down containers without deleting database volumes:
```bash
docker compose down
```

### 5. Full Database Reset
Stop containers and **completely delete all database volumes** (wipes the database clean):
```bash
docker compose down -v
```

---

## 🗄️ Prisma & Database Commands

Execute these commands while the containers are running to perform migrations and seeding.

### 1. Run Prisma Studio
Launch the Prisma dashboard. It is configured to run at `http://localhost:5555`:
```bash
# Done automatically by the prisma-studio service container
```
If you need to run it manually:
```bash
docker compose exec api npx prisma studio --port 5555 --browser none
```

### 2. Create / Run Prisma Migrations
Generate migrations if you change any model definitions in `schema.prisma`:
```bash
docker compose exec api npx prisma migrate dev
```

### 3. Run Database Seeding
Populate the database with roles, metals, grades, price lists, and mock users:
```bash
docker compose exec api npx prisma db seed
```

---

## 🛠️ Troubleshooting & Common Issues

### 1. Port 5432 / 5000 / 5173 is already in use
**Problem**: Docker fails to launch because a port is occupied by a local process.
**Solution**:
- If port `5432` is busy, a local instance of PostgreSQL is probably running on Windows. You can stop it by opening PowerShell (Admin) and running:
  ```powershell
  Stop-Service postgresql*
  ```
- If ports `5000` or `5173` are busy, locate and terminate the process using that port (or stop any running node dev servers).

### 2. Prisma Client Out of Sync
**Problem**: The TypeScript compiler throws errors inside the container complaining that the Prisma Client types do not match the database model.
**Solution**:
- Force generate the prisma client within the backend container:
  ```bash
  docker compose exec api npx prisma generate
  ```

### 3. Windows-to-Docker HMR/Volume Issues
**Problem**: Changes to backend source files do not trigger hot reload inside the container, or npm modules fail.
**Solution**:
- In the `docker-compose.yml`, anonymous volumes `/app/node_modules`, `/app/apps/backend/node_modules`, and `/app/apps/frontend/node_modules` prevent your Windows-host dependencies from replacing container-installed Linux dependencies.
- Ensure Docker Desktop has permission to access the project path. Under **Settings → Resources → File Sharing**, make sure the root project folder directory is listed.

---

## 🌐 Endpoint Summary

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Database Health**: [http://localhost:5000/health](http://localhost:5000/health)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)
- **PostgreSQL Database Port**: `5432`
