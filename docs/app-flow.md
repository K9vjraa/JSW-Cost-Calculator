# 🗺️ APPLICATION FLOW DOCUMENT
## Project Name: Metal Cost Management System (MCMS)
### Client: JSW Steel
**Document Version:** 1.0.0  
**Date:** May 31, 2026  
**Document Status:** Approved  
**Target Environment:** Centralized Web Platform

---

## 📋 1. Purpose & Target Audience

This **Application Flow Document** maps the comprehensive end-to-end interactive journeys, system routines, navigation paths, and backend transaction lifecycles of the **Metal Cost Management System (MCMS)**. 

This document serves as the primary cross-functional guide for:
*   **Software Engineers:** To align on route architectures, API sequences, state transitions, and component mounts.
*   **UI/UX Designers:** To verify views, user inputs, notifications, and interaction touchpoints.
*   **QA Automation Teams:** To establish end-to-end user-acceptance scripts, testing boundaries, and mock-evaluation constraints.
*   **Enterprise Stakeholders:** To verify commercial clearance features, audit log parameters, and data-flow integrity.

---

## 🏛️ 2. High-Level Application Map

Below is the master operational layout of the MCMS platform:

```mermaid
graph TD
    Start[User Opens Browser] --> LoginGate{Is Authenticated?}
    LoginGate -->|No| LoginScreen[Login Screen /login]
    LoginGate -->|Yes| AuthMiddleware{Check Session Token}
    
    LoginScreen -->|Submit Credentials| AuthService[Auth Service Validate & Generate JWT]
    AuthService -->|Set Secure Cookies| AuthMiddleware
    
    AuthMiddleware -->|Validated| RoleSwitch{Parse User Role}
    
    RoleSwitch -->|ADMIN| AdminDashboard[Admin Panel /dashboard]
    RoleSwitch -->|PROCUREMENT| ProcDashboard[Procurement Dashboard /metals]
    RoleSwitch -->|FINANCE| FinDashboard[Finance Reviewer /reports]
    RoleSwitch -->|PRODUCTION| ProdDashboard[Costing Workspace /calculator]

    subgraph Core Modules [Workspace Operations]
        ProdDashboard --> CalcEngine[Calculator Engine]
        ProdDashboard --> CompMatrix[Comparison Matrix]
        FinDashboard --> ReportEngine[PDF/Excel Reports]
        ProcDashboard --> MasterTables[Metals & Pricing Master]
        AdminDashboard --> UserControl[User Admin & Audit Logs]
    end
```

---

## 🚀 3. Core Journeys & Detailed Flow Specifications

---

### 🟢 FLOW 1 — Application Startup Flow
This flow initializes the React Single Page Application (SPA), checks runtime configurations, and ensures the backend environment is healthy before routing the user.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Client as React Client (main.tsx)
    participant Store as Zustand Auth Store
    participant Server as Express API (/api/health)

    User->>Client: Open MCMS URL
    Client->>Client: Load environment configurations
    Client->>Server: GET /api/health (Perform health probe)
    alt Health Check Failed
        Server-->>Client: HTTP 503 (Service Unavailable)
        Client->>User: Render Service Interrupted Screen (Dynamic retry)
    else Health Check Success
        Server-->>Client: HTTP 200 OK (DB & Core systems healthy)
        Client->>Store: Check for cached Access Token
        alt Access Token Present & Unexpired
            Client->>Client: Navigate directly to /dashboard
        else Token Expired / Absent
            Client->>Server: POST /api/auth/refresh (Attempt silent credentials recovery)
            alt Refresh Token Valid
                Server-->>Client: Return new short-lived JWT & User Profile
                Client->>Store: Save Session
                Client->>Client: Navigate to /dashboard
            else Refresh Token Expired / Revoked
                Server-->>Client: HTTP 401 Unauthorized
                Client->>Client: Redirect to /login
            end
        end
    end
