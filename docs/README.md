# 📚 JSW STEEL MCMS DOCUMENTATION PORTAL & REPOSITORY DIRECTORY
## Project Name: Metal Cost Management System (MCMS)
### Client: JSW Steel
**Document Version:** 1.0.0  
**Date:** May 31, 2026  
**Target Environment:** Centralized Web Platform Monorepo

---

## 🏛️ Welcome to the MCMS Documentation Hub

Welcome to the central documentation directory for the **JSW Metal Cost Management System (MCMS)**. This portal coordinates the full suite of product requirements, technical blueprints, architecture designs, security parameters, and deployment specs created for JSW Steel's metallurgical cost-modeling division.

To ensure consistency and simplify onboarding for engineers, designers, administrators, and auditors, **all documents must be maintained and navigated in the precise structural order detailed below.**

---

## 🗺️ Authoritative Documentation Tree

Select a document link below to open its comprehensive technical specifications:

```text
docs/
├── 1.  PRD.md                     <─── Product Requirements & Bounded Business Scope
├── 2.  TRD.md                     <─── Technical Architectures & Monorepo Code blueprints
├── 3.  app-flow.md                <─── End-to-End User Journeys & Mermaid Flowcharts
├── 4.  ui-ux-design-brief.md      <─── Spacing Grid Tokens, Visual styles & Components Library
├── 5.  implementation-plan.md     <─── 16-Week Roadmap Sprints & RACI Responsibility Matrices
├── 6.  architecture.md            <─── Clean Architecture Layers & DB Connection pooling
├── 7.  database.md                <─── PostgreSQL table structures & Snapshot schemas
├── 8.  api.md                     <─── REST Request/Response JSON payloads specifications
├── 9.  rbac.md                    <─── User Role clearances & Router Access middlewares
├── 10. security.md                <─── Zero-trust JWT tokens & network headers configurations
├── 11. deployment.md              <─── Vercel edge delivery & Railway multi-stage Alpine Docker
├── 12. testing.md                 <─── Unit, Integration, Playwright E2E & k6 testing plans
└── README.md                      <─── (YOU ARE HERE) Documentation Hub Entry-point Map
```

---

## 📂 Structural Directory Mapping & File Overviews

---

### 📘 1. [Product Requirements Document (PRD)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/PRD.md)
*   **Target Audience:** Product Managers, Enterprise Stakeholders, Internship Reviewers.
*   **Core Purpose:** Defines the high-level business problem, operational objectives, and bounded functional scope of the cost calculator (explicitly excluding general ERP, billing, and inventory tracking modules).
*   **Key Contents:** Detailed user personas, dynamic costing formulas ($Decimal.js$), core functional module mappings, success metrics, and risk assessments.

---

### 📘 2. [Technical Requirements Document (TRD)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/TRD.md)
*   **Target Audience:** Software Architects, Lead Developers, Future System Maintainers.
*   **Core Purpose:** Translates PRD requirements into technical system parameters, component specs, and database configurations.
*   **Key Contents:** Monorepo package partitions, Zustand global state managers, Axios silent refresh interceptors, and backend multi-stage Alpine containerization scripts.

---

### 📘 3. [Application Flow Document (app-flow.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/app-flow.md)
*   **Target Audience:** Frontend Developers, QA Automation Engineers, UI Designers.
*   **Core Purpose:** Provides visual sequence charts and process flows detailing every interactive lifecycle within the web shell.
*   **Key Contents:** 8 Mermaid diagrams mapping application launch routines, debounced cost evaluations, reports compilations, and real-time Server-Sent Events (SSE) notification streams.

---

### 📘 4. [UI/UX Design Brief (ui-ux-design-brief.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/ui-ux-design-brief.md)
*   **Target Audience:** UI/UX Designers, Frontend Developers, Product Designers.
*   **Core Purpose:** Establishes the corporate visual identity, styling style tokens, layout patterns, and atomic component libraries for the platform.
*   **Key Contents:** JSW corporate brand blue palette standards, Inter typography mappings, 8px layout grid scales, and WCAG 2.1 AA accessibility guidelines.

