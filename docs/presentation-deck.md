# JSW MCMS Presentation Deck & Q&A Package

This document contains the 15-slide presentation structure, speaker notes, and common panel Q&A preparation for the JSW Metal Cost Management System (MCMS) internship project review.

---

## Part 1: Slide-by-Slide Outline

### Slide 1: Title Slide

* **Title**: JSW Metal Cost Management System (MCMS)
* **Subtitle**: Streamlining Enterprise Cost Calculations, Auditing, and Approvals
* **Visuals**: Modern JSW branded banner, project logo, intern credentials, and internship details.
* **Speaker Notes**:
  > "Good morning to the review panel. Today, I am presenting the JSW Metal Cost Management System (MCMS), developed during my internship project. This system addresses critical challenges in metal costing estimation, price revisions, and compliance auditing in our manufacturing operations."

---

### Slide 2: Context & Problem Statement

* **Title**: Context & Key Challenges
* **Visuals**: Flow diagram comparing manual spreadsheet costing against centralized database calculation inputs.
* **Key Bullets**:
  * Cost estimation currently relies on disconnected spreadsheets.
  * Lack of standard RBAC: No clear separation between cost estimation and final approvals.
  * Difficulty tracking historic price fluctuations (e.g., steel, niobium, manganese).
  * Incomplete audit trail: High risk of undetected modifications to cost calculations.
* **Speaker Notes**:
  > "Before this project, costing calculations were scattered across multiple spreadsheets. This introduced risks of formula errors, lacked validation workflows, and made it difficult to audit changes. MCMS centralizes this process to enforce standard workflows and security."

---

### Slide 3: Objectives & Scope

* **Title**: Project Scope & Goals
* **Visuals**: A grid highlighting: Accuracy, Compliance, Speed, and Extensibility.
* **Key Bullets**:
  * Centralize calculation rules for steel grades conforming to IS/EN standards.
  * Implement Role-Based Access Control (RBAC) to separate creation and approvals.
  * Record immutable audit trails for all sensitive operations (e.g., price updates, approvals).
  * Automate report exports (PDF and Excel) matching JSW formatting.
* **Speaker Notes**:
  > "Our main goal was to deliver a production-ready application that ensures costing accuracy, guarantees security through RBAC, and logs every activity to a secure, queryable audit log."

---

### Slide 4: Technology Stack

* **Title**: Technical Architecture Overview
* **Visuals**: 3-Tier architecture diagram (React Frontend ↔ Express Node.js API ↔ PostgreSQL/Prisma).
* **Key Bullets**:
  * **Frontend**: React (Vite), Zustand (state management), Vanilla CSS (custom design system).
  * **Backend**: Node.js, Express.js (REST API), TypeScript.
  * **Database**: PostgreSQL (relational model), Prisma ORM (migrations & queries).
  * **Security**: JWT Authentication (Access + Refresh tokens), bcrypt password hashing.
* **Speaker Notes**:
  > "We selected a modern, highly performant TypeScript stack. React powers our interactive frontend; Node/Express serves our REST API; PostgreSQL handles our relational data; and Prisma ORM manages type-safe data access."

---

### Slide 5: Database Schema & Relational Design

* **Title**: Relational Database Design (ERD)
* **Visuals**: Simplified ERD block displaying connections between User, Role, Metal, Grade, PriceList, Calculation, and AuditLog.
* **Key Bullets**:
  * Normalized tables for Metals, Grades, Raw Materials, and Suppliers.
  * One-to-many relationship from Users to Calculations.
  * Normalized tables for Grade properties (Mechanical & Chemical specifications).
  * Separate audit log table tracking system events.
* **Speaker Notes**:
  > "Our database schema is highly normalized to handle industrial specifications. We track metals, grades, suppliers, and prices separately, linking them dynamically during calculations. This prevents data duplication and keeps prices consistent."

---

### Slide 6: The Cost Calculation Engine

