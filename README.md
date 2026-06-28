<div align="center">

# JSW Metal Cost Management System

## Enterprise Industrial Costing Platform for JSW Steel

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/node-22%2B-green?style=for-the-badge)
![React](https://img.shields.io/badge/react-19-61dafb?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/postgresql-16-336791?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-ready-2496ed?style=for-the-badge)

**Project** - JSW Metal Cost Management System (MCMS)
**Version** - 1.0.0 | **Status** - Active Development
**Author** - Ishan Joshi | **Context** - JSW Steel Internship
**Last Updated** - June 2026


> This README is the single source of truth for the JSW MCMS codebase. Generated from direct inspection of the live implementation.

---

## Quick Start

```bash
git clone <repo-url> jsw-mcms && cd jsw-mcms
npm install
cp .env.example .env && cp apps/backend/.env.example apps/backend/.env
npm run prisma:generate && npm run prisma:migrate && npm run seed
npm run dev

# Backend: http://localhost:4000/api  |  Frontend: http://localhost:5173

```

**Docker:** `docker compose --profile local up --build`

**Default password for all seeded accounts:** `MCMS@2026`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Background](#2-business-background)
3. [System Overview](#3-system-overview)
4. [Architecture](#4-architecture)
5. [Technology Stack](#5-technology-stack)
6. [Project Structure](#6-project-structure)
7. [Installation Guide](#7-installation-guide)
8. [Environment Variables](#8-environment-variables)
9. [Authentication System](#9-authentication-system)
10. [Role-Based Access Control](#10-role-based-access-control)
11. [Module Documentation](#11-module-documentation)
12. [Component Documentation](#12-component-documentation)
13. [State Management](#13-state-management)
14. [Database Documentation](#14-database-documentation)
15. [API Documentation](#15-api-documentation)
16. [Business Workflows](#16-business-workflows)
17. [Calculation Engine](#17-calculation-engine)
18. [Comparison Engine](#18-comparison-engine)
19. [Security](#19-security)
20. [Performance](#20-performance)
21. [Audit Logging](#21-audit-logging)
22. [Export and Reporting](#22-export-and-reporting)
23. [Testing](#23-testing)
24. [Deployment Guide](#24-deployment-guide)
25. [Development Standards](#25-development-standards)
26. [Known Issues](#26-known-issues)
27. [Roadmap](#27-roadmap)
28. [Troubleshooting](#28-troubleshooting)
29. [Changelog](#29-changelog)
30. [Contributors](#30-contributors)
31. [License](#31-license)
32. [Appendix](#32-appendix)

---

## 1. Executive Summary

The **JSW Metal Cost Management System (MCMS)** is an enterprise-grade, web-based industrial costing platform for **JSW Steel**. Built during an internship engagement, it replaces manual spreadsheet-driven cost estimation with a structured, audited, role-controlled digital platform.

### Core Functions

| Function | Description |
| --- | --- |
| Material Master | Metals, ferro alloys, suppliers, alloys, price lists |
| Grade Lifecycle | DRAFT to SUBMITTED to PUBLISHED with versioning |
| Calculation Workspace | 4-mode real-time cost computation |
| Grade Comparison | Analytical comparison with similarity and recommendation scoring |
| Reports and Export | PDF, Excel, CSV on demand |
| Audit Trail | Every data change tracked with user, IP, and timestamp |
| User Management | Two-department RBAC |

### Target Users

| Department | Access Level |
| --- | --- |
| Costing Department | Full system: master data, prices, calculations, grades, reports, users, settings, audit |
| PDQC Department | Limited: read operations, workspace calculations, grade building, comparison, reports |

### Business Value

- Eliminates manual spreadsheet errors in cost estimation
- Real-time cost preview during composition building
- Immutable snapshot-locked calculations for auditability
- Complete audit trail of every data change
- Standardized grade lifecycle with version history
- Multi-format export for management reporting

---

## 2. Business Background

### Pain Points Addressed

| Manual Workflow Pain Point | MCMS Solution |
| --- | --- |
| Price data in multiple Excel files | Centralized PriceList with effective dates |
| No version control on grade compositions | GradeVersion snapshots plus GradeHistory |
| Separate spreadsheets per department | Single source of truth in PostgreSQL |
| No audit trail on calculations | Dual-layer audit logging |
| Manual PDF report generation | Server-rendered PDF/Excel/CSV with one click |
| No access control | JWT authentication plus RBAC |
| Grade comparison done manually | ComparisonEngine with similarity and recommendation scores |

---

## 3. System Overview

MCMS is a full-stack monorepo (jsw-mcms npm workspace) with a React 19 frontend SPA and an Express 5 Node.js API, sharing four packages.

```text
jsw-mcms/
  apps/frontend       React 19 + Vite 8, Tailwind CSS 4
  apps/backend        Express 5 + Node 22, Prisma 6 ORM (14 routes, 19 services)
  packages/           types, utils, ui, config
  prisma/             schema.prisma (613 lines, 25+ tables)
```

---

## 4. Architecture

### 4.1 Authentication Flow

```text
User submits email + password + department
POST /api/auth/login
Backend:
  1. findUnique(email) from profiles
  2. Verify password === "MCMS@2026"
  3. Verify department matches profiles.department
  4. Issue access token (15min) + refresh token (7d)
  5. Set HttpOnly cookie: mcms_refresh
  6. Log LOGIN_SUCCESS to AuditLog
Frontend: store tokens, set actor in Zustand, redirect /dashboard

On 401: POST /api/auth/refresh with cookie -> new access token -> retry queued requests
```

### 4.2 Authorization Flow

```text
Request -> authenticate() middleware
  jwt.verify(bearer, secret)
  prisma.user.findUnique(claims.sub) — active check
  req.actor = { id, email, role, department }
Route guard: allowRoles() or requireDepartment()
  PASS -> Controller -> Service -> Prisma -> Response
  FAIL -> 403 + AuditLog ACCESS_DENIED
```

### 4.3 Calculation Flow

```text
User builds composition in Workspace (mode: metal/raw-material/alloy/grade-builder)
POST /api/calculations/preview
For each item:
  Load Metal/RawMaterial from DB
  Query PriceList WHERE active=true AND effectiveFrom<=NOW() ORDER DESC LIMIT 1
  No active price -> 400 error
calculateBreakdown() via decimal.js:
  itemBaseCost = (qty x unitPrice x gradeMultiplier) + extraPrice
  totalBaseCost = sum of all items
  chargesTotal = sum of GST + additional charges
  finalCost = totalBaseCost + chargesTotal
Return to LiveSummaryPanel
User: Save Draft (mutable) OR Complete (immutable snapshot)
Audit log written + Notification sent
```

### 4.4 Comparison Flow

```text
POST /api/comparisons -> Create session with grade IDs
GET /api/comparisons/:id/results
  Cache check (5-min TTL) -> HIT: return cached
  MISS: ComparisonEngine.calculate(grades, refGradeId)
    Per grade: baseMetrics, similarityScore (0-100), recommendationScore (0-100), jsonVariance
  RecommendationService.generateRecommendations()
  Save result + cache 5min
ComparisonMatrix + ComparisonAnalytics render
Export: POST /api/comparisons/:id/export -> PDF/Excel/CSV
```

### 4.5 Request Lifecycle

```text
HTTP Request
  -> Helmet (security headers)
  -> CORS (origin check)
  -> Rate Limiter (10 req/min for login)
  -> authenticate() (JWT verify + DB user check)
  -> auditMiddleware (registers finish listener)
  -> Route Handler -> Controller -> Service -> Prisma -> PostgreSQL
  -> Response sent
  -> auditMiddleware finish: if POST/PUT/DELETE -> async audit log write
```

---

## 5. Technology Stack

### Frontend

| Technology | Version | Role |
| --- | --- | --- |
| React | 19.x | UI rendering |
| TypeScript | ~6.0.2 | Type safety |
| Vite | 8.x | Build tool and HMR |
| Tailwind CSS | 4.x | Utility CSS |
| React Router | 7.x | Client routing with code splitting |
| TanStack Query | 5.x | Server state caching |
| Zustand | 5.x | Global client state with persist |
| Framer Motion | 12.x | Animations |
| Recharts | 3.x | Dashboard charts |
| React Hook Form | 7.x | Form state |
| Zod | 3.x | Schema validation |
| Axios | 1.x | HTTP client with interceptors |
| Radix UI | Various | Accessible headless primitives |
| TanStack Table | 8.x | EnterpriseDataTable engine |
| TanStack Virtual | 3.x | Virtual list rendering |
| ExcelJS / jsPDF | Various | Client-side export |
| Lucide React | 1.x | Icons |
| Sonner | 2.x | Toast notifications |

### Backend

| Technology | Version | Role |
| --- | --- | --- |
| Node.js | 22.x | Runtime |
| Express | 5.x | HTTP framework |
| TypeScript | ~5.8.3 | Type safety |
| Prisma ORM | 6.x | Type-safe DB client and migrations |
| jsonwebtoken | 9.x | JWT sign and verify |
| helmet | 8.x | 15+ security headers |
| cors | 2.x | CORS control |
| express-rate-limit | 7.x | Login rate limiting |
| decimal.js | 10.x | Precision monetary arithmetic |
| ExcelJS | 4.x | Server-side Excel generation |
| PDFKit | 0.17.x | Server-side PDF generation |
| Zod | 3.x | Request validation |

### Database and DevOps

| Technology | Role |
| --- | --- |
| PostgreSQL 16 | Primary database |
| Neon | Production cloud PostgreSQL |
| Docker/Docker Compose | Containerized deployment |
| Nginx | SPA static file serving |
| npm Workspaces | Monorepo management |
| Vitest | Unit testing |
| Playwright | E2E testing |

---

## 6. Project Structure

```text
jsw-mcms/
  apps/backend/src/
    app.ts                        Express factory - all routes and middleware
    server.ts                     HTTP entry point
    cache/comparison.cache.ts     In-memory TTL cache
    config/env.ts                 Zod-validated env loading
    controllers/ (13 files)
      auth.controller.ts
      comparison.controller.ts
      grade.controller.ts
      import.controller.ts
      metal.controller.ts
      report.controller.ts
      settings.controller.ts
      user.controller.ts
    middleware/
      auth.ts                     JWT auth, allowRoles, requireDepartment
      audit.ts                    Auto audit on POST/PUT/DELETE
    prisma/client.ts              Singleton Prisma instance
    repositories/
      comparison.repository.ts
    routes/ (14 files)
      auth.ts
      calculations.ts             CRUD + preview + complete (16KB)
      comparisons.ts
      dashboard.ts
      exports.ts                  All exports PDF/Excel/CSV (29KB, 673 lines)
      import.ts
      masters.ts                  Metals, grades, raw materials, suppliers, prices
      notifications.ts
      reports.ts
      search.ts
      settings.ts
      users.ts
    services/ (19 files)
      calculation.ts              Core engine using decimal.js
      ComparisonEngine.service.ts Metrics and scoring
      comparison.service.ts       Orchestration and caching
      csvImport.service.ts        Bulk import (42KB)
      grade.service.ts            Lifecycle (10KB)
      metal.service.ts            Metal and price (14KB)
      auth.service.ts
      audit.service.ts
      RecommendationService.ts    (7KB)

  apps/frontend/src/
    App.tsx / main.tsx
    components/ (40+ files)
      AnimatedNumber.tsx
      BulkUpdateModal.tsx
      CalculationCard.tsx         50KB
      CommandPalette.tsx          17KB - global Cmd+K
      EnterpriseDataTable.tsx     27KB - TanStack Table and Virtual
      GradeBuilder/
        GradeEditor.tsx           49KB - main form
        GradeLibrarySidebar.tsx   14KB
        GradeLiveSummary.tsx      10KB
        GradeWorkflowStepper.tsx
      LiveSummaryPanel.tsx        28KB
      RawMaterialTable.tsx        49KB
      workspace/
        ComparisonMatrix.tsx
        ComparisonAnalytics.tsx
        RecommendationCard.tsx
      guards/DepartmentGuard.tsx
    hooks/ (8 files)
      useComparison.ts, useDebounce.ts, useLiveNotifications.ts
      useQuery.ts (9KB), useSearch.ts, useTableQuery.ts
    layouts/AppShell.tsx          25KB
    pages/
      ComparisonPage.tsx          12KB
      Dashboards.tsx              27KB
      ErrorPages.tsx              404/403/500/Maintenance
      LandingPage.tsx             58KB - public landing
      LoginPage.tsx               22KB
      OperationsPages.tsx         222KB - Masters/Users/Settings/Audit
      ReportsPage.tsx             64KB
      WorkspacePage.tsx           63KB - core workspace
    routes/index.tsx
    services/
      api.ts                      Axios + token management + refresh (6KB)
      gradeMasterApi.ts           11KB
      materialRatesApi.ts         5KB
    store/ (14 Zustand stores)
      authStore.ts                Actor + localStorage persist
      workspaceStore.ts
      gradeBuilderStore.ts
      comparisonStore.ts
      notificationStore.ts
      uiStore.ts

  packages/
    config/   @jsw-mcms/config
    types/    @jsw-mcms/types (Actor, shared types)
    ui/       @jsw-mcms/ui
    utils/    @jsw-mcms/utils

  prisma/
    schema.prisma       613 lines, 25+ models
    migrations/

  e2e/                  Playwright E2E tests
  docker-compose.yml
  docker-compose.prod.yml
  package.json          Root monorepo (npm workspaces)
```

---

## 7. Installation Guide

### Prerequisites

| Requirement | Recommended |
| --- | --- |
| Node.js | 22.x LTS |
| npm | 10.x |
| PostgreSQL | 16 or Neon cloud |
| Docker | Latest |

### Steps

```bash

# 1. Clone

git clone <repository-url> jsw-mcms && cd jsw-mcms

# 2. Install all workspace dependencies

npm install

# 3. Configure environment files

cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Database setup

npm run prisma:generate
npm run prisma:migrate
npm run seed

# 5. Start dev servers

npm run dev
```

**Verify:** `GET http://localhost:4000/api/health` returns `{"status":"ok","service":"mcms-api"}`

---

## 8. Environment Variables

| Variable | Where | Description | Security |
| --- | --- | --- | --- |
| DATABASE_URL | backend/.env | Full PostgreSQL connection string | Contains credentials |
| JWT_ACCESS_SECRET | backend/.env | Access token signing secret (64+ chars) | Critical |
| JWT_REFRESH_SECRET | backend/.env | Refresh token signing secret (different from access) | Critical |
| ACCESS_TOKEN_TTL | backend/.env | Access token expiry e.g. 15m | Keep short |
| REFRESH_TOKEN_TTL_DAYS | backend/.env | Refresh token expiry in days (default: 7) | |
| CLIENT_ORIGIN | backend/.env | CORS whitelist - must match frontend URL exactly | |
| NODE_ENV | backend/.env | development or production | |
| VITE_API_URL | frontend/.env | Backend URL used by browser (in JS bundle) | |

Generate secrets: `openssl rand -base64 64` (run twice for two different secrets)

Never commit .env files. Use .env.example as template.

---

## 9. Authentication System

### Token Architecture

| Token | Storage | TTL | Purpose |
| --- | --- | --- | --- |
| Access Token (HS256) | localStorage (mcms-access-token) | 15 min | All protected API requests |
| Refresh Token (HS256) | HttpOnly Cookie (mcms_refresh) | 7 days | Issue new access tokens |

### JWT Access Token Claims

```typescript
{ sub: string; email: string; name: string; role: string; department?: string; }
```

### Login Validation Steps

1. profiles table lookup by email
2. Password verified against "MCMS@2026"
3. Selected department verified against profiles.department
4. Access token (15m) + refresh token (7d) issued
5. Refresh token set as HttpOnly cookie
6. LOGIN_SUCCESS written to AuditLog

### Automatic Token Refresh

On 401 response: POST /api/auth/refresh with cookie -> new accessToken -> queued requests retried. On failure: logout + redirect /login.

### Protected Route Structure

```text
Public:          /  /login
All auth:        /dashboard  /workspace  /grade-builder
                 /material-rates  /reports  /grade-comparison
COSTING only:    /material-master  /audit-logs  /user-management  /settings
```

---

## 10. Role-Based Access Control

### Roles

| Role | Department | Description |
| --- | --- | --- |
| COSTING_DEPARTMENT | COSTING | Full system access |
| PDQC | PDQC | Limited - read/calculate only |

### Permission Matrix

| Feature | COSTING | PDQC |
| --- | --- | --- |
| Dashboard | Full admin view | Personal view |
| Calculation Workspace | Yes | Yes |
| View all calculations | Yes | Own only |
| Grade Builder create/update | Yes | Yes |
| Publish Grade | Yes | No |
| Delete Grade | Yes | No |
| Material Master CRUD | Yes | Read only |
| Price List CRUD | Yes | Read only |
| Material Rates | Read and publish | Read only |
| Alloys create/update | Yes | Yes |
| Grade Comparison view | Yes | Yes |
| Create Comparison Session | Yes | No |
| Reports and Export | Yes | Yes |
| Audit Logs | Yes | No |
| User Management | Yes | No |
| Settings write | Yes | No |
| Bulk Import | Yes | No |
| Global Search | Yes | Yes |

### Backend Enforcement

```typescript
allowRoles("COSTING_DEPARTMENT", "PDQC")
allowRoles("COSTING_DEPARTMENT")
requireDepartment(["COSTING"])
requireDepartment(["COSTING", "PDQC"])
```

requireDepartment logs ACCESS_DENIED to AuditLog on rejection.

---

## 11. Module Documentation

### Login Module

Route: /login | Public
Email + password + department selector (COSTING/PDQC) + Remember Me. React Hook Form + Zod validation. All failures audit-logged with IP.

### Dashboard

Route: /dashboard | COSTING + PDQC
COSTING view: 6 KPI cards (calculations, alloys, raw materials, users, metals, value), 7-day activity chart, distribution charts, recent calculations, audit feed.
PDQC view: Personal KPIs, personal activity, recent calculations, notifications.
API: GET /api/dashboard/admin (COSTING), GET /api/dashboard/user (all)

### Calculation Workspace

Route: /workspace | COSTING + PDQC | Core Module

| Mode | Description |
| --- | --- |
| metal | Select metal + grade, enter quantity |
| raw-material | Select ferro alloy, quantity + composition % |
| alloy | Load a saved alloy composition |
| grade-builder | Select grade, composition auto-loaded |

Live preview on every change. Charges panel (GST from SystemSettings). Save as Draft (mutable) or Complete (immutable snapshot).

### Grade Builder

Route: /grade-builder | COSTING + PDQC
6-section form: Basic Details, Material Composition, Mechanical Properties, Chemical Composition, Tolerance, Bend Properties.
Lifecycle: DRAFT -> [submit] -> SUBMITTED -> [validate] -> [publish, COSTING only] -> PUBLISHED

### Material Master

Route: /material-master | COSTING only
Tabs: Metals | Raw Materials (Ferro Alloys) | Suppliers | Alloys. Full CRUD with EnterpriseDataTable.

### Material Rates

Route: /material-rates | COSTING+PDQC (read); COSTING (write)
Price List management. Effective dates. Price history timeline. Rate publishing. Price resolution: most recent active=true AND effectiveFrom<=NOW().

### Grade Comparison

Route: /grade-comparison | COSTING + PDQC
Session-based. COSTING creates sessions. Results: cost variance, similarity score 0-100, recommendation score 0-100, JSON variance. 5-min result cache.

### Reports and Analytics

Route: /reports | COSTING + PDQC
Analytics: cost summary, trends, top alloys, status breakdown, price history. Saved report definitions. Server-side PDF/Excel/CSV.

### Audit Logs

Route: /audit-logs | COSTING only
Paginated, filterable audit trail. Export to CSV/Excel.

### Notifications

In-app. Priority: LOW/MEDIUM/HIGH. useLiveNotifications hook polls for new events. Bell icon with unread count badge.

### User Management

Route: /user-management | COSTING only
Create, update, deactivate, reactivate, suspend users. Departments: COSTING or PDQC.

### Settings

Route: /settings | COSTING (write); all (read)
Key/value store. Key "default_gst_rate" drives calculation charges.

---

## 12. Component Documentation

### EnterpriseDataTable (EnterpriseDataTable.tsx, 27KB)

TanStack Table v8 + TanStack Virtual. Column sort, global search, server-side pagination, row selection, row actions, export trigger, skeleton loader.

### LiveSummaryPanel (LiveSummaryPanel.tsx, 28KB)

Real-time cost breakdown: item costs, charge breakdown (GST, additional), totals in formatted INR.

### GradeEditor (GradeEditor.tsx, 49KB)

Multi-section grade form managing nested state across 6 specification sections.

### CommandPalette (CommandPalette.tsx, 17KB)

Cmd+K / Ctrl+K global palette. Real-time cross-entity search and navigation shortcuts.

### AppShell (AppShell.tsx, 25KB)

Main shell: sidebar (department-filtered nav), topbar (logo, search, notifications, user menu), notification slide-out panel.

### RawMaterialTable (RawMaterialTable.tsx, 49KB)

Ferro alloy management with integrated rate management, publish workflow, bulk update modal.

---

## 13. State Management

### Server State - TanStack Query

30-second stale time. 1 retry. Background refetch on window focus.
Custom hooks in useQuery.ts: useMetals(), useGrades(), useCalculations(), useCurrentUser(), useDashboard().

### Client State - Zustand

| Store | Purpose | Persistence |
| --- | --- | --- |
| authStore.ts | Actor (authenticated user) | localStorage |
| workspaceStore.ts | Workspace session state | None |
| gradeBuilderStore.ts | Grade editor form state | None |
| comparisonStore.ts | Active comparison session | None |
| notificationStore.ts | Panel state + unread count | None |
| uiStore.ts | Sidebar, modal visibility | localStorage |
| settingsStore.ts | Cached system settings | sessionStorage |

---

## 14. Database Documentation

### Enumerations

```prisma
enum CalculationStatus { DRAFT, SUBMITTED, APPROVED, COMPLETED, CANCELLED }
enum NotificationPriority { LOW, MEDIUM, HIGH }
enum DepartmentType { COSTING, PDQC }
```

### Core Tables

#### profiles (User)

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| full_name | TEXT | |
| email | TEXT UNIQUE | |
| department | DepartmentType | COSTING or PDQC |
| role | TEXT | COSTING_DEPARTMENT or PDQC |

#### Metal

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| name | TEXT | |
| code | TEXT UNIQUE | |
| category | TEXT | |
| unit | TEXT DEFAULT "kg" | |
| status | TEXT DEFAULT "ACTIVE" | |

Indexes: name, (category, status), createdAt

#### Grade

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| metalId | UUID -> Metal CASCADE | |
| name | TEXT | |
| version | INT DEFAULT 1 | Auto-incremented |
| status | TEXT DEFAULT "DRAFT" | DRAFT/SUBMITTED/PUBLISHED |
| multiplier | DECIMAL(10,4) | Cost multiplier |
| extraPrice | DECIMAL(14,2) | Fixed additional price |
| mechanicalProperties | JSON | UTS, yield, elongation, hardness |
| toleranceProperties | JSON | Dimensional tolerances |
| bendProperties | JSON | Bend characteristics |
| chemicalComposition | JSON | Elemental percentages |
| createdById | UUID -> User | Creator |
| approvedById | UUID -> User NULLABLE | Approver (COSTING) |

Unique: (metalId, name, subGrade) | Indexes: (metalId, status), name, status

#### ferro_alloy_master (RawMaterial)

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| RAW_MAT_ID | INT UNIQUE AUTO-INCREMENT | Legacy integer ID |
| ALLOY_NAME | TEXT | Ferro alloy name |
| IS_AVAIL | BOOLEAN DEFAULT true | Availability |
| IS_MICRO | BOOLEAN DEFAULT false | Micro-alloy |
| CURRENT_RATE | DECIMAL(16,4) | Published rate INR/kg |

#### Calculation

| Column | Type | Notes |
| --- | --- | --- |
| id | UUID PK | |
| batchId | TEXT UNIQUE | BATCH-XXXXXXXX |
| mode | TEXT | metal/alloy/raw-material/grade-builder |
| userId | UUID -> User | Creator |
| totalQuantity | DECIMAL(16,4) | Sum of items |
| baseCost | DECIMAL(18,4) | Before charges |
| finalCost | DECIMAL(18,4) | After charges |
| snapshot | JSON | Full state at save - immutable |
| status | CalculationStatus | DRAFT/COMPLETED/CANCELLED |

Indexes: (userId, createdAt), (status, createdAt), createdAt

#### CalculationItem

| Column | Type | Notes |
| --- | --- | --- |
| calculationId | UUID -> Calculation CASCADE | |
| quantity | DECIMAL(16,4) | Quantity in kg |
| unitPrice | DECIMAL(16,4) | Price at snapshot time |
| gradeMultiplier | DECIMAL(10,4) | Multiplier at snapshot |
| extraPrice | DECIMAL(16,4) | Extra at snapshot |
| baseCost | DECIMAL(18,4) | Computed item cost |

#### PriceList

| Column | Type | Notes |
| --- | --- | --- |
| metalId | UUID -> Metal NULLABLE | |
| rawMaterialId | UUID -> RawMaterial NULLABLE | |
| pricePerUnit | DECIMAL(16,4) | Price in INR |
| effectiveFrom | TIMESTAMPTZ | When active |
| active | BOOLEAN DEFAULT true | |

Indexes: (metalId, active, effectiveFrom), (rawMaterialId, active, effectiveFrom)

#### AuditLog

| Column | Type | Notes |
| --- | --- | --- |
| userId | UUID -> User NULLABLE | Actor |
| action | TEXT | CREATE/UPDATE/DELETE/LOGIN/ACCESS_DENIED |
| entity | TEXT | Calculation/Grade/Metal/etc. |
| entityId | TEXT NULLABLE | Affected UUID |
| ipAddress | TEXT NULLABLE | Request IP |
| details | JSON | path, method, statusCode, payload |

Indexes: (entity, createdAt), (userId, createdAt), createdAt

#### Grade Supplementary Tables

| Table | Purpose |
| --- | --- |
| GradeMaterial | Ferro alloy composition (% and qty) per grade |
| GradeVersion | Full grade snapshot at each version (snapshotJson) |
| GradeHistory | Change log: previousState and newState JSON |
| GradeValidationLog | Validation results with errors JSON |
| MechanicalProperty | Structured mechanical data (1:1 with Grade) |
| ChemicalProperty | Elemental composition data (1:1 with Grade) |

#### Comparison Tables

| Table | Purpose |
| --- | --- |
| comparison_sessions | Named sessions (ACTIVE/ARCHIVED) |
| comparison_items | Grade refs with position and colorCode |
| comparison_results | Computed metrics as JSON |
| comparison_snapshots | Point-in-time state snapshots |
| comparison_notes | User annotations |
| comparison_history | Session audit trail |
| comparison_exports | Export records (format + fileUrl) |
| comparison_preferences | Per-user view preferences |

#### Other Tables

| Table | Purpose |
| --- | --- |
| Notification | In-app notifications with priority and readAt |
| Report | Saved report definitions with filters JSON |
| SystemSetting | Key/value configuration store |
| GstSlab | GST rate definitions (future multi-rate) |
| JswProductCatalog | Product catalog reference data |
| Supplier | Supplier catalog |
| Alloy / AlloyComponent | Saved alloy compositions |
| PriceHistory | Price change audit trail |

---

## 15. API Documentation

Base URL (Development): http://localhost:4000/api
Base URL (Production): Set via VITE_API_URL
Auth Header: Authorization: Bearer <access_token>
Standard Response: { "data": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 } }

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | /api/auth/login | Login -> actor + tokens |
| POST | /api/auth/refresh | Refresh via HttpOnly cookie |
| POST | /api/auth/logout | Logout + clear cookie |
| GET | /api/auth/me | Current user profile |
| PUT | /api/auth/profile | Update own profile |

Login body: { email, password, department, rememberMe }

### Calculations

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| POST | /api/calculations/preview | All | Live preview (no persist) |
| POST | /api/calculations | All | Save as DRAFT |
| GET | /api/calculations | All | Paginated list (PDQC: own only) |
| GET | /api/calculations/:id | All | Single calculation |
| PUT | /api/calculations/:id/draft | All | Replace draft |
| POST | /api/calculations/:id/complete | All | Promote to COMPLETED |
| DELETE | /api/calculations/:id | Scoped | Cancel |
| GET | /api/calculations/defaults/charges | All | Default charges from settings |

Preview body: { name, mode, items: [{ metalId, gradeId, quantity }], charges: [{ name, kind, rate }] }

Preview response: { items: [...], charges: [...], totalQuantity, baseCost, chargesTotal, finalCost }

### Grades

| Endpoint | Permission |
| --- | --- |
| GET /api/grades | All |
| POST /api/grades | COSTING+PDQC |
| PUT /api/grades/:id | COSTING+PDQC |
| DELETE /api/grades/:id | COSTING |
| POST /api/grades/:id/clone | COSTING+PDQC |
| POST /api/grades/:id/validate | COSTING+PDQC |
| POST /api/grades/:id/submit | COSTING+PDQC |
| POST /api/grades/:id/publish | COSTING |
| GET/POST/PUT/DELETE /api/grades/:id/materials | All / COSTING+PDQC |

### Master Data

| Endpoint Group | All Users | COSTING Only |
| --- | --- | --- |
| GET /api/metals | Yes | |
| POST/PUT/DELETE /api/metals | | Yes |
| GET /api/raw-materials | Yes | |
| POST/PUT/DELETE /api/raw-materials | | Yes |
| GET /api/suppliers | Yes | |
| POST/PUT/DELETE /api/suppliers | | Yes |
| GET /api/alloys | Yes | |
| POST/PUT /api/alloys | COSTING+PDQC | |
| DELETE /api/alloys/:id | | Yes |
| GET /api/prices | Yes | |
| POST/PUT/DELETE /api/prices | | Yes |
| GET /api/price-history | Yes | |
| GET /api/material-rates/current/:id | Yes | |
| POST /api/material-rates/publish | | Yes |

### Comparisons

| Endpoint | Permission |
| --- | --- |
| GET /api/comparisons | All |
| POST /api/comparisons | COSTING |
| PUT /api/comparisons/:id | COSTING |
| DELETE /api/comparisons/:id | COSTING |
| GET /api/comparisons/:id/results | All (cached 5min) |
| GET /api/comparisons/:id/history | All |
| POST /api/comparisons/:id/export | All |
| POST /api/comparisons/:id/share | All |
| GET/PUT /api/comparisons/me/preferences | All |

### Exports

| Endpoint | Format |
| --- | --- |
| GET /api/exports/calculations/pdf | PDF |
| GET /api/exports/calculations/excel | XLSX |
| GET /api/exports/calculations/csv | CSV |
| GET /api/exports/metals/excel | XLSX |
| GET /api/exports/grades/excel | XLSX |
| GET /api/exports/raw-materials/excel | XLSX |
| GET /api/exports/audit-logs/excel | XLSX |
| GET /api/exports/audit-logs/csv | CSV |
| GET /api/exports/reports/:id/pdf | PDF |
| GET /api/exports/reports/:id/excel | XLSX |

### Report Analytics

| Endpoint | Description |
| --- | --- |
| GET /api/reports/analytics/cost-summary | Aggregated totals |
| GET /api/reports/analytics/trends | Time-series cost data |
| GET /api/reports/analytics/status-breakdown | Status distribution |
| GET /api/reports/analytics/top-alloys | Most-used alloys |
| GET /api/reports/analytics/price-history | Price change history |

### Other Endpoints

| Method | Endpoint | Permission |
| --- | --- | --- |
| GET | /api/health | None |
| GET | /api/search?q=query | All |
| GET | /api/dashboard/admin | COSTING |
| GET | /api/dashboard/user | All |
| GET | /api/audit-logs | All |
| GET/PUT | /api/notifications | All |
| GET/POST/PUT/DELETE | /api/users | COSTING |
| PUT | /api/users/:id/reactivate | COSTING |
| PUT | /api/users/:id/suspend | COSTING |
| GET/PUT | /api/settings | All/COSTING |
| POST | /api/import/metals | COSTING |
| POST | /api/import/grades | COSTING |
| POST | /api/import/prices | COSTING |
| POST | /api/import/all | COSTING |
| GET | /api/import/catalog | All |

---

## 16. Business Workflows

### Login

1. Submit email + password + department
2. POST /api/auth/login
3. Backend: verify email -> verify password -> verify department matches DB
4. Issue access (15m) + refresh (7d) -> set cookie
5. Frontend: store tokens, actor in Zustand, redirect /dashboard

### Grade Creation

1. /grade-builder -> New Grade
2. Fill 6 sections (Basic, Composition, Mechanical, Chemical, Tolerance, Bend)
3. Save Draft -> POST /api/grades (DRAFT, version 1)
4. Validate -> POST /api/grades/:id/validate -> GradeValidationLog
5. Submit -> POST /api/grades/:id/submit (SUBMITTED)
6. (COSTING) Publish -> POST /api/grades/:id/publish (PUBLISHED)
7. Audit log + notification

### Cost Calculation

1. /workspace -> select mode
2. Add items (material + grade + quantity)
3. POST /api/calculations/preview -> LiveSummaryPanel updates
4. Price resolution: PriceList WHERE active=true AND effectiveFrom<=NOW() ORDER BY effectiveFrom DESC LIMIT 1
   - No active price -> 400 error: update price master first
5. baseCost = (qty x unitPrice x multiplier) + extraPrice
6. finalCost = baseCost + chargesTotal
7. Save Draft (mutable) OR Complete (immutable snapshot)
8. Audit log + notification

### Grade Comparison

1. (COSTING) POST /api/comparisons -> session with grade IDs
2. (All) GET /api/comparisons/:id/results
3. Cache check (5-min TTL) -> HIT: cached / MISS: ComparisonEngine.calculate()
4. Per grade: baseMetrics, similarityScore (0-100), recommendationScore (0-100), jsonVariance
5. RecommendationService.generateRecommendations()
6. Cache result for 5min
7. (All) Export: POST /api/comparisons/:id/export -> PDF/Excel/CSV

---

## 17. Calculation Engine

File: apps/backend/src/services/calculation.ts (uses decimal.js)

### Formula

```text
Per item:   baseCost = (quantity x unitPrice x gradeMultiplier) + extraPrice
Total:      totalBaseCost = sum of all itemBaseCost
Charges:    GST: computedAmount = baseCost x (rate / 100)
            ADDITIONAL: computedAmount = flatAmount OR baseCost x (rate / 100)
            chargesTotal = sum of computedAmount
Final:      finalCost = totalBaseCost + chargesTotal
```

### Precision

All monetary values use ROUND_HALF_UP at 4 decimal places:
```typescript
const money = (v: Decimal) => v.toDecimalPlaces(4, Decimal.ROUND_HALF_UP);
```

### Price Resolution

```sql
SELECT * FROM "PriceList"
WHERE ("metalId" = $1 OR "rawMaterialId" = $2)
  AND active = true AND "effectiveFrom" <= NOW()
ORDER BY "effectiveFrom" DESC LIMIT 1;
```

No active price -> 400 Bad Request.

### Snapshot Locking

Full prices, multipliers, charges locked in snapshot JSON at save time. COMPLETED calculations never change even if prices are updated later.

### Calculation Modes

| Mode | Price Source |
| --- | --- |
| metal | PriceList for metalId |
| raw-material | PriceList for rawMaterialId |
| alloy | PriceList per alloy component |
| grade-builder | Bypasses price lookup (uses provided baseCost) |

---

## 18. Comparison Engine

File: apps/backend/src/services/ComparisonEngine.service.ts

### Metrics

Base Metrics per grade:
- price = metal PriceList pricePerUnit
- multiplier = grade.multiplier
- cost = price x multiplier + extraPrice

Variance vs reference grade:
- price diff = cur.price - ref.price
- cost diff = cur.cost - ref.cost
- JSON variance = key-by-key diff of chemical/mechanical/commercial/material

Similarity Score (0-100):
```text
distUTS   = ((curUTS - refUTS) / 1000)^2
distYield = ((curYield - refYield) / 800)^2
distance  = sqrt(distUTS + distYield)
score     = max(0, 100 - distance x 100)
```

Recommendation Score (0-100):
```text
uts     = UTS / 1000
yield   = YieldStrength / 800
quality = (uts + yield) / 2
value   = quality / cost
score   = min(100, value x 10000)
```

Cache: 5-minute in-memory TTL. Key: comparison_result_{sessionId}. Invalidated on session update or delete.

---

## 19. Security

| Measure | Implementation |
| --- | --- |
| JWT access tokens | HS256, 15-min TTL, server-side secret |
| Refresh cookie | httpOnly=true, sameSite=lax, secure=true in prod |
| User active check | Every JWT validation queries DB |
| Security headers | helmet - CSP, X-Frame-Options, HSTS, 15+ headers |
| CORS | Strict CLIENT_ORIGIN whitelist |
| Rate limiting | Login: 10 req/min per IP |
| Request size | express.json limit: 1MB |
| SQL injection | Prisma parameterized queries throughout |
| XSS | React escapes rendered values + Helmet XSS headers |
| Sensitive field scrub | password/passwordHash removed before audit log write |
| x-powered-by | Disabled: app.disable("x-powered-by") |

Note: Password MCMS@2026 is hardcoded in auth.service.ts. Intentional for current internal deployment. Per-user hashed passwords planned for Phase 2.

---

## 20. Performance

### Targets

| Metric | Target |
| --- | --- |
| Dashboard load | < 2 seconds |
| API response | < 500ms |
| Calculation preview | < 300ms |

### Frontend Optimizations

- All pages React.lazy() - code split by route
- TanStack Virtual - renders only visible table rows
- TanStack Query 30-second stale time
- useDebounce - prevents search API call on every keystroke
- Vite tree-shaking

### Backend Optimizations

- Promise.all() for parallel independent DB queries
- 5-minute comparison result cache
- All list endpoints paginated (default 20/page)
- Prisma select projections - fetch only required columns
- Export capped at 500 records

### Key Database Indexes

- (metalId, active, effectiveFrom) - critical price lookup path
- (rawMaterialId, active, effectiveFrom) - ferro alloy price lookup
- (userId, createdAt) - calculation queries
- (status, createdAt) - filtered list queries
- (entity, createdAt) and (userId, createdAt) - audit log queries

---

## 21. Audit Logging

### Dual-Layer Strategy

Automatic (auditMiddleware): Logs all POST/PUT/DELETE on response finish. Parses URL for entity and entityId. Maps HTTP method to action. Scrubs sensitive fields. Writes asynchronously (non-blocking).

Explicit (service-level): Critical operations add enriched context:
```typescript
await audit({ userId: req.actor.id, action: "COMPLETE", entity: "Calculation",
  entityId: calculation.id, ipAddress: req.ip, details: { batchId, finalCost } });
```

### Coverage

| Operation | Type |
| --- | --- |
| Login success/failure | Explicit |
| Department access denied (ACCESS_DENIED) | Explicit |
| Calculation complete | Explicit |
| Grade publish | Explicit |
| All POST/PUT/DELETE | Automatic middleware |

---

## 22. Export and Reporting

Server-rendered in exports.ts (673 lines, 29KB):
- PDFKit - Branded PDF with JSW dark blue (#002b63) header
- ExcelJS - Formatted .xlsx with styled tables
- CSV - RFC-compliant with proper escaping

### Formats

| Entity | PDF | Excel | CSV |
| --- | --- | --- | --- |
| Calculations | Yes | Yes | Yes |
| Metals | No | Yes | Yes |
| Grades | No | Yes | Yes |
| Raw Materials | No | Yes | Yes |
| Audit Logs | No | Yes | Yes |
| Reports | Yes | Yes | No |

Limit: 500 records per export.

---

## 23. Testing

| Layer | Framework | Location |
| --- | --- | --- |
| Frontend Unit | Vitest + RTL | apps/frontend/src/pages/*.test.tsx |
| Backend Unit | Vitest | apps/backend/src/tests/ |
| E2E | Playwright | e2e/ |

```bash
npm run test                                 # All workspaces
npm run test --workspace @jsw-mcms/backend   # Backend only
npm run test --workspace @jsw-mcms/frontend  # Frontend only
npx playwright test                          # E2E tests
```

---

## 24. Deployment Guide

### Development

```bash
npm install && npm run dev
```

### Docker

```bash
docker compose --profile local up --build   # All containers
docker compose --profile api up --build     # API only
docker compose -f docker-compose.prod.yml up
```

### Production Stack

| Service | Platform | Config |
| --- | --- | --- |
| Frontend | Vercel | apps/frontend/vercel.json |
| Backend | Railway | apps/backend/railway.toml |
| Database | Neon PostgreSQL | ENV variables |

Migrations auto-run in Docker: `npx prisma migrate deploy && node dist/server.js`

Health Checks:
- Backend: GET /api/health every 15s, 5 retries
- Frontend: GET / every 15s, 3 retries

---

## 25. Development Standards

### TypeScript

- Strict mode in all tsconfig.json files
- Shared types in @jsw-mcms/types
- Prisma auto-generated types used directly in services
- Zod schemas validate all external input

### Architecture

- Controllers: HTTP only - parse request, call service, return response
- Services: All business logic, no HTTP objects
- Routes: Wire controllers with middleware
- Middleware: Cross-cutting concerns only

### Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| React components | PascalCase | EnterpriseDataTable.tsx |
| Hooks | camelCase + use prefix | useTableQuery.ts |
| Zustand stores | camelCase + Store | authStore.ts |
| Backend services | camelCase + .service | grade.service.ts |
| DB tables | snake_case (Prisma @@map) | ferro_alloy_master |
| ENV variables | SCREAMING_SNAKE_CASE | JWT_ACCESS_SECRET |

---

## 26. Known Issues

### Security

| Issue | Severity |
| --- | --- |
| Fixed password MCMS@2026 hardcoded in auth.service.ts | Medium - intentional for internal use |
| Access token stored in localStorage | Low - Helmet CSP mitigates XSS risk |
| No refresh token blocklist | Low - short TTL limits exposure |

### Functionality

| Issue | Impact |
| --- | --- |
| Hardcoded fallback prices in ComparisonEngine (lines 89-91) | Incorrect costs for grades without active PriceList entry |
| Dashboard topAlloys partially hardcoded | Analytics chart shows static reference data |
| gstAmount column not separately populated | GST in finalCost but not broken out |

### Technical Debt

| Issue | Impact |
| --- | --- |
| OperationsPages.tsx is 222KB | Hard to maintain; should be split |
| Verbose console.log in auth middleware | Should use structured logging |
| compression package commented out | Response compression disabled |

---

## 27. Roadmap

### Phase 2 - Near-Term

- Per-user hashed passwords
- Redis refresh token blocklist
- Email notifications for grade approvals
- Calculation approval workflow
- Split OperationsPages.tsx into focused files

### Phase 3 - Medium-Term

- Corporate SSO / LDAP integration
- Multi-plant support with per-plant rates
- SAP ERP synchronization
- Mobile-responsive optimization
- Test coverage above 80%

### Enterprise Vision

- Multi-tenant architecture
- Real-time collaborative workspace (WebSocket)
- AI-assisted grade recommendations
- Power BI / Tableau integration
- Automated price data feeds from market sources

---

## 28. Troubleshooting

**"Invalid email or password":** Verify user in profiles table, department column matches form selection, password is MCMS@2026.

**"Access token expired or invalid":** Clear localStorage, verify JWT_ACCESS_SECRET unchanged, log in again.

**Prisma migration fails:**
```bash
psql $DATABASE_URL -c "SELECT 1;"
npx prisma migrate status
```

**"No active master price exists":** Go to /material-rates (COSTING), find the material, Add Price with effectiveFrom = today, active = true.

**Docker container exits immediately:** Run `docker logs mcms-api` and check for missing env vars (DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_ORIGIN).

**Blank page after navigation:** Verify nginx.conf has `try_files $uri $uri/ /index.html;` for SPA routing.

---

## 29. Changelog

### v1.0.0 - June 2026 (Initial Release)

- JWT dual-token authentication with access and refresh token rotation
- Two-department RBAC: COSTING_DEPARTMENT and PDQC
- Material Master: Metals, Raw Materials (Ferro Alloys), Suppliers, Alloys, Price Lists
- Grade lifecycle: DRAFT to SUBMITTED to PUBLISHED with GradeVersion snapshots and GradeHistory
- Grade Builder: 6-section specification form with material composition builder
- Calculation Workspace: 4 modes (Metal, Raw Material, Alloy, Grade Builder) with decimal.js precision arithmetic
- Immutable snapshot locking on calculation completion
- Grade Comparison Engine: similarity score, recommendation score, JSON variance analysis, 5-min in-memory cache
- Reports: cost summary, trends, top alloys, status breakdown, price history
- Server-side export: PDF (PDFKit), Excel (ExcelJS), CSV for all major entities
- Dual-layer audit logging: automatic middleware and explicit service-level
- In-app notification system with LOW/MEDIUM/HIGH priority
- User Management for COSTING administrators
- System Settings key/value store with default_gst_rate key
- Global cross-entity search
- Bulk CSV/Excel import for metals, grades, prices, ferro alloys
- Docker deployment: Nginx SPA, Vercel frontend, Railway backend, Neon PostgreSQL
- 25+ PostgreSQL tables with comprehensive Prisma schema and composite index strategy

---

## 30. Contributors

| Field | Detail |
| --- | --- |
| Author | Ishan Joshi |
| Role | Intern - Software Development |
| Organization | JSW Steel |
| Project Duration | Internship Start to June 2026 |
| Scope | Full-stack: React 19, Express 5, TypeScript, PostgreSQL/Prisma, Docker, JWT, RBAC, PDF/Excel |

---

## 31. License

**Proprietary - All Rights Reserved**

Developed during an internship at JSW Steel. All intellectual property rights retained by JSW Steel and/or the author per internship agreement. Not open source. Redistribution without written permission is prohibited.

---

## 32. Appendix

### Glossary

| Term | Definition |
| --- | --- |
| MCMS | Metal Cost Management System |
| Grade | Steel product specification with mechanical, chemical, commercial properties |
| Ferro Alloy | Metal alloy of iron + other elements; raw material in steel production |
| Multiplier | Grade cost factor: cost = qty x price x multiplier + extraPrice |
| Batch ID | Calculation identifier: BATCH-XXXXXXXX |
| Snapshot | Immutable JSON capturing state at a point in time |
| COSTING | Costing Department - full system access |
| PDQC | Product Development and Quality Control - limited access |
| INR | Indian Rupee - default currency for all calculations |

### Abbreviations

| Abbreviation | Meaning |
| --- | --- |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| ORM | Object-Relational Mapper |
| SPA | Single Page Application |
| UUID | Universally Unique Identifier |
| TTL | Time To Live |
| UTS | Ultimate Tensile Strength |
| CSP | Content Security Policy |
| HSTS | HTTP Strict Transport Security |

### Key File Size Reference

| File | Size |
| --- | --- |
| OperationsPages.tsx | 222KB |
| WorkspacePage.tsx | 63KB |
| ReportsPage.tsx | 64KB |
| LandingPage.tsx | 58KB |
| CalculationCard.tsx | 50KB |
| RawMaterialTable.tsx | 49KB |
| GradeEditor.tsx | 49KB |
| csvImport.service.ts | 42KB |
| exports.ts (routes) | 29KB |
| EnterpriseDataTable.tsx | 27KB |
| schema.prisma | 22KB (613 lines) |

### Tech References

| Resource | URL |
| --- | --- |
| Prisma | https://www.prisma.io/docs |
| TanStack Query | https://tanstack.com/query/latest |
| React Router v7 | https://reactrouter.com/home |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| Express 5 | https://expressjs.com/en/5x/api.html |
| Zustand | https://zustand.docs.pmnd.rs |
| Zod | https://zod.dev |
| decimal.js | https://mikemcl.github.io/decimal.js/ |
| Neon PostgreSQL | https://neon.tech/docs |
| Railway | https://docs.railway.app |
| Vercel | https://vercel.com/docs |

---


**JSW Metal Cost Management System - Enterprise Industrial Costing Platform**
*Developed for JSW Steel - 2026*

