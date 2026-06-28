# JSW Internship Report - 04_Screenshots_Plan.md

This document serves as the master plan for all user interface (UI) screenshots required to document the JSW Metal Cost Management System (MCMS) in the internship report.

## 1. Summary of Screenshots Plan

| Figure | Screen Name | Module | Caption | Chapter | Priority | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **Figure F.1** | Login Interface | Authentication | Secure JWT Login Portal | Ch 9 / App. F | Critical | Pending |
| **Figure F.2** | Admin Dashboard | Dashboard | Costing Department Admin Dashboard View | Ch 12 / App. F | Critical | Pending |
| **Figure F.3** | User Dashboard | Dashboard | PDQC Team Analyst Dashboard View | Ch 12 / App. F | High | Pending |
| **Figure F.4** | Material Master | Master Data | Centralized Raw Material Catalog Grid | Ch 8 / App. F | Critical | Pending |
| **Figure F.5** | Material Rates | Master Data | Dynamic Price Revision & History View | Ch 8 / App. F | Critical | Pending |
| **Figure F.6** | Grade Management | Grades | Catalog of Active Steel Grade Standards | Ch 7 / App. F | High | Pending |
| **Figure F.7** | Grade Builder Form | Grades | Interactive Bill of Materials (BOM) Composer | Ch 7 / App. F | Critical | Pending |
| **Figure F.8** | Raw Material Builder | Master Data | Raw Material Addition & Configuration Form | Ch 8 / App. F | Medium | Pending |
| **Figure F.9** | Calculation Workspace | Cost Calculator | Standardized Batch Cost Calculator Input View | Ch 7 / App. F | Critical | Pending |
| **Figure F.10** | Live Summary Panel | Cost Calculator | Real-Time Estimated Cost Summary Output Panel | Ch 7 / App. F | Critical | Pending |
| **Figure F.11** | Comparison Module | Comparison | Multi-Grade Side-by-Side Delta Comparison Grid | Ch 12 / App. F | High | Pending |
| **Figure F.12** | Reports Panel | Reporting | System Performance & Financial Reports Panel | Ch 12 / App. F | Medium | Pending |
| **Figure F.13** | Audit Logs Grid | Audit & Logs | System-wide State-Mutating Activity Log Table | Ch 8 / App. F | High | Pending |
| **Figure F.14** | Settings Module | Settings | Global Settings & Multipliers Adjustment View | Ch 9 / App. F | Medium | Pending |
| **Figure F.15** | User Management | Users | Administrator Role Assignment Panel | Ch 9 / App. F | High | Pending |

---

## 2. Detailed Screenshot Specifications

### 2.1 Figure F.1: Login Interface
- **Module**: Authentication
- **Caption**: Secure JWT Login Portal displaying credentials validation.
- **Description**: The secure gateway showing JSW branding, email inputs, password inputs with visibility toggle, and error states for failed validation.
- **Target Chapter**: Chapter 9 (API & Security) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.2 Figure F.2: Admin Dashboard
- **Module**: Dashboard
- **Caption**: Costing Department Admin Dashboard View showing recent system activity.
- **Description**: The high-level KPI layout containing stats cards (Total Grades, Active Materials, Pending Approvals) and dynamic grids showing recent calculations and audit logs.
- **Target Chapter**: Chapter 12 (Results) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.3 Figure F.3: User Dashboard
- **Module**: Dashboard
- **Caption**: PDQC Team Analyst Dashboard View showing read-only metrics.
- **Description**: Simplified, read-only analytics dashboard for quality engineers, omitting settings and user configuration panels.
- **Target Chapter**: Chapter 12 (Results) & Appendix F (Screenshots)
- **Priority**: High