* **Title**: The Calculation Workflow
* **Visuals**: Block diagram of the formula logic.
* **Key Bullets**:
  * Core Costing Formula:
    $$\text{Final Cost} = \left[ \sum (\text{Component Price} \times \text{Composition \%}) \times \text{Grade Multiplier} + \text{Extra Price} \right] \times \text{Batch Qty} \times (1 + \text{GST \%})$$
  * Multipliers based on standard grades (e.g., IS 2062 multiplier of 1.00x vs 1.08x for IS 2062 E350C).
  * Real-time calculation on backend to prevent client-side tampering.
* **Speaker Notes**:
  > "The core engine runs entirely on the backend for safety. It calculates costs by combining active metal prices, composition metrics, grade multipliers, processing fees, batch size, and tax slabs. This ensures calculation consistency."

---

### Slide 7: Authentication & RBAC Flow

* **Title**: Access Security & Role Hierarchy
* **Visuals**: Security flow diagram showing token validation and endpoint protection middleware.
* **Key Bullets**:
  * Secure JWT authentication with short-lived (15 min) access tokens.
  * Refresh token rotation for extended sessions.
  * Three predefined roles: ADMIN, EMPLOYEE, USER.
  * Backend route middleware enforcing role validation on sensitive API paths.
* **Speaker Notes**:
  > "Security is implemented at the core. We use JSON Web Tokens with automatic refresh rotations. Role-based checks prevent regular users or cost engineers from modifying pricing databases or approving their own calculations."

---

### Slide 8: Interactive Calculator Workspace

* **Title**: Calculator Workspace
* **Visuals**: Carousel / Layout screenshot showing the alloy composition input fields.
* **Key Bullets**:
  * Seamless input workspace for composition percentages.
  * Dynamic validation: Composition totals must equal exactly 100%.
  * Live calculations showing instant price breakdowns.
  * Multi-stage saving: Draft status vs Submitted status.
* **Speaker Notes**:
  > "The Calculator Workspace is designed for ease of use. It validates composition parameters as the user types, ensuring compositions sum to 100%. Users can save calculations as drafts or submit them directly for manager review."

---

### Slide 9: Multi-Stage Approval Workflow

* **Title**: Enforcing Dual-Authorization Gates
* **Visuals**: State transition diagram: Draft ➔ Submitted ➔ Approved ➔ Completed.
* **Key Bullets**:
  * Cost engineers submit worksheets, changing status to SUBMITTED.
  * Managers review sheets on their dashboard queue.
  * Approval locks calculations, making them immutable.
  * Audit logs capture approval comments, user details, and timestamp.
* **Speaker Notes**:
  > "MCMS implements a clear approval gate. Once submitted, calculations cannot be edited. A manager must review, comment on, and approve the worksheet before it can be exported, creating a clear chain of custody."

---

### Slide 10: Pricing Master & Historic Trends

* **Title**: Raw Material Price Management
* **Visuals**: Line chart or table representing historical steel price changes.
* **Key Bullets**:
  * Centralized price database with effective dates.
  * Batch pricing update interface for admins.
  * Automated history logging: Whenever a metal price changes, the system logs the old price, new price, and reason.
* **Speaker Notes**:
  > "Market prices fluctuate constantly. MCMS allows administrators to update the pricing master, automatically archiving old prices in the PriceHistory table. This allows us to track material price trends over time."

---

### Slide 11: Export & Reporting Modules

* **Title**: JSW Standardized Reports
* **Visuals**: Mini representation of a corporate PDF report.
* **Key Bullets**:
  * Dynamic PDF generation with custom layout structures.
  * Export options for Excel and PDF formats.
  * Contains system verification tags, calculation ids, and signature fields.
* **Speaker Notes**:
  > "Approved calculations can be exported to Excel and PDF formats. These reports follow JSW styling guidelines and include calculation hashes, approval tracking details, and detailed cost breakdowns."

---

### Slide 12: Enterprise System Auditing

* **Title**: Immutable System Audit Trails
* **Visuals**: Spreadsheet-style representation of AuditLog records.
* **Key Bullets**:
  * Logs all logins, logouts, calculations, approvals, and price changes.
  * Captures timestamp, action type, target entity, user, and IP address.
  * Admin-only access to view logs.
  * Write-once log model.
* **Speaker Notes**:
  > "The system maintains a comprehensive audit trail. Any significant change—such as database updates, approvals, or user changes—is recorded with the user's details, action type, IP address, and changed fields."

