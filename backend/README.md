# JSW Metal Cost Management System (MCMS) - Backend Server

The secure, highly performant, and authoritative costing engine of the **JSW Metal Cost Management System**. Built on **Express 5** and **TypeScript**, it handles all industrial costing formulas, role-based access control (RBAC), historical audit tracking, database snapshots, reporting, and live updates.

---

## 🛠️ Technology Stack

- **Framework:** Express 5 + TypeScript + TSX (runtime watcher)
- **Database ORM:** Prisma ORM (connecting to PostgreSQL)
- **Security & Session:** JWT (Access/Rotating Refresh Tokens), HTTP-Only Cookies, bcryptjs, Helmet, CORS, and Express Rate Limiting
- **Validation:** Zod schemas for request validation (body, queries, params)
- **Reports:** PDFKit (PDF receipts) and ExcelJS (Excel calculation sheets)
- **Testing:** Vitest + Supertest for integration and endpoint verification

---

## 📂 Directory Structure

```text
server/
├── prisma/
│   ├── migrations/         # PostgreSQL migration files
│   ├── schema.prisma       # Prisma database schema definition
│   └── seed.ts             # Seed script for initial roles, users, metals, prices
├── src/
│   ├── config/             # Database and security configurations
│   ├── lib/                # Shared library singletons (Prisma client)
│   ├── middleware/         # Custom Express middleware (auth, RBAC checks)
│   ├── routes/             # Grouped API routes
│   │   ├── audit.ts        # Admin audit logs fetching
│   │   ├── auth.ts         # Authentication (Login, Silent Refresh, Logout)
│   │   ├── calculations.ts # Save, draft, list, and finalize costing calculations
│   │   ├── comparisons.ts  # Grade comparisons and properties
│   │   ├── dashboard.ts    # Aggregated KPI widgets for Admin/User roles
│   │   ├── exports.ts      # ExcelJS workbook exports
│   │   ├── masters.ts      # Master Tables (Metals, Grades, Suppliers, Prices)
│   │   ├── notifications.ts# Read, list, and live SSE event streams
│   │   ├── reports.ts      # PDFKit report generator
│   │   └── users.ts        # Admin-only user management
│   ├── services/           # Reusable core business logics
│   │   ├── audit.ts        # Contextual database audit tracker
│   │   ├── calculation.ts  # Precision costing formulas
│   │   └── notifications.ts# In-memory Server-Sent Events emitter
│   ├── types/              # Type mappings and request interfaces
│   ├── server.ts           # Express application initialization & middleware stack
│   └── index.ts            # Main HTTP server entry point
├── tests/                  # Integration tests for auth and calculations
├── package.json
└── tsconfig.json
```

---

## 🛡️ Security & Authentication Architecture

To protect JSW Steel's pricing algorithms and sensitive master tables:

1. **JWT Rotation Sessions:**
   - **Access Token:** High-entropy JWT with a short lifespan (e.g., 15 minutes) passed in headers.
   - **Refresh Token:** Rotating session JWT stored in a secure, `httpOnly`, `sameSite: strict`, and encrypted cookie. On refresh, the old token is revoked, and a replacement hash is linked, preventing replay attacks.

2. **Access Middleware (`middleware/auth.ts`):**
   - Authorizes requests against specific JSW roles: `Admin`, `Procurement`, `Finance`, `Production`.

3. **Defense-in-Depth:**
   - **Helmet:** Adds secure HTTP response headers to prevent clickjacking and injection.
   - **CORS:** Strictly limits origins to designated internal JSW clients.
   - **Rate Limiting:** Protects `/api/auth/login` and costing endpoints from denial-of-service and brute-force attempts.
   - **Zod Schema Verification:** All client payloads are parsed and sanitized using compile-time type-checked schemas.

---

## 🧮 Costing Logic & Master Snapshots

### 🏭 Industrial Calculations

Cost values use PostgreSQL `decimal` columns via Prisma (`Decimal.js`) to ensure floating-point errors do not affect JSW Steel costing values.

Formula:

```text
FinalTotal = sum(itemQuantity * activePrice * gradeMultiplier + itemExtraPrice)
```

### 📸 The Snapshot Principle

- Cost lists change daily based on market values. However, finalized calculations must remain static over time for compliance and billing integrity.
- When a user compiles a calculation (whether in Draft or Completed status), the server captures a deep copy of the **Prices**, **Multiplier**, and **Compositions** at that precise instance. This JSON state is stored inside the database columns `Calculation.snapshot` and `CalculationItem.snapshot`.
- Subsequent price list updates or metal edits do not mutate historical records.

---

## 🔔 Live Updates via Server-Sent Events (SSE)

Real-time notifications are streamed through **Server-Sent Events** (`/api/notifications/stream/live`):

- Eliminates HTTP polling, minimizing network overhead.
- When an administrator modifies a metal's price list, or a buyer submits an enormous alloy request, the server emits a live notification payload.
- Active clients receive the alert instantly, displaying a toast notification and updating counts in the header.

---

## 📜 Database Seeding & Demo Access

Database includes a complete mock steel mill inventory data seed (`prisma/seed.ts`).

Run `npm run seed` to setup:

- **Roles:** Admin, Procurement, Finance, Production
- **Materials:** High-grade Carbon Steel, Austenitic Stainless Steel, Ferro-alloys, zinc, and aluminum.
- **Price Lists:** Mock rates per kg/ton with historical progression logs.
- **Default Password:** `MCMS@2026` for all default users:
  - `admin@jsw-mcms.local`
  - `procurement@jsw-mcms.local`
  - `finance@jsw-mcms.local`
  - `production@jsw-mcms.local`

---

## 🛠️ Setup & Migrations

Inside the `server/` folder:

### ⚙️ 1. Configure Environments

Create a `.env` file from the template:

```powershell
Copy-Item .env.example .env
```

Provide your PostgreSQL connection parameters (`DATABASE_URL`) and JWT Secrets.

### 🔄 2. Generate Prisma Client & Run Migrations

```powershell
npm run prisma:generate
npm run prisma:migrate
```

### 🌱 3. Seed Database

```powershell
npm run seed
```

### 💻 4. Run Server in Development Mode

Starts a live reloading development backend using `tsx`.

```powershell
npm run dev
```

*API endpoints will be served at:* `http://localhost:4000/api`

---

## 🧪 Integration Testing

Integration and endpoint regression tests reside in the `tests/` folder.

Run backend tests using:

```powershell
npm run test
```

This tests core scenarios like authentication token rotations, master-locked cost updates, and unauthorized path rejections.
