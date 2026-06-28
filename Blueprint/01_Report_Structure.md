# JSW Internship Report - 01_Report_Structure.md

## Front Matter

- **Title Page** (Page i)
- **Certificate of Authenticity** (Page ii)
- **Declaration of the Student** (Page iii)
- **Acknowledgement** (Page iv)
- **Abstract** (Page v)
- **Table of Contents** (Page vi-vii)
- **List of Figures** (Page viii)
- **List of Tables** (Page ix)
- **List of Diagrams** (Page x)
- **List of Abbreviations / Glossary** (Page xi-xii)

---

## 1. Table of Contents & Hierarchical Structure

### Chapter 1: Introduction
- 1.1 Project Context and Background (Page 1)
- 1.2 Purpose of the Document (Page 3)
- 1.3 Target Audience and Roles (Page 4)
  - 1.3.1 Costing Department (COSTING)
  - 1.3.2 Product Development & Quality Control (PDQC)
  - 1.3.3 Departmental Usage Distribution
- 1.4 Document Outline (Page 5)
- 1.5 Chapter Summary (Page 6)

### Chapter 2: Organization Profile (JSW Steel)
- 2.1 Overview of JSW Group (Page 7)
- 2.2 JSW Steel: The Flagship Enterprise (Page 8)
- 2.3 Strategic Vision and Industry 4.0 Digitalization (Page 9)
- 2.4 Digital Transformation Wing and My Internship Role (Page 10)
- 2.5 JSW Steel Core Business and Metallurgical Focus (Page 11)
- 2.6 Chapter Summary (Page 11)

### Chapter 3: Problem Statement & Objectives
- 3.1 Complexity of Metallurgical Costing (Page 12)
  - 3.1.1 Steel Grade Composition Variables
  - 3.1.2 Raw Material Pricing Volatility
- 3.2 Identification of Core Business Pain Points (Page 14)
- 3.3 Core Objectives of the MCMS Platform (Page 15)
  - 3.3.1 Primary Financial & Mathematical Objectives
  - 3.3.2 Secondary Operational & Analytical Objectives
- 3.4 System Boundaries and Repository Architecture (Page 16)
- 3.5 Chapter Summary (Page 17)

### Chapter 4: Existing System Analysis
- 4.1 Overview of the Legacy Manual Process (Page 18)
- 4.2 Data Flow and Structure of Legacy Spreadsheets (Page 19)
- 4.3 Technical Limitations of the Legacy System (Page 20)
  - 4.3.1 Lack of Relational Constraints & Data Duplication
  - 4.3.2 Concurrency Issues & Document Lockouts
  - 4.3.3 Data Mutation without Historical Snapshots
- 4.4 Process Bottlenecks & Inter-Departmental Delays (Page 22)
- 4.5 System Context & Legacy Data Flow Diagram (DFD Level 0) (Page 23)
- 4.6 Chapter Summary (Page 23)

### Chapter 5: Proposed System (MCMS)
- 5.1 Vision, Design Philosophy & "Source of Truth" (Page 24)
- 5.2 Key Functional Pillars of MCMS (Page 25)
  - 5.2.1 Centralized Relational Master Data
  - 5.2.2 Server-Side Arbitrary-Precision Calculation Engine
  - 5.2.3 Immutable JSON Historical Snapshots
  - 5.2.4 Role-Based Access Control (RBAC) Perimeter
  - 5.2.5 Interactive Grade Comparison Module
- 5.3 Business Workflow of the Proposed System (Page 27)
- 5.4 Data Flow and Architecture Transition (Page 28)
  - 5.4.1 Proposed System Context Diagram
  - 5.4.2 Proposed DFD Level 1 (Module Data Flows)
- 5.5 Feasibility Analysis Summary (Page 29)
- 5.6 Chapter Summary (Page 30)

### Chapter 6: Requirement Analysis
- 6.1 Functional Requirements (FR) Specification (Page 31)
  - 6.1.1 FR-01: Authentication & Session Management
  - 6.1.2 FR-02: Role Enforcement & UI Adaptation
  - 6.1.3 FR-03: Arbitrary-Precision Cost Calculation Engine
  - 6.1.4 FR-04: Grade Builder & Versioning
  - 6.1.5 FR-05: Multi-Grade Comparison Matrix
  - 6.1.6 FR-06: Document Generation & Export