---

### Slide 13: Quality Assurance & Testing

* **Title**: Testing Strategy & Performance Gates
* **Visuals**: Scorecards showing: unit tests (80%+ coverage), stress tests (100 concurrent users).
* **Key Bullets**:
  * Unit tests built with Vitest for both backend controllers and frontend state.
  * Automated integration tests verifying calculator API correctness.
  * CI/CD Quality Gates: GitHub Actions runs all tests, typescript builds, and docker compiles.
* **Speaker Notes**:
  > "To ensure stability, we built a comprehensive test suite. The backend and frontend unit tests cover core features. We also set up a CI/CD pipeline that validates code quality, tests, and builds before any deployment."

---

### Slide 14: Deployment & Maintenance

* **Title**: Containerization & Production Setup
* **Visuals**: Container deployment topology (Client container ➔ API container ➔ Postgres).
* **Key Bullets**:
  * Production ready Docker Compose setup.
  * Multi-stage build process to minimize container image sizes.
  * Automated system backup and restoration scripts.
  * Health check endpoints monitoring services.
* **Speaker Notes**:
  > "For production, MCMS is containerized using Docker. Multi-stage builds keep our image sizes small and secure, while compose health checks monitor service availability."

---

### Slide 15: Conclusion & Future Scope

* **Title**: Summary & Project Outcomes
* **Visuals**: Project review badge, summary checklist.
* **Key Bullets**:
  * **Outcomes**: Delivers a secure, auditable, and automated metal costing tool.
  * **Future Scope**:
    * Direct integrations with ERP systems (SAP, Oracle).
    * Integration of live LME (London Metal Exchange) pricing feeds.
    * Machine learning models to forecast raw material price trends.
* **Speaker Notes**:
  > "In conclusion, MCMS replaces error-prone spreadsheets with a secure, automated system. For next steps, we plan to integrate live LME pricing feeds and connect the application directly to the main ERP."

---

## Part 2: Panel Q&A Preparation

### 1. Why PostgreSQL?
* **Answer**:
  > "PostgreSQL was chosen for its reliability, ACID compliance, and native support for JSON columns. ACID compliance is critical for financial costing worksheets and audit logging where transactional integrity cannot be compromised. PostgreSQL's JSON capabilities allowed us to store technical properties (chemical and mechanical specifications) directly in the Grade schema while maintaining a normalized relational structure for metals, prices, and user accounts. It provides enterprise-level performance without licensing fees."

### 2. Why Prisma?
* **Answer**:
  > "Prisma ORM was selected because it provides type-safety, which reduces runtime errors, and speeds up development. Prisma generates type definitions matching our database schema. It also handles schema migrations reliably, keeping our local and production databases synchronized."

### 3. Why React?
* **Answer**:
  > "React was chosen for its component-based architecture and declarative UI model. The Calculator Workspace requires real-time feedback (such as validating that composition percentages sum to exactly 100% and updating price breakdowns dynamically). React's virtual DOM updates the UI efficiently, and Zustand provides clean, lightweight state management."

### 4. Why Role-Based Access Control (RBAC)?
* **Answer**:
  > "RBAC enforces critical security boundaries and separation of duties. In a metal costing system, cost engineers (EMPLOYEES) should create cost sheets, but should not be allowed to approve them or modify base metal prices. Managers or Administrators (ADMIN) manage pricing and approvals. Enforcing this in the backend prevents unauthorized price changes or self-approved sheets."

### 5. How do cost calculations work?
* **Answer**:
  > "The backend calculation engine retrieves the raw material prices for the components. The base cost is calculated as the sum of each component's unit price multiplied by its composition percentage and the batch size. Grade-specific multipliers and extra fees are applied. Finally, an 18% GST rate is added to calculate the final cost. Calculations are performed on the backend to prevent client-side modifications."

### 6. How does audit logging work?
* **Answer**:
  > "Audit logs are written directly to the database. Whenever a sensitive action is performed (e.g., login, calculation creation, price updates, approvals, report exports), the backend controllers write to the `AuditLog` table. This record captures the active user ID, action type, targeted entity, IP address, and a JSON payload detailing the transaction."