```

---

### 🔑 FLOW 2 — Authentication Flow
Handles secure login, token exchanges, session tracking, and user redirection.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Interface
    participant Client as React Auth Controller
    participant API as Express Auth Router
    participant DB as PostgreSQL DB

    User->>Client: Enter Email & Password
    Client->>Client: Validate format (Email pattern, pass length >= 8)
    alt Validation Failed
        Client-->>User: Render structural validation warnings
    else Validation Success
        Client->>API: POST /api/auth/login (email, password)
        API->>DB: Query user records by email
        DB-->>API: Return passwordHash & status flags
        alt User Status INACTIVE
            API-->>Client: HTTP 403 Forbidden ("Account Deactivated")
            Client-->>User: Show account lock block toast
        else User Active
            Note over API: Compare password with hash via bcrypt
            alt Password Mismatch
                API->>DB: Increment failedLoginCount
                API-->>Client: HTTP 401 Unauthorized ("Invalid credentials")
                Client-->>User: Show toast error with remaining retry attempts
            else Password Match
                API->>DB: Reset failedLoginCount, set lastLoginAt
                Note over API: Generate access JWT (15m expiration) <br> Generate rotating refresh token (7d expiration)
                API->>DB: Save hashed refresh token record
                API-->>Client: Return Access Token in body & set HttpOnly refresh cookie
                Client->>Client: Save JWT in Zustand memory, redirect to Dashboard
            end
        end
    end
```

---

### 🛡️ FLOW 3 — Role-Based Access Control (RBAC) Flow
Ensures users are strictly confined to their authorized administrative and operational domains.

```mermaid
graph TD
    UserRequest[Request Path / Module] --> Guard{Route Protected?}
    Guard -->|No: Public /login| Allow[Render Component]
    Guard -->|Yes| TokenCheck{Is Authenticated?}
    
    TokenCheck -->|No| RedirectLogin[Redirect to /login]
    TokenCheck -->|Yes| RoleCheck{Parse Token Role}
    
    RoleCheck -->|Role: ADMIN| AdminPaths{Request Path}
    AdminPaths -->|User Mgmt / System Logs| Allow
    AdminPaths -->|Calculations / Setup| Allow
    
    RoleCheck -->|Role: PRODUCTION| ProdPaths{Request Path}
    ProdPaths -->|/calculator or /comparisons| Allow
    ProdPaths -->|/users or /audit-logs| Deny[Render 403 Forbidden Screen]
    
    RoleCheck -->|Role: FINANCE| FinPaths{Request Path}
    FinPaths -->|/reports or /gst-slabs| Allow
    FinPaths -->|/metals or /calculator| Deny
    
    RoleCheck -->|Role: PROCUREMENT| ProcPaths{Request Path}
    ProcPaths -->|/metals or /prices| Allow
    ProcPaths -->|/calculator or /reports| Deny
```

---

### 📊 FLOW 4 — Dashboard Loading Flow
Generates data widgets, costing summaries, notifications, and price trend charts immediately after a successful login.

```mermaid
sequenceDiagram
    autonumber
    actor Engineer as React Client Dashboard
    participant API as Express API Server
    participant Cache as TanStack Query Cache
    participant DB as PostgreSQL DB

    Engineer->>API: GET /api/dashboard/summary (Fetch KPIs)
    Engineer->>API: GET /api/dashboard/trends (Fetch base metal chart vectors)
    Engineer->>API: GET /api/notifications/inbox (Fetch unread alerts)
    
    Note over API: Execute aggregated dashboard queries
    API->>DB: Compile cost trends, alert registries, and dashboard stats
    DB-->>API: Return query aggregates
    API-->>Engineer: HTTP 200 OK (Dashboard JSON data)
    
    Note over Engineer: Save aggregates in TanStack Cache <br> Render dashboard components
    alt SSE Stream Initiation
        Engineer->>API: GET /api/notifications/stream (Initialize SSE Listener)
        API-->>Engineer: Establish persistent text/event-stream connection
    end
```

---

### 📑 FLOW 5 — Metal Master Management Flow
Provides administrators and procurement specialists with CRUD processes to maintain base raw metals.