- 6.2 Non-Functional Requirements (NFR) Specification (Page 34)
  - 6.2.1 NFR-01: Precision & Rounding Enforcement
  - 6.2.2 NFR-02: API & UI Performance Latencies
  - 6.2.3 NFR-03: Security & OWASP Top 10 Mitigation
  - 6.2.4 NFR-04: Reliability, Availability & Service SLAs
- 6.3 Business Rules and Metallurgical Constraints (BR) (Page 36)
  - 6.3.1 BR-01: Calculation State Immutability
  - 6.3.2 BR-02: Orphan Record Deletion Constraints
  - 6.3.3 BR-03: Currency Standardization & Multi-currency Boundaries
- 6.4 Grade Lifecycle State Transitions (Page 37)
- 6.5 Chapter Summary (Page 38)

### Chapter 7: System Architecture & Design
- 7.1 Multi-Tier Client-Server Architecture Overview (Page 39)
- 7.2 Monorepo Workspace Organization (Page 40)
- 7.3 Presentation Tier Design (React Frontend) (Page 41)
  - 7.3.1 Component Architecture Hierarchy
  - 7.3.2 State Management Design (Zustand & TanStack Query)
- 7.4 Application Tier Design (Node.js/Express Backend) (Page 44)
  - 7.4.1 Request-Response Lifecycle & Controller Services
  - 7.4.2 Mathematical Calculation Engine Architecture
- 7.5 Persistence Tier Design (Prisma ORM Layer) (Page 46)
- 7.6 System Class Diagram and Interaction Model (Page 47)
- 7.7 Chapter Summary (Page 48)

### Chapter 8: Relational Database Design
- 8.1 Schema Design Principles & Normalization (3NF) (Page 49)
- 8.2 Database Entity Relationship Diagram (ERD) (Page 50)
- 8.3 Detailed Table Schema & Column Specifications (Page 51)
  - 8.3.1 `User` & `Profile` Schemas
  - 8.3.2 `Metal` & `Grade` Schemas
  - 8.3.3 `RawMaterial` (Ferro-Alloy Master) & `PriceHistory` Schemas
  - 8.3.4 `Calculation` & `CalculationItem` Schemas
  - 8.3.5 `AuditLog` Schema
- 8.4 Constraints, Foreign Keys & Cascading Strategy (Page 54)
- 8.5 Database Indexing Strategy for Latency Optimization (Page 55)
- 8.6 Prisma Schema Structure and Generation (Page 56)
- 8.7 Chapter Summary (Page 56)

### Chapter 9: API Design & Security Architecture
- 9.1 RESTful API Endpoint Definitions (Page 57)
- 9.2 Request Lifecycle & Security Middleware Chain (Page 58)
- 9.3 Detailed Endpoint Contracts (Page 59)
  - 9.3.1 Authentication Routes (`/api/auth`)
  - 9.3.2 Calculation Routes (`/api/calculations`)
  - 9.3.3 Master Data Routes (`/api/materials`, `/api/grades`)
  - 9.3.4 Comparison Routes (`/api/comparison`)
- 9.4 Dual-Token JWT Authentication & HttpOnly Session Management (Page 62)
- 9.5 Role-Based Access Control (RBAC) Enforcement (Page 63)
- 9.6 Application Layer Hardening (Helmet, Rate Limiting, CORS) (Page 64)
- 9.7 Chapter Summary (Page 66)

### Chapter 10: Testing & Quality Assurance
- 10.1 QA Methodology and Code Coverage Standards (Page 67)
- 10.2 Unit and Integration Testing (Vitest) (Page 68)
  - 10.2.1 Calculation Engine Logic Verification
  - 10.2.2 JWT Payload & Security Interceptor Verification
- 10.3 End-to-End User Flow Testing (Playwright) (Page 70)
- 10.4 Test Case Matrix and Results Summary (Page 72)
- 10.5 High-Concurrency Load & Stress Testing Benchmarks (Page 75)
- 10.6 User Acceptance Testing (UAT) Feedback Integration (Page 76)
- 10.7 Chapter Summary (Page 76)

### Chapter 11: Deployment & DevOps Strategy
- 11.1 Multi-Stage Docker Containerization Strategy (Page 77)
  - 11.1.1 Frontend Static NGINX Image Builder
  - 11.1.2 Backend Production Image Optimizations
- 11.2 Production Hosting Infrastructure Layout (Vercel, Railway, Neon) (Page 79)
- 11.3 CI/CD Automation Pipelines (GitHub Actions) (Page 81)
- 11.4 Database Backup, Disaster Recovery & Script-Based Rollbacks (Page 82)
- 11.5 Chapter Summary (Page 84)