### 2.4 Figure F.4: Material Master
- **Module**: Master Data
- **Caption**: Centralized Raw Material Catalog Grid with search and filter inputs.
- **Description**: Grid displaying all base metals, ferro-alloy additives, current rates, availability status, and actions for updating prices.
- **Target Chapter**: Chapter 8 (Database Design) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.5 Figure F.5: Material Rates
- **Module**: Master Data
- **Caption**: Dynamic Price Revision & History View with inline edit state.
- **Description**: UI interface demonstrating the process of editing a price, including validator checks and the nested history table showing past prices, update times, and executors.
- **Target Chapter**: Chapter 8 (Database Design) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.6 Figure F.6: Grade Management
- **Module**: Grades
- **Caption**: Catalog of Active Steel Grade Standards (e.g. IS 2062, Fe500D).
- **Description**: Table showing defined steel grades, version numbers, and links to edit the chemical/mechanical profile of each standard.
- **Target Chapter**: Chapter 7 (Architecture & Design) & Appendix F (Screenshots)
- **Priority**: High

### 2.7 Figure F.7: Grade Builder Form
- **Module**: Grades
- **Caption**: Interactive Bill of Materials (BOM) Composer with real-time percentage validation.
- **Description**: A form displaying inputs for chemical compositions (Carbon, Silicon, Manganese, etc.) with validation constraints indicating if a composition totals over 100% or contains duplicate additives.
- **Target Chapter**: Chapter 7 (Architecture & Design) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.8 Figure F.8: Raw Material Builder
- **Module**: Master Data
- **Caption**: Raw Material Addition & Configuration Form displaying properties selection.
- **Description**: Modal form for creating a new ferro-alloy, entering code, category, default rates, and setting flags (`isMicro`, `isAvail`).
- **Target Chapter**: Chapter 8 (Database Design) & Appendix F (Screenshots)
- **Priority**: Medium

### 2.9 Figure F.9: Calculation Workspace
- **Module**: Cost Calculator
- **Caption**: Standardized Batch Cost Calculator Input View with custom parameters override.
- **Description**: Main working view where costing engineers select standard grades, specify batch weights, and override specific alloy percentages.
- **Target Chapter**: Chapter 7 (Architecture & Design) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.10 Figure F.10: Live Summary Panel
- **Module**: Cost Calculator
- **Caption**: Real-Time Estimated Cost Summary Output Panel with tax breakdowns.
- **Description**: Summary panel updating dynamically based on calculation parameters, showing Base Cost, Grade Surcharge, Extra Prices, 18% GST slab, and Final Cost.
- **Target Chapter**: Chapter 7 (Architecture & Design) & Appendix F (Screenshots)
- **Priority**: Critical

### 2.11 Figure F.11: Comparison Module
- **Module**: Comparison
- **Caption**: Multi-Grade Side-by-Side Delta Comparison Grid highlighting chemical/cost differences.
- **Description**: Complex matrix table loading up to 5 steel grades side-by-side, color-coding chemical component variances (e.g., higher carbon highlighted in orange) and financial deltas.
- **Target Chapter**: Chapter 12 (Results) & Appendix F (Screenshots)
- **Priority**: High

### 2.12 Figure F.12: Reports Panel
- **Module**: Reporting
- **Caption**: System Performance & Financial Reports Panel with export selections.
- **Description**: View showing export selections (PDF, CSV, Excel), calendar range filters, and preview templates.
- **Target Chapter**: Chapter 12 (Results) & Appendix F (Screenshots)
- **Priority**: Medium

### 2.13 Figure F.13: Audit Logs Grid
- **Module**: Audit & Logs
- **Caption**: System-wide State-Mutating Activity Log Table with role-based filters.
- **Description**: Administrative grid containing records of mutations, including timestamp, action tag, changed fields payload, user IP, and executor ID.
- **Target Chapter**: Chapter 8 (Database Design) & Appendix F (Screenshots)
- **Priority**: High

### 2.14 Figure F.14: Settings Module
- **Module**: Settings
- **Caption**: Global Settings & Multipliers Adjustment View with validation boundaries.
- **Description**: Setting page managing global variables like base processing fees, standard multipliers, and currency formatting parameters.
- **Target Chapter**: Chapter 9 (API & Security) & Appendix F (Screenshots)
- **Priority**: Medium

### 2.15 Figure F.15: User Management
- **Module**: Users
- **Caption**: Administrator Role Assignment Panel displaying user access lists.
- **Description**: Administrative grid listing user accounts, statuses, department categories, and interface prompts for changing RBAC roles.
- **Target Chapter**: Chapter 9 (API & Security) & Appendix F (Screenshots)
- **Priority**: High