---

### 📘 5. [Project Implementation Plan (implementation-plan.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/implementation-plan.md)
*   **Target Audience:** Project Managers, Agile Scrum Teams, Internship Evaluators.
*   **Core Purpose:** Serves as the master execution blueprint, dividing implementation tasks across bi-weekly sprint boundaries.
*   **Key Contents:** Comprehensive Gantt timeline charts, 8-sprint roadmaps (Weeks 1 to 16), detailed RACI responsibility matrices, deliverables schedules, and risk mitigation registers.

---

### 📘 6. [System Architecture Specification (architecture.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/architecture.md)
*   **Target Audience:** Systems Administrators, DevOps Specialists, Database Engineers.
*   **Core Purpose:** Details the logical backend service layers and data transmission patterns that isolate business logic from server frameworks.
*   **Key Contents:** Flow diagrams mapping routes, controllers, services, repositories, and Prisma ORM client structures, alongside database transaction pool management details.

---

### 📘 7. [Database Design Document (database.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/database.md)
*   **Target Audience:** Database Administrators (DBAs), Backend Developers, Financial Compliance Auditors.
*   **Core Purpose:** Documents the relational PostgreSQL schema and mathematical fields mapping.
*   **Key Contents:** Database ER diagram, table-by-table column type constraints (DECIMAL precision mapping), composite performance indices, and locked transaction snapshot data structures.

---

### 📘 8. [API Reference Manual (api.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/api.md)
*   **Target Audience:** Backend Developers, Frontend Developers, QA Automation Teams.
*   **Core Purpose:** Serves as the authoritative endpoint guide detailing input-output JSON structures for all REST routes.
*   **Key Contents:** Exact JSON requests, responses, status codes, and Zod validator constraints for login, master tables CRUD, calculations workspace, and system audit logs.

---

### 📘 9. [Role-Based Access Control Specification (rbac.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/rbac.md)
*   **Target Audience:** Security Leads, QA Testers, Backend Developers.
*   **Core Purpose:** Outlines security partitions that keep users restricted to their authorized domains.
*   **Key Contents:** Explicit role descriptions (Admin, Procurement Specialist, Finance Controller, Production Engineer), authorization tables, and custom `authorizeRoles` Express middleware configurations.

---

### 📘 10. [Security Hardening Specifications (security.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/security.md)
*   **Target Audience:** Infrastructure Engineers, Cloud Administrators, Security Leads.
*   **Core Purpose:** Documents application hardening controls, threat mitigations, and network configurations.
*   **Key Contents:** Stateless token structures, cookie security flags, Helmet headers configs, SQL injection sanitization filters, rate limiting budgets, and environment secret managers.

---

### 📘 11. [Deployment & Hosting Specification (deployment.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/deployment.md)
*   **Target Audience:** DevOps Engineers, Release Coordinators, Infrastructure Teams.
*   **Core Purpose:** Documents the containerization pipelines and production cloud hosting environments.
*   **Key Contents:** Vercel edge delivery configurations, Railway Docker multi-stage build workflows, Neon PostgreSQL cloud parameters, and self-hosted Nginx reverse proxy specifications.

---

### 📘 12. [QA & Testing Specification (testing.md)](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/testing.md)
*   **Target Audience:** QA Testers, Automation Leads, CI/CD Pipeline Developers.
*   **Core Purpose:** Outlines quality validation processes, coverage baselines, and test examples.
*   **Key Contents:** Unit tests with Vitest, API integration tests with Supertest, browser end-to-end sessions with Playwright, and load tests with k6.

---

## 📈 5. Maintenance & Compliance Standards

To keep MCMS documentation accurate and helpful:
1.  **Strict File Reference:** Do not rename or reorganize files unless this directory portal is updated concurrently.
2.  **Continuous Updates:** If database models (`schema.prisma`) or REST endpoints are modified, developers must update `database.md` and `api.md` as part of the commit, keeping documentation in sync with codebase updates.
3.  **Visual Alignment:** Architectural charts must be kept clean, utilizing standard Mermaid layout tools.