```mermaid
graph LR
    Start[Open Metals Master Panel] --> SearchFilter[Search / Filter Listings]
    SearchFilter --> ActionChoice{Action?}
    
    ActionChoice -->|Add Metal| AddForm[Input Name, Code, Category, Unit]
    AddForm --> AddVal{Zod Validation?}
    AddVal -->|Failed| AddForm
    AddVal -->|Success| SaveAdd[POST /api/metals]
    
    ActionChoice -->|Edit Metal| EditForm[Modify parameters]
    EditForm --> EditVal{Zod Validation?}
    EditVal -->|Failed| EditForm
    EditVal -->|Success| SaveEdit[PUT /api/metals/:id]
    
    ActionChoice -->|Delete Metal| DelCheck{Is Metal active in completed calculations?}
    DelCheck -->|Yes| BlockDel[Block hard deletion - enforce Status: INACTIVE]
    DelCheck -->|No| SaveDel[DELETE /api/metals/:id]

    SaveAdd & SaveEdit & SaveDel --> DBWrite[(Write PostgreSQL)]
    DBWrite --> AuditLog[Write Audit Log System Event]
    AuditLog --> PushAlert[Emit SSE Alert: Price List / Master Modified]
```

---

### ⚙️ FLOW 6 — Grade Parameterization Flow
Nests specific grade attributes under base raw metals to define multiplier coefficients and processing fees.

```text
Grade Master Dashboard
  ├── Select Base Metal (e.g. Stainless Steel SS-304)
  ├── Open "Add Grade Profile" Form
  │     ├── Input Grade Name (e.g. Premium Mirror-Finish)
  │     ├── Set Multiplier Coefficient (e.g. 1.0500)
  │     ├── Set Processing Surcharge (e.g. 75.00 INR/kg)
  │     └── Input Properties (JSON: Chemical limits, tensile strength)
  ├── Frontend Validation (Multiplier >= 1.00, extraPrice >= 0)
  ├── API Call: POST /api/grades
  ├── Backend Validation (Validate UUID, check unique constraint: [metalId, name, subGrade])
  ├── Save to Database Table: `grades`
  └── Write Audit Event: "GRADE_CREATE" (Details: name, metalId)
```

---

### 🧮 FLOW 7 — Cost Calculation Workspace Flow
The core operational flow. Production engineers select materials, validate tolerances, calculate costing previews, and lock finalized calculation snapshots.

```mermaid
sequenceDiagram
    autonumber
    actor Eng as Production Engineer
    participant Client as React Calculator State
    participant Engine as Express Cost Engine
    participant DB as PostgreSQL DB

    Eng->>Client: Open Cost Workspace (/calculator)
    Client->>Eng: Load default draft inputs
    Eng->>Client: Select Metal & Grade options
    Eng->>Client: Input Target Mass / Quantity (e.g. 1500 kg)
    Eng->>Client: Select GST rate (e.g. 18% GST Slab)
    
    Note over Client: Trigger local workspace cost preview
    Client->>Engine: POST /api/calculations/preview (items payloads, gstSlabId)
    Engine->>DB: Query PriceList active records (Sub-millisecond index lookup)
    DB-->>Engine: Return price index
    Note over Engine: High-precision calculation using Decimal.js
    Engine-->>Client: Return preview payload JSON
    Client->>Eng: Render live Base Cost, GST, and Total indicators

    alt Save as DRAFT
        Eng->>Client: Click "Save Draft"
        Client->>Engine: POST /api/calculations (Status: DRAFT)
        Engine->>DB: Write to `calculations` & `calculation_items`
        DB-->>Eng: Render "Draft Saved Successfully"
    else Lock as COMPLETED
        Eng->>Client: Click "Complete Calculation"
        Client->>Engine: POST /api/calculations/:id/complete
        Note over Engine: Generate unique Batch ID <br> Freeze active prices, grades, and totals into JSON snapshots
        Engine->>DB: Write snapshots & update status to COMPLETED
        DB-->>Client: Success response containing locked payload
        Client->>Eng: Render finalized calculator screen (Disable edit inputs)
        Client->>Eng: Provide "Download PDF Cost Receipt" option
    end
```

---

