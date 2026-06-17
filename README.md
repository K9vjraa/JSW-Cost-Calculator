# JSW Metal Cost Management System (MCMS)
# 🏭 JSW Metal Cost Management System (MCMS)

## Overview

The Metal Cost Management System (MCMS) is an enterprise-grade web application developed for JSW Steel to streamline and standardize metal costing operations across departments.

The system replaces traditional spreadsheet-driven calculations with a centralized, secure, and auditable platform that enables accurate metal cost estimation, alloy composition analysis, grade management, reporting, and comparison workflows.

MCMS is designed to support industrial costing processes by providing real-time calculations, master-controlled pricing, historical tracking, role-based access control, and future ERP integration capabilities.

---

# 🎯 Business Problem

In traditional costing workflows:

* Metal prices are maintained across multiple spreadsheets.
* Grade calculations are manually performed.
* Historical records are difficult to trace.
* Multiple versions of calculations exist.
* Human calculation errors can impact costing accuracy.
* Reporting and comparisons require significant manual effort.

These challenges result in:

* Increased costing time
* Data inconsistencies
* Limited auditability
* Reduced operational efficiency

MCMS addresses these issues by centralizing the entire costing workflow into a single platform.

---

# 🎯 Project Objectives

The primary objectives of MCMS are:

### Cost Optimization

* Reduce manual costing effort.
* Improve estimation accuracy.
* Standardize costing methodologies.

### Operational Efficiency

* Accelerate cost calculation workflows.
* Simplify grade creation and analysis.
* Improve report generation speed.

### Data Governance

* Centralize pricing information.
* Maintain audit trails.
* Control access through RBAC.

### Future Scalability

* ERP integration readiness.
* Multi-plant support.
* Advanced analytics support.

---

# 🔐 Department-Based Access Control (RBAC)

The system currently supports two operational departments.

---

## 🔴 Costing Department (Administrator)

The Costing Department serves as the primary administrative authority of the platform.

### Access Rights

#### User Management

* Create Users
* Edit Users
* Deactivate Users
* Reset Passwords
* Assign Departments

#### System Administration

* Manage Roles
* Configure Permissions
* Manage Notifications
* Access Audit Logs
* Configure System Settings

#### Master Data Management

* Metal Master
* Grade Master
* Price Master
* Material Database

#### Cost Management

* Full Calculation Workspace Access
* Grade Builder Management
* Cost Comparison Engine
* Reporting & Analytics

#### Exports

* PDF Reports
* Excel Reports
* CSV Exports

---

## 🔵 PDQC Department

The PDQC Department focuses on costing operations, quality-related calculations, and analysis.

### Access Rights

#### Workspace

* Dashboard Access
* Calculation Workspace
* Grade Builder
* Comparison Module

#### Reporting

* Generate Reports
* Export Calculations
* View Historical Records

#### Analysis

* Grade Comparison
* Material Analysis
* Cost Analysis

### Restrictions

PDQC users cannot:

* Create or modify users
* Change permissions
* Access audit administration
* Configure system settings
* Manage master pricing

---

# 👥 Demo Accounts

| Department         | Email                                               | Role          |
| ------------------ | --------------------------------------------------- | ------------- |
| Costing Department | [admin@jsw-mcms.local](mailto:admin@jsw-mcms.local) | Administrator |
| PDQC Department    | [pdqc@jsw-mcms.local](mailto:pdqc@jsw-mcms.local)   | Standard User |

---

# 🧮 Core Modules

## 1. Dashboard System

### Admin Dashboard

Provides:

* Total Calculations
* Active Users
* Grade Statistics
* Cost Trends
* Recent Activities
* System Analytics

### User Dashboard

Provides:

* Personal Calculations
* Recent Activities
* Notifications
* Cost Trends
* Quick Actions

---

## 2. Calculation Workspace

The central module of MCMS.

### Features

* Multi-Metal Calculator
* Alloy Cost Analysis
* Dynamic Material Costing
* Real-Time Summary Panel
* Historical Cost Tracking
* Export Support

### Capabilities

* Quantity-Based Calculations
* Grade-Based Costing
* Material Breakdown
* Cost Comparison

---

## 3. Grade Builder

Integrated directly within the Calculation Workspace.

### Functions

* Create New Grades
* Define Material Composition
* Assign Material Percentages
* Configure Cost Multipliers
* Analyze Grade Cost

### Benefits

* Standardized Grade Creation
* Faster Cost Analysis
* Reusable Grade Templates

---

## 4. Metal Master

Central repository for metal information.

### Manage

* Metals
* Categories
* Material Properties
* Pricing References
* Historical Records

---

## 5. Comparison Engine

Allows side-by-side comparison of:

* Metals
* Grades
* Material Compositions
* Cost Structures

### Features

* Dynamic Tables
* Difference Highlighting
* Export Support
* Interactive Analysis

---

## 6. Reporting Module

Generate:

* Cost Reports
* Grade Reports
* Historical Reports
* Comparison Reports

### Export Formats

* PDF
* Excel
* CSV

---

## 7. Audit Logging

Tracks:

* User Logins
* Calculations
* Data Changes
* Administrative Activities

Benefits:

* Accountability
* Traceability
* Compliance

---

# 🏛 System Architecture

```text
Frontend (React + TypeScript)
            │
            ▼
REST API Layer
            │
            ▼
Node.js + Express Backend
            │
            ▼
Prisma ORM
            │
            ▼
PostgreSQL / Supabase
```

