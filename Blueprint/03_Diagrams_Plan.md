# JSW Internship Report - 03_Diagrams_Plan.md

This document serves as the master plan for all visual illustrations, UML specifications, data flows, and system architectures required to complete the JSW Metal Cost Management System (MCMS) Internship Report.

## 1. Summary of Diagrams Plan

| Diagram Title | Chapter | Purpose | Type (Mermaid / UML) | Priority | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **1. High-Level Architecture** | Ch 7: System Architecture | Illustrate the decoupling of presentation, application, and persistence tiers. | Mermaid | Critical | Pending |
| **2. Low-Level Architecture** | Ch 7: System Architecture | Map specific modules, utility packages, API routers, and state stores. | Mermaid | High | Pending |
| **3. Component Diagram** | Ch 7: System Architecture | Define logical component boundaries on the React frontend and Node backend. | UML (Mermaid) | Medium | Pending |
| **4. Deployment Diagram** | Ch 11: Deployment & DevOps | Map the physical runtime topology (Vercel, Railway, Neon, local Docker containers). | UML (Mermaid) | High | Pending |
| **5. ER Diagram** | Ch 8: Database Design | Define the logical relationship constraints between all relational tables. | UML (Mermaid) | Critical | Pending |
| **6. Database Schema Diagram** | Ch 8: Database Design | Map physical table columns, types, unique indices, and keys. | Mermaid | High | Pending |
| **7. Authentication Flow** | Ch 9: API & Security | Map JWT Access/Refresh tokens lifecycle and verification steps. | Mermaid | Critical | Pending |
| **8. API Flow** | Ch 9: API & Security | Depict the Express security middleware validation chain for incoming requests. | Mermaid | High | Pending |
| **9. Cost Calculation Workflow** | Ch 5: Proposed System | Step-by-step logic of compiling raw materials, applying multipliers, and adding tax. | Mermaid | Critical | Pending |
| **10. Material Management Workflow** | Ch 5: Proposed System | Process for price updating, validation, and historical rate creation. | Mermaid | Medium | Pending |
| **11. Grade Builder Workflow** | Ch 5: Proposed System | Step-by-step flow for defining Chemical BOMs and versioning. | Mermaid | High | Pending |
| **12. Comparison Workflow** | Ch 5: Proposed System | Matrix computation logic and delta analysis interface flow. | Mermaid | Medium | Pending |
| **13. Reports Workflow** | Ch 5: Proposed System | Compilation of audit entries and financial summaries for reporting. | Mermaid | Low | Pending |
| **14. Export Workflow** | Ch 5: Proposed System | Server-side file generation and browser download lifecycle for PDF/Excel. | Mermaid | Medium | Pending |
| **15. DFD Level 0** | Ch 4: Existing System | Context diagram of the manual file-based legacy process. | Mermaid | Critical | Pending |
| **16. DFD Level 1** | Ch 5: Proposed System | Detailed data flows between MCMS modules and the PostgreSQL database. | Mermaid | High | Pending |
| **17. Use Case Diagram** | Ch 6: Requirement Analysis | Define functional interactions for COSTING and PDQC roles. | UML (Mermaid) | Critical | Pending |
| **18. Activity Diagram** | Ch 6: Requirement Analysis | Step-by-step execution path of running simulated versus approved costing. | UML (Mermaid) | High | Pending |
| **19. Class Diagram** | Ch 7: System Architecture | Structure of the backend API controllers, repositories, and services. | UML (Mermaid) | Critical | Pending |
| **20. Sequence Diagram** | Ch 9: API & Security | Sequence of events for a transaction authorization check. | UML (Mermaid) | High | Pending |
| **21. Package Diagram** | Ch 7: System Architecture | Architectural layout of packages inside the monorepo workspace. | UML (Mermaid) | Medium | Pending |
| **22. State Diagram** | Ch 6: Requirement Analysis | State-machine transitions for Steel Grades (Draft to Published). | UML (Mermaid) | High | Pending |

---

## 2. Detailed Diagram Specifications

### 2.1 Architectural Diagrams
- **High-Level Architecture**: Depicts the multi-tier client-server split (Client Browser UI -> REST APIs -> Prisma ORM -> PostgreSQL/Neon).
- **Low-Level Architecture**: Drills down into Axios HTTP interceptors, global Zustand store, React Router, Express rate-limit shields, controller route handlers, and database connection pools.
- **Component Diagram**: Shows the logical components (`Button`, `DataTable`, `CalculationWorkspace`, `GradeBuilderForm`) and their dependencies.
- **Deployment Diagram**: Visualizes the production runtime hosts, showing TLS 1.3 encryption boundaries and container partitions.

### 2.2 Database Diagrams
- **ER Diagram**: Captures the relational links among entities like `User`, `Metal`, `Grade`, `RawMaterial`, `PriceHistory`, and `AuditLog`.
- **Database Schema Diagram**: Serves as a physical representation of column constraints, showing primary key (PK) and foreign key (FK) anchors.

### 2.3 Workflow & Data Flow Diagrams
- **DFD Level 0 (Context Diagram)**: Models the legacy system interfaces, illustrating manual supplier price sheets, excel entry, and offline PDF exports.
- **DFD Level 1 (Proposed System)**: Visualizes structured data flows where tokenized client requests are validated, queried, calculated, audited, and cached.
- **Cost Calculation Workflow**: Details the validation of raw compositions, database retrieval of active prices, decimal calculation using `decimal.js`, and finalized snapshot creation.
- **Material Management Workflow**: Outlines how a price mutation triggers soft-deletes of old prices, generation of active prices, and log compilation.
- **Grade Builder Workflow**: Visualizes metallurgical composition checks (preventing duplication and total composition errors > 100%) and version increment routines.
- **Comparison Workflow**: Depicts user selection of up to 5 grades and the server-side delta computation matrix.
- **Reports & Export Workflows**: Shows the queue-and-stream processes for binary PDF/Excel downloads.

### 2.4 UML Specifications
- **Use Case Diagram**: Highlights permission boundaries between administrative costing department agents and read-only PDQC engineers.
- **Activity Diagram**: Outlines workflow paths based on role evaluation and authorization.
- **Class Diagram**: Highlights inheritance, association, and dependency connections between routes, controllers, and database clients.
- **Sequence Diagram**: Traces chronological messages for JWT authorization validation checks.
- **Package Diagram**: Details the monorepo package dependencies (`@jsw-mcms/ui`, `@jsw-mcms/types`, etc.).
- **State Diagram**: Models the state-machine life cycle of a steel grade (`DRAFT` -> `SUBMITTED` -> `APPROVED` -> `PUBLISHED` -> `ARCHIVED`).