### ⚡ FLOW 8 — Live Summary Recalculation Flow
Ensures the client interface recalculates and displays costing variations in real-time as users modify calculator parameters.

```text
User Modifies Input (Quantity / Extra Price / Grade Dropdown)
  │
  ├── 1. Zustand React State updates in local store
  ├── 2. Trigger debounce controller (200ms delay to prevent server network hammering)
  ├── 3. Fire API Request: POST /api/calculations/preview
  ├── 4. Express calculates costs using locked pricing metrics
  ├── 5. Return updated preview calculations payload
  ├── 6. Zustand Store overrides visual costing indices
  └── 7. Summary Sidebar dynamically renders updated cost cards with transition animations
```

---

### 🔀 FLOW 9 — Calculation Comparison Flow
Enables engineers and finance controllers to load up to 4 calculations side-by-side to review dynamic pricing variations.

```text
User Opens Grade Comparison Workspace (/comparisons)
  │
  ├── 1. Select up to 4 calculations from historic list
  ├── 2. Fetch locked calculations payloads from DB
  ├── 3. Generate structured Comparison Matrix:
  │      ├── Quantity Metrics
  │      ├── Base metal locked price per unit
  │      ├── Grade process coefficients
  │      ├── Applied GST levels
  │      └── Final calculated cost
  ├── 4. Highlight price differences (Cheapest option: Green border, Premium options: Red border)
  └── 5. User clicks "Export Comparison Matrix" -> Generates Excel workbook
```

---

### 📤 FLOW 10 — Report Generation & Aggregation Flow
Processes large costing sets, filters logs by dates and users, and exports them in binary PDF, CSV, or Excel formats.

```mermaid
sequenceDiagram
    autonumber
    actor Auditor as User / Auditor Interface
    participant Client as React Reports Panel
    participant Server as Express Exports Endpoint
    participant Generator as Server Document Compiler
    participant DB as PostgreSQL DB

    Auditor->>Client: Apply filters (Date range, status: COMPLETED, metalId)
    Auditor->>Client: Choose Export Format (e.g. EXCEL)
    Client->>Server: GET /api/exports/reports/excel?startDate=...&endDate=...
    Note over Server: Zod date-range parsing checks
    Server->>DB: Query calculations matching filter parameters
    DB-->>Server: Return calculation records set (using prisma pagination)
    Note over Server: Initialize ExcelJS / PDFKit workbook buffers
    Server->>Generator: Pass datasets to workbook builders
    Generator->>Generator: Format columns, auto-size grid sizes, and apply JSW styling
    Generator-->>Server: Return finalized document binary stream
    Server-->>Auditor: Return HTTP 200 OK (Content-Type: application/vnd.openxmlformats-officedocument)
    Note over Auditor: Browser triggers automatic local file download
```

---

### 📝 FLOW 11 — Audit Logging Flow
Automatically records all critical system transactions to ensure compliance and traceability.

```mermaid
sequenceDiagram
    autonumber
    actor User as Operational User
    participant Route as Express API Endpoint
    participant Guard as JWT Auth Claim
    participant DB as PostgreSQL DB

    User->>Route: Trigger Action (e.g. Update Metal Base Price)
    Note over Route: Execute primary business request successfully
    Route->>Guard: Read authenticated token parameters
    Note over Route: Construct detailed audit JSON metadata packet: <br> { action: "PRICE_UPDATE", ip: "192.168.1.100", details: {...} }
    Route->>DB: INSERT into `audit_logs`
    DB-->>Route: DB Write Confirmed
    Route-->>User: Return action confirmation packet
```

---

### 🔔 FLOW 12 — SSE Real-Time Notification Flow
Streams price changes, system status warnings, and authorization failures directly to active user screens without polling.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    actor Eng as Active Production Engineer
    participant API as Express API Server
    participant Notification as SSE Notification Service
    participant DB as PostgreSQL DB

    Eng->>API: GET /api/notifications/stream (Open SSE stream connection)
    Note over API: Keep connection open (HTTP 200 OK, text/event-stream)
    
    Admin->>API: POST /api/prices (Procurement changes base metal price)
    API->>DB: Update PriceList table
    DB-->>API: Confirm database update
    
    API->>Notification: Trigger System Notification Event
    Notification->>DB: Save Alert in `notifications` table
    
    Note over Notification: Broadcast message through SSE stream
    Notification-->>Eng: Push SSE Event Packet (e.g. price adjustment details)
    Note over Eng: Client interceptor catches SSE stream packet <br> Increment navigation alert count badge
