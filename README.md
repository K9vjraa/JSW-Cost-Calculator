# JSW Metal Cost Management System

MCMS is a focused industrial costing platform for JSW Steel. It centralizes master-locked metal pricing, alloy and raw-material costing, reports, comparison workflows, notifications, and auditable role-based access without expanding into ERP, inventory, payment, IoT, AI forecasting, or blockchain scope.

## Stack

- [`client/`](client/README.md): React 19 + TypeScript + Vite + Tailwind CSS v4 + ShadCN-style source components + React Router + Axios + Chart.js + Framer Motion
- [`server/`](server/README.md): Express 5 + TypeScript + Prisma + PostgreSQL + JWT access/rotating refresh sessions + bcrypt + Helmet + CORS + rate limiting + Zod
- Exports: PDFKit PDFs and ExcelJS workbooks
- Delivery: Docker Compose definitions for client, API, and PostgreSQL

## Features

- Fixed-layout Admin Dashboard and User Dashboard rendered as a polished white/gray/blue industrial SaaS UI from the supplied sketches
- Three calculation modes backed by one pricing model:
  - multi-metal calculator
  - alloy workspace with expandable raw materials
  - raw-material composition builder
- Center product-property accordions and live summary cost panel
- Grade comparison page with sticky comparison table and difference highlighting
- Metals, grades, raw materials, alloys, suppliers, price lists, price history, users, reports, audit logs, and in-app notifications APIs
- Calculation snapshots so future master price updates do not mutate history
- PDF calculation receipts and PDF/Excel report exports

## Local Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy environment values for the API:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

3. Start PostgreSQL. Docker Compose is supplied when Docker is available:

   ```powershell
   docker compose up -d db
   ```

4. Create schema and seed demo data:

   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. Start the client and API:

   ```powershell
   npm run dev
   ```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000/api`



.
http://localhost:5173/login    #local host link

➜  Local:   http://localhost:5174/
➜  Network: http://10.113.249.110:5174/

The frontend has a development-only fixture fallback so the supplied dashboard/workspace design can be previewed even when PostgreSQL is not yet running. Production login does not use that fallback.

## Demo Users

All seeded demo users use password `MCMS@2026`.

| Role | Email |
| --- | --- |
| Admin | `admin@jsw-mcms.local` |
| Procurement | `procurement@jsw-mcms.local` |
| Finance | `finance@jsw-mcms.local` |
| Production | `production@jsw-mcms.local` |

## API Shape

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Core business routes:
- dashboards: `/api/dashboard/admin`, `/api/dashboard/user`
- masters: `/api/metals`, `/api/grades`, `/api/raw-materials`, `/api/alloys`, `/api/suppliers`, `/api/prices`, `/api/price-history`
- costing: `/api/calculations/preview`, `/api/calculations`, `/api/calculations/:id`, `/api/calculations/:id/draft`, `/api/calculations/:id/complete`
- comparison: `/api/comparisons`, `/api/comparisons/preview`
- reports and exports: `/api/reports/*`, `/api/exports/*`
- admin visibility: `/api/users`, `/api/audit-logs`, `/api/notifications`, `/api/notifications/stream/live`

List endpoints support pagination and the master routes expose relevant filters or search fields. The backend is the authoritative RBAC boundary; frontend route visibility mirrors it for ergonomics.

## Cost Rules

Calculator price inputs are master locked.

```text
FinalTotal = sum(itemQuantity * activePrice * gradeMultiplier + itemExtraPrice)
```

Money, rates, and quantities use Prisma/PostgreSQL decimal columns. Every saved calculation stores the selected price, grade, and computed total snapshot used at that time.

## Verification

```powershell
npm run build
npm run test
```


