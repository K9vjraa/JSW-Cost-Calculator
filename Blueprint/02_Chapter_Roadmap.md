# JSW Internship Report - 02_Chapter_Roadmap.md

## 1. Writing Progress Dashboard

This progress tracker monitors the writing phase of the JSW Metal Cost Management System (MCMS) Internship Report. It lists page targets, resource/asset targets, completion status, and cross-chapter dependencies.

| Chapter ID & Name | Target Pages | Status | Completion % | Est. Figures | Est. Tables | Est. Diagrams | Est. Screenshots | Dependencies |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Ch 1: Introduction** | 6 | In Progress | 10% | 1 | 1 | 1 | 0 | None |
| **Ch 2: Organization Profile** | 5 | In Progress | 15% | 1 | 1 | 1 | 0 | Corporate Guidelines |
| **Ch 3: Problem Statement** | 6 | In Progress | 10% | 0 | 1 | 1 | 0 | Ch 1 |
| **Ch 4: Existing System** | 6 | In Progress | 15% | 1 | 1 | 1 | 0 | Ch 3 |
| **Ch 5: Proposed System** | 7 | In Progress | 10% | 0 | 2 | 2 | 0 | Ch 4 |
| **Ch 6: Requirement Analysis** | 8 | Pending | 0% | 1 | 3 | 2 | 0 | docs/PRD.md |
| **Ch 7: System Architecture** | 10 | Pending | 0% | 0 | 2 | 3 | 0 | docs/architecture.md |
| **Ch 8: Database Design** | 8 | Pending | 0% | 1 | 5 | 2 | 2 | schema.prisma |
| **Ch 9: API & Security** | 10 | Pending | 0% | 0 | 3 | 2 | 1 | docs/security.md |
| **Ch 10: Testing & QA** | 10 | Pending | 0% | 1 | 5 | 2 | 1 | docs/testing.md |
| **Ch 11: Deployment & DevOps** | 8 | Pending | 0% | 0 | 2 | 2 | 1 | docs/deployment.md |
| **Ch 12: Results & Conclusion** | 8 | Pending | 0% | 1 | 2 | 2 | 0 | Ch 10, Ch 11 |
| **Front Matter & Appendices** | 35 | Pending | 5% | 6 | 8 | 0 | 6 | All Chapters |
| **TOTALS** | **122** | **In Progress** | **6%** | **13** | **36** | **21** | **11** | - |

---

## 2. Chapter-by-Chapter Roadmap Details

### 2.1 Chapter 1: Introduction
- **Estimated Pages**: 6
- **Writing Status**: In Progress (Draft outline completed)
- **Completion %**: 10%
- **Estimated Assets**: 1 Figure, 1 Table, 1 Diagram, 0 Screenshots
- **Dependencies**: None
- **Notes**: Draw timeline details from `MCMS_Project_Report.md`. Incorporate Gantt chart for the project schedule.

### 2.2 Chapter 2: Organization Profile (JSW Steel)
- **Estimated Pages**: 5
- **Writing Status**: In Progress (Core history drafted)
- **Completion %**: 15%
- **Estimated Assets**: 1 Figure, 1 Table, 1 Diagram, 0 Screenshots
- **Dependencies**: JSW Corporate Guidelines & website resources
- **Notes**: Highlight JSW Steel's market position, Vijayanagar plant capacity, and integration of Industry 4.0 digitalization standards.

### 2.3 Chapter 3: Problem Statement & Objectives
- **Estimated Pages**: 6
- **Writing Status**: In Progress (Problem identification drafted)
- **Completion %**: 10%
- **Estimated Assets**: 0 Figures, 1 Table, 1 Diagram, 0 Screenshots
- **Dependencies**: Chapter 1 (Project Context)
- **Notes**: Explain chemical composition variables, alloy volatility, and how they dictate the system's objectives. Detail the monorepo architecture boundary.

### 2.4 Chapter 4: Existing System Analysis
- **Estimated Pages**: 6
- **Writing Status**: In Progress (Legacy spreadsheet pain points identified)
- **Completion %**: 15%
- **Estimated Assets**: 1 Figure, 1 Table, 1 Diagram, 0 Screenshots
- **Dependencies**: Chapter 3 (Problem Statement)
- **Notes**: Provide details of the legacy spreadsheet-based process. Map out the DFD Level 0 context diagram for legacy flows.

### 2.5 Chapter 5: Proposed System (MCMS)
- **Estimated Pages**: 7
- **Writing Status**: In Progress (Architectural vision drafted)
- **Completion %**: 10%
- **Estimated Assets**: 0 Figures, 2 Tables, 2 Diagrams, 0 Screenshots
- **Dependencies**: Chapter 4 (Existing System Analysis)
- **Notes**: Frame the five functional pillars of the new MCMS. Detail the transition DFDs (Context and Level 1 Module Flows). Include feasibility study results.

### 2.6 Chapter 6: Requirement Analysis
- **Estimated Pages**: 8
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 1 Figure, 3 Tables, 2 Diagrams, 0 Screenshots
- **Dependencies**: [PRD.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/PRD.md)
- **Notes**: Document functional requirements (FR-01 to FR-06) and non-functional metrics. Model the Grade Lifecycle State Machine diagram.

### 7.7 Chapter 7: System Architecture & Design
- **Estimated Pages**: 10
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 0 Figures, 2 Tables, 3 Diagrams, 0 Screenshots
- **Dependencies**: [architecture.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/architecture.md), [TRD.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/TRD.md)
- **Notes**: Detail client-server interaction. Render diagrams for high-level structure, frontend component hierarchy, and the overall system class diagram.

### 2.8 Chapter 8: Relational Database Design
- **Estimated Pages**: 8
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 1 Figure, 5 Tables, 2 Diagrams, 2 Screenshots
- **Dependencies**: [schema.prisma](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/apps/backend/prisma/schema.prisma), [database.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/database.md)
- **Notes**: Detail ERD, 3NF layout, constraints, and custom indexing strategy. Screenshots must show direct database views of key tables.

### 2.9 Chapter 9: API Design & Security Architecture
- **Estimated Pages**: 10
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 0 Figures, 3 Tables, 2 Diagrams, 1 Screenshot
- **Dependencies**: [api.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/api.md), [security.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/security.md)
- **Notes**: Outline the REST request lifecycle sequence diagram. Detail dual-token JWT rotation and RBAC route enforcement.

### 2.10 Chapter 10: Testing & Quality Assurance
- **Estimated Pages**: 10
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 1 Figure, 5 Tables, 2 Diagrams, 1 Screenshot
- **Dependencies**: [testing.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/testing.md)
- **Notes**: Provide Vitest unit tests and Playwright E2E coverage results. Include load and stress test benchmark charts.

### 2.11 Chapter 11: Deployment & DevOps Strategy
- **Estimated Pages**: 8
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 0 Figures, 2 Tables, 2 Diagrams, 1 Screenshot
- **Dependencies**: [deployment.md](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/deployment.md)
- **Notes**: Outline the multi-stage Docker deployment architecture. Document automated GitHub Actions pipelines and database disaster recovery scripts.

### 2.12 Chapter 12: Results, Future Scope, and Conclusion
- **Estimated Pages**: 8
- **Writing Status**: Pending
- **Completion %**: 0%
- **Estimated Assets**: 1 Figure, 2 Tables, 2 Diagrams, 0 Screenshots
- **Dependencies**: Chapter 10 & 11
- **Notes**: Highlight quantifiable metrics (calculation speed, error reduction) and state-machine improvements. Frame short-term and long-term future scope (AI/ML forecasting models).