```

---

### ⚙️ FLOW 13 — Settings Management Flow
Enforces adjustments to general system parameters (GST, default scrap factors, currency standards).

```text
Admin navigates to /settings
  │
  ├── 1. Fetch current settings constants from DB Table: `system_settings`
  ├── 2. Admin adjusts parameters (e.g. Enforce Transport Base Surcharge: 120.00 INR/ton)
  ├── 3. Zod validates payload formats
  ├── 4. API Request: PUT /api/settings
  ├── 5. Save settings to DB
  └── 6. Write Audit Event: "SETTINGS_MODIFY" (Records previous parameters & updated values)
```

---

### 🛑 FLOW 14 — Error Recovery Flow
A multi-tier error catching structure that keeps the application stable when issues occur in the frontend, backend, or database.

```text
Error Occurrence Point
  │
  ├── [ FRONTEND EXCEPTION ]
  │     ├── React Error Boundary intercepts runtime exception
  │     ├── Render fallback "UI Crashed" layout page
  │     └── Display quick reload action button
  │
  ├── [ BACKEND API ERROR ]
  │     ├── Controller encounters exception (e.g., duplicate unique index)
  │     ├── Global Express Error Handler middleware catches exception
  │     ├── Winston logs exception stack traces inside secure logs file
  │     └── Send standardized JSON: { success: false, error: "System Error occurred." }
  │
  └── [ DATABASE TRANSACTION TIMEOUT ]
        ├── PostgreSQL pool capacity depleted
        ├── Prisma ORM client catches timeout exception
        ├── Return HTTP 503 database unavailable warning
        └── Alert system administrator via real-time SSE stream
```

---

### 🚪 FLOW 15 — System Logout & Session Expiry Flow
Securely terminates active personnel sessions and clears cryptographic credentials.

```text
Termination Trigger (Manual Click / Session Idle / 7-Day Expiration)
  │
  ├── 1. Express clear HTTP HttpOnly Cookie (refreshToken)
  ├── 2. Express deletes matching session ID record from `refresh_tokens` DB table
  ├── 3. React Client state wipes Zustand JWT tokens from browser memory
  └── 4. Navigation redirect intercepts further actions, routing the browser back to /login
```

---

## 📈 4. Operational Success Metrics

The platform evaluates workflow efficiency and system stability using these indicators:

| Category | KPI Indicator | Measurement Method | Target Baseline |
| :--- | :--- | :--- | :--- |
| **System Flow** | Health Check Resolution | Startup Health probe time-limit. | $\le 100\text{ ms}$ |
| **Authentication** | Silent Token Renewals | Axios silent token refresh interceptor time. | $\le 150\text{ ms}$ |
| **Cost Calculator** | Live Cost Preview Time | Network API payload return limit. | $\le 500\text{ ms}$ |
| **Audit Compliance** | Audit Capture rate | Auto-verification checks on modified fields. | 100% logging rate |
| **Data Exports** | PDF Compilation latency | Generation time for a single invoice. | $\le 1.5\text{ seconds}$ |

---

## ⚡ 5. Risks & Operational Assumptions

*   **Continuous Network Connection:** The calculator's live cost summaries assume continuous network access. If connectivity is lost, the frontend falls back to a clean offline banner and disables calculator updates until connection is restored.
*   **Manual Excel Adjustments:** Users exporting data to Excel might adjust formulas manually offline. The TRD mitigates this by embedding locked calculations and a unique Batch ID validation string in the exported worksheets, ensuring the source database remains the single source of truth during audits.
*   **Supplier Price Expirations:** If a supplier's pricing contract expires without a new price list being recorded, calculation engines will throw warning notifications. Procurement teams must keep active supplier contracts up to date.
