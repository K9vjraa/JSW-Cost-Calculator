# JSW Metal Cost Management System (MCMS) - Client Application

A high-performance, focused industrial costing frontend developed specifically for **JSW Steel**. The application delivers a polished, responsive white/gray/blue industrial SaaS interface designed to streamline complex costing models, grade comparisons, and master data administration.

---

## 🚀 Technology Stack

- **Core & State:** React 19 + TypeScript + Vite + React Router (v7) + Axios
- **Styling:** Tailwind CSS v4 + Radix UI Primitives (ShadCN style) + Lucide Icons + Framer Motion (micro-animations)
- **Charts:** Chart.js + `react-chartjs-2` for interactive cost analysis and alloy distributions
- **Testing:** Vitest + React Testing Library + JSDOM for robust unit and component testing

---

## 🎨 Design System & Aesthetics

Following JSW Steel's premium industrial identity, the application utilizes a tailored design language:
- **Color Palette:** Clean white card backgrounds, light gray borders, corporate slate and deep indigo/blue primary colors (`#003366` / `#0f172a`), with harmonious status badges.
- **Glassmorphism:** Elegant, modern glass backdrops for modals, overlays, and persistent calculators.
- **Typography:** Modern typography using professional sans-serif fonts optimized for high information density.
- **Micro-Animations:** Fluid transitions, card hover effects, and spring animations on cost summaries powered by Framer Motion.
- **Responsive Layout:** Responsive layout supporting high-density displays, sticky side panels, and collapsible navigation bars.

---

## 📁 Directory Structure

```text
client/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Brand logos and images
│   ├── components/         # Reusable presentation and UI elements
│   │   ├── ui/             # Radix + Tailwind CSS primitives (ShadCN style)
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   └── tabs.tsx
│   │   ├── Charts.tsx      # Cost distribution and historical price charts
│   │   └── ErrorBoundary.tsx
│   ├── context/            # React global contexts (e.g. AuthContext, Notifications)
│   ├── data/               # Static constants and offline fallback fixtures
│   ├── hooks/              # Custom hooks for fetching, validation, and layout
│   ├── layouts/            # Dashboard and Admin Layout frames
│   ├── pages/              # Application Pages & Route targets
│   │   ├── LoginPage.tsx         # Secure login with JWT flow
│   │   ├── Dashboards.tsx        # Role-based Admin & User Dashboards
│   │   ├── WorkspacePage.tsx     # Three-mode costing calculator
│   │   ├── ComparisonPage.tsx    # Multi-grade comparison matrix
│   │   └── OperationsPages.tsx   # Master Data management tables
│   ├── services/
│   │   └── api.ts          # Axios configuration with token refresh interceptor
│   ├── types.ts            # Type definitions mirroring Prisma backend models
│   ├── index.css           # Core styling tokens & CSS variables
│   ├── App.tsx             # Route declarations and Context providers
│   └── main.tsx            # DOM entrypoint
├── package.json
└── vite.config.ts
```

---

## 🖥️ Core Interfaces & Pages

### 1. 🔑 Authentication (`LoginPage.tsx`)
- Standard authentication with username/password.
- Leverages JWT tokens stored in secure, rotating refresh session states.
- Local fallback fixture enabled during offline/local testing so designers can preview layout without backend setup.

### 2. 📊 Role-Based Dashboards (`Dashboards.tsx`)
- **Admin Dashboard:** Displays aggregate system statistics, active users, audit logs, and master price health monitors.
- **User Dashboard:** Tailored to Procurement, Finance, and Production departments showing calculation lists, pending draft reviews, and live notification feeds.

### 3. 🧮 Costing Workspace (`WorkspacePage.tsx`)
Backed by a unified locked pricing model. Operates in 3 modes:
1. **Multi-Metal Calculator:** Direct metal selection, inputs for quantities, customized multiplier and extra margins.
2. **Alloy Costing Workspace:** Hierarchical breakdown of raw-material compositions, expandable rows, and live summary cost updates.
3. **Raw-Material Builder:** Granular specification of composite raw material elements.
- *Live Side-Panel:* Features a real-time summary calculation breakdown displaying total weight, base pricing, added extra fees, and the calculated JSW final cost.

### 4. ⚖️ Grade Comparison Tool (`ComparisonPage.tsx`)
- Sticky column layout allowing cross-comparison of chemical and physical properties.
- Dynamic highlights indicating property differences (tolerance limits, tensile strength, composition differences) between up to 4 grades simultaneously.

### 5. 🛠️ Master Data Operations (`OperationsPages.tsx`)
Allows authorized roles to manage the following master tables:
- **Metals & Grades:** Multipliers and extra charges.
- **Raw Materials & Alloys:** Composition percentages.
- **Suppliers & Price Lists:** Effective date configurations.
- **System Administration:** User controls, Audit Logs, and System settings.

---

## ⚡ Integration & API Configuration

All requests route through `/api`. Axios intercepts requests to handle:
- **JWT Authorization Headers:** Automatic injection of access tokens.
- **Silent Refresh Interception:** If an API call fails with `401 Unauthorized`, Axios holds the queue, triggers a refresh request to `/api/auth/refresh` to secure a new access token, and then seamlessly replays the original requests.
- **Fallback Mode:** Detects API unavailability and switches to client-side static fixtures to guarantee continuous UI presentation and showcase flows.

---

## 🛠️ Local Development & Scripts

Inside the `client/` folder, run:

### 1. Install Dependencies
```powershell
npm install
```

### 2. Run Dev Server
Starts the React development environment with Hot Module Replacement (HMR).
```powershell
npm run dev
```
*Frontend will be active at:* `http://localhost:5173`

### 3. Build Production Bundle
Compiles TypeScript and bundles static assets into `/dist` via Vite.
```powershell
npm run build
```

### 4. Run Unit Tests
Executes the Vitest unit tests (e.g. workspace calculators, layout math).
```powershell
npm run test
```

---

## 🧪 Testing Focus

Front-end validation is located under `client/src/pages/WorkspacePage.test.ts` (and similar files).
Tests verify:
- Cost calculation math against industrial decimal rules.
- Selection behavior (e.g., matching sub-grades correctly).
- Table expansions and reactive summary card updates.