### Chapter 12: Results, Future Scope, and Conclusion
- 12.1 Quantifiable Business Performance Metrics Improvements (Page 85)
  - 12.1.1 Cost Calculation Speed (Velocity Delta)
  - 12.1.2 Human Error Rate Reduction Metrics
  - 12.1.3 Inter-Departmental Collaboration Efficiency
- 12.2 Qualitative Impact on Governance and Audits (Page 87)
- 12.3 Short-Term Post-Deployment Enhancement Goals (Page 89)
- 12.4 Long-Term Vision: Predictive Machine Learning Cost Engines (Page 90)
- 12.5 Project Conclusion Summary (Page 91)
- 12.6 Chapter Summary (Page 92)

---

## 2. Page and Asset Allocations per Chapter

The total report length budget is structured to target approximately **90–120 pages** (inclusive of Front Matter, Chapters, References, and Appendices).

| Chapter / Section | Page Budget | Estimated Figure Count | Estimated Table Count | Estimated Diagram Count |
| :--- | :---: | :---: | :---: | :---: |
| **Front Matter** | 12 | 0 | 0 | 0 |
| **Ch 1: Introduction** | 6 | 1 | 1 | 1 |
| **Ch 2: Organization Profile (JSW)** | 5 | 1 | 1 | 1 |
| **Ch 3: Problem Statement & Objectives** | 6 | 0 | 1 | 1 |
| **Ch 4: Existing System Analysis** | 6 | 1 | 1 | 1 |
| **Ch 5: Proposed System (MCMS)** | 7 | 0 | 2 | 2 |
| **Ch 6: Requirement Analysis** | 8 | 1 | 3 | 2 |
| **Ch 7: System Architecture & Design** | 10 | 0 | 2 | 3 |
| **Ch 8: Relational Database Design** | 8 | 1 | 5 | 2 |
| **Ch 9: API Design & Security** | 10 | 0 | 3 | 2 |
| **Ch 10: Testing & QA** | 10 | 1 | 5 | 2 |
| **Ch 11: Deployment & DevOps** | 8 | 0 | 2 | 2 |
| **Ch 12: Results & Conclusion** | 8 | 1 | 2 | 2 |
| **References** | 3 | 0 | 0 | 0 |
| **Appendices (A to O)** | 23 | 6 | 8 | 0 |
| **TOTAL** | **122** | **13** | **36** | **21** |

---

## 3. References

The report will strictly adhere to the **IEEE citation style**. Key references will include:
1. JSW Steel internal technical specifications, costing guidelines, and grade compositions.
2. PostgreSQL 16 Official Manuals on transaction levels, indexing, and JSONB optimization.
3. React 19 documentation on component life cycle and concurrent rendering.
4. Node.js & Express 5 framework engineering manuals.
5. Prisma ORM documentation on schema migrations and database connection pooling.
6. OWASP Top 10 Web Application Security Risk compliance guidelines.
7. RFC 7519 Standards on JSON Web Token (JWT) architecture.

---

## 4. Appendices Details

- **Appendix A - User Manual**: Interactive guide for Costing and PDQC users.
- **Appendix B - Administrator Manual**: Configuration protocols, settings, and user onboarding steps.
- **Appendix C - API Documentation**: Absolute API specification including schemas, request-responses, and error states.
- **Appendix D - Database Schema**: The complete declarative `schema.prisma` file.
- **Appendix E - Test Cases**: Comprehensive unit, integration, and E2E test suites logs.
- **Appendix F - Screenshots**: Branded figures detailing the working login, workspace dashboards, comparison tables, and PDF generators.
- **Appendix G - Source Code Structure**: A detailed workspace map of the monorepo.
- **Appendix H - GitHub Repository**: Branching, pull requests, and commit guidelines.
- **Appendix I - Installation Guide**: Local setup steps for developers.
- **Appendix J - Configuration Files**: Example `.env` and configuration templates.
- **Appendix K - PostgreSQL Setup**: Dockerized local instance configurations.
- **Appendix L - Prisma Migration History**: DB migration snapshots.
- **Appendix M - Project Timeline**: Gantt milestones from research to delivery.
- **Appendix N - Daily Internship Work Summary**: Log of milestones achieved.
- **Appendix O - Glossary**: Terms, abbreviations, and engineering acronyms.