---

# 💻 Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Zustand
* TanStack Query

## Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Zod Validation

## Database

* PostgreSQL
* Prisma ORM
* Supabase

## DevOps

* Docker
* Docker Compose
* GitHub
* CI/CD Pipelines

---

# 🚧 Current Development Status

### Completed

✅ Authentication System

✅ Department-Based RBAC

✅ Dashboard Framework

✅ Cost Calculation Engine

✅ Database Architecture

✅ Reporting Foundation

✅ Docker Setup

### In Progress

🔄 Grade Builder Enhancements

🔄 Advanced Comparison Engine

🔄 Workspace Improvements

🔄 Performance Optimization

### Planned

📌 ERP Integration

📌 Workflow Automation

📌 Advanced Analytics

📌 AI-Assisted Cost Recommendations

📌 Multi-Plant Support

---

# 🔮 Future Roadmap

### Phase 1

* Core Costing Platform
* Grade Builder
* Reporting

### Phase 2

* ERP Integration
* Approval Workflow

### Phase 3

* Advanced Analytics
* Forecasting

### Phase 4

* AI Recommendations
* Multi-Plant Deployment

---



[![CI/CD Pipelines](https://img.shields.io/badge/CI%2FCD-Active-blue.svg?style=flat-square&color=003366)](.github/workflows/ci.yml)
[![Build Status](https://img.shields.io/badge/Build-Passing-green.svg?style=flat-square)](https://github.com/jsw-steel/mcms)
[![Test Coverage](https://img.shields.io/badge/Tests-5%2F5%20Passed-brightgreen.svg?style=flat-square)](docs/setup.md#testing-suites)
[![Node Version](https://img.shields.io/badge/Node-v22.x-brightgreen.svg?style=flat-square&color=green)](package.json)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2FNeon-blue.svg?style=flat-square&color=0080FF)](apps/backend/prisma/schema.prisma)

JSW Metal Cost Management System (MCMS) is a focused, enterprise-grade costing and matrix comparison platform built for JSW Steel. It centralizes master-locked metal pricing, alloy cost modeling, comparison matrices, transaction logging, and auditable role-based access to safeguard and optimize raw material estimates.

---

## 📘 Enterprise Engineering Documentation Suite

To onboard new developers, review architectural decisions, or check production deployment checklists, consult our dedicated guides:

| Guide / Specification | Scope & Core Focus | File Path |
| :--- | :--- | :--- |
| **🚀 Developer Setup Guide** | Local workspace installation, database seeding, test runners, and troubleshooting. | [docs/setup.md](docs/setup.md) |
| **🗂️ Workspace Directory Map** | Full folder layout and component responsibilities for the monorepo. | [docs/folder_structure.md](docs/folder_structure.md) |
| **🧮 System Architecture Spec** | Clean architecture layers, data flows, precision costing math formulas, and JSON snapshots. | [docs/architecture.md](docs/architecture.md) |
| **🔌 API Endpoint Registry** | Stateless JWT authentication, master CRUD payloads, calculations preview, and real-time SSE stream events. | [docs/api.md](docs/api.md) |
| **🔒 Role Authorization Matrix** | Definitions and access rights for the four system roles (Admin, Procurement, Finance, Production). | [docs/rbac.md](docs/rbac.md) |
| **☁️ Deployment & Hosting Spec** | Container profiles, Vercel security headers, Railway multi-stage builds, and Nginx proxy rules. | [docs/deployment.md](docs/deployment.md) |

---

## ⚡ Quick Start (Local Development)

If you have already installed the prerequisites (Node.js 22, Git, and PostgreSQL/Docker), launch the local environment in five steps:

1. **Install workspace dependencies**:
   ```powershell
   npm install
   ```

2. **Initialize Environment Configuration**:
   ```powershell
   Copy-Item apps/backend/.env.example apps/backend/.env
   ```

3. **Spin up local PostgreSQL Database**:
   ```powershell
   docker compose up -d db
   ```

4. **Deploy database schemas & seed industrial master data**:
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

5. **Fire up development workspace**:
   ```powershell
   npm run dev
   ```

*   **Client Interface**: `http://localhost:5173/`
*   **API Base**: `http://localhost:4000/api`

> [!NOTE]
> **Diagnostic Mode (Backend Offline)**: The React client features an automatic local fixture fallback. If you run the frontend without starting the database, it will automatically load realistic static dashboard views for visual evaluation.


## 🧮 Costing Calculation Business Rule

All calculations are evaluated using high-precision Decimal math to prevent floating-point rounding errors:

$$\text{ItemBaseCost} = (\text{Quantity} \times \text{LockedUnitPrice} \times \text{GradeMultiplier}) + \text{GradeExtraFee}$$

For a detailed breakdown of formulas, snapshots, and index optimizations, read the [System Architecture Guide](docs/architecture.md).

---

## 🧪 Comprehensive Verification Sweep

To run unit and integration tests across all workspaces:
```powershell
npm run test
```

To compile production bundles for both services:
```powershell
# Compiles backend TypeScript to JS dist
npm run build --workspace @jsw-mcms/backend

# Compiles and bundles client assets via Vite
npm run build --workspace @jsw-mcms/frontend
```
# 🏢 Developed For

JSW Steel

Industrial Costing & Digital Transformation Initiative

---

# 👨‍💻 Author

Ishant Rathore

B.Sc Computer Science

JSW Steel Internship Project

2026
