# 🎨 ENTERPRISE UI/UX DESIGN BRIEF
## Project Name: Metal Cost Management System (MCMS)
### Client: JSW Steel
**Document Version:** 1.0.0  
**Date:** May 31, 2026  
**Document Status:** Approved  
**Target Audience:** UI/UX Designers, Frontend Developers, Product Managers, QA Engineers

---

## 📋 1. Design Vision & Strategic Intent

The **Metal Cost Management System (MCMS)** is an industrial web-based price modeling and decision-support workspace. It is engineered to replace fragmented legacy spreadsheets with a single, high-fidelity source of pricing truth for **JSW Steel**. 

The visual strategy bridges the gap between traditional industrial software and modern consumer SaaS interfaces:

```text
               [ JSW MCMS DESIGN INSPIRATION LANDSCAPE ]
   
       DATA COMPLEXITY                           PRODUCTIVITY & FLUIDITY
   ┌──────────────────────┐                     ┌────────────────────────┐
   │  SAP / Oracle ERP    │ <─── [ MCMS ] ───>  │  Notion / Airtable     │
   │  (Strict Structures) │                     │  (Flexible Interaction)│
   └──────────────────────┘                     └────────────────────────┘
              ▲                                              ▲
              └─────────────── [ VISUAL CORE ] ──────────────┘
                        Stripe / TanStack UI Aesthetics
```

### 1.1. Core Design Axioms
*   **Enterprise-Grade Industrial Utility:** The interface must convey extreme reliability, mathematical precision, and robustness. It should feel solid, trustworthy, and authoritative.
*   **Modern SaaS Fluidity:** MCMS draws inspiration from premium developer dashboards (like Stripe and Vercel) and workspace productivity platforms (like Notion and Airtable). It replaces dense SAP-like menu maps with clean spacing, smooth micro-interactions, responsive flex-grids, and progressive disclosure patterns.
*   **High Data Density without Congestion:** The steel industry operates on multi-column tables, composition variables, mechanical values, and cost factors. The interface uses custom grid spacings (based on an 8px scale) to display dense data layouts legibly, avoiding user cognitive overload.
*   **Frictionless Calculator Ergonomics:** As a cost estimation tool, the system is designed to minimize mouse clicks, support keyboard shortcuts, and keep calculation outputs visible at all times during adjustments.

---

## 🎭 2. Brand Personality & User Psychology

The visual and interactive elements of MCMS are designed to evoke specific feelings of confidence and control:

```text
  [ JSW Steel Corporate Brand Values ] ───► Precise, Reliable, Efficient, Modern
                                               │
                                 ┌─────────────┴─────────────┐
                                 ▼                           ▼
                         [ USER EXPERIENCE ]        [ VISUAL REPRESENTATION ]
                          In Control, Fast            Clean, Structured
```

### 2.1. Brand Archetype & Keywords
*   **Precise:** Every pricing card, decimal value, and multiplier represents JSW's commercial accuracy. Calculations utilize strict, high-contrast numerical layouts.
*   **Reliable:** Visual grids are structured and predictable, avoiding floating popups that could block workflow pathways.
*   **Modern SaaS:** Clean typography, curated industrial slate colors, and subtle micro-transitions showcase JSW's commitment to digital transformation.
*   **Efficient:** Keyboard shortcuts and dynamic, debounced calculator summaries help production engineers complete complex cost calculations in under 3 minutes.

### 2.2. Targeted User Psychology
*   **Confidence:** Clear validation rules, status badges, and locked snapshot banners give engineers and finance controllers absolute peace of mind during commercial audits.
*   **Control:** The interface clearly separates draft modes from permanently locked completed cost calculation sheets.
*   **Productivity:** Instant cost previews remove loading spinners, allowing users to quickly assess cost trade-offs during metal cost estimates.

---

## 👥 3. Target User Persona Scenarios

The layout configuration of MCMS adapts dynamically to support three primary user pathways:

### 3.1. Administrator (IT & Systems Controller)
*   **Operational Goals:** Quick access to user directories, security control switches, system parameters, and system-wide audit logs.
*   **Pain Points:** Traditional ERP systems hide administrative tools behind deep menus.
*   **Design Solution:** The sidebar places User Management and Audit Logs within 1-click reach. Log entries leverage interactive tables with searchable, filterable column headers.

### 3.2. Procurement Specialist (Price List Manager)
*   **Operational Goals:** Keeping raw metal base rates, supplier price sheets, and category parameters up to date.
*   **Pain Points:** Copious manual typing in spreadsheet tables often leads to price errors.
*   **Design Solution:** Simple pricing spreadsheets with inline validations and audit-change modals, alongside immediate visual confirmations of price adjustments.

### 3.3. Production Engineer & Finance Reviewer (Calculator Workspace Users)
*   **Operational Goals:** Custom alloy cost modeling, single-metal cost calculations, side-by-side grade comparisons, and PDF receipt downloads.
*   **Pain Points:** Slow, multi-step calculation wizards that hide cost totals until the final screen.
*   **Design Solution:** A split-screen Calculation Workspace. Inputs remain on the left, while a high-visibility, real-time Cost Summary Panel is locked on the right.

---

## 🎨 4. Design System & Style Tokens

MCMS employs a premium, highly structured light theme tailored to industrial applications. Spacing, colors, and shadows are defined as strict design tokens to ensure consistency.

```text
              [ VISUAL STYLE TOKENS SCALE ]
   
     ROUNDING (Radius)          SPACING (8px Grid)          SHADOWS
   ┌──────────────────┐       ┌────────────────────┐      ┌────────────┐
   │ Input/Btn: 12px  │       │ 4px | 8px | 12px   │      │ SM: Subtle │
   │ Table/Card: 12px │       │ 16px | 24px | 32px │      │ MD: Border │
   │ Outer Card: 16px │       │ 40px | 48px | 64px │      │ LG: Flyout │
   └──────────────────┘       └────────────────────┘      └────────────┘
```

### 4.1. Corporate Color Palette (Tailwind Mapping)
*   **Primary (JSW Corporate Brand Blue):**
    *   `Hex: #005A9C` | `HSL: hsl(205, 100%, 31%)`
    *   *Usage:* Global header actions, sidebar selected links, primary buttons, structural active indicators.
*   **Secondary (Industrial Steel Slate):**
    *   `Hex: #4A5568` | `HSL: hsl(217, 17%, 35%)`
    *   *Usage:* Secondary navigation, column headings, section captions, subtitle tags.
*   **Accent (Modern Cyan):**
    *   `Hex: #00B5AD` | `HSL: hsl(178, 100%, 35%)`
    *   *Usage:* Real-time live calculator indicators, dynamic delta calculations, active charts.
*   **Semantic Feedback Tonalities:**
    *   *Success (Green):* `#10B981` | `hsl(162, 76%, 41%)` (Completed, active, cheaper values)
    *   *Warning (Amber):* `#F59E0B` | `hsl(38, 92%, 50%)` (Draft mode, price changes, system alerts)
    *   *Error (Red):* `#EF4444` | `hsl(0, 84%, 60%)` (Inactive status, budget limits, access forbidden)
*   **Neutral Greyscale Scale:**
    *   `Neutral-50 (White Page Base):` `#F8FAFC` (Core workspace background canvas)
    *   `Neutral-100 (Border line):` `#E2E8F0` (Input outlines, card borders, grid lanes)
    *   `Neutral-800 (Text default):` `#0F172A` (Bold headers, body text, data cells)

### 4.2. Typography Hierarchy (Font Family: Inter)
```text
  Scale Group   |  Font Weight   |  Font Size  |  Line Height  |  Letter Spacing
 ───────────────┼────────────────┼─────────────┼───────────────┼─────────────────
  Display Header |  Bold (700)    |  30px / 2.0rem|  36px / 1.2    |  -0.025em
  Page Title H1  |  Bold (700)    |  24px / 1.5rem|  32px / 1.25   |  -0.02em
  Section Sub H2 |  Semibold (600)|  18px / 1.12rem|  24px / 1.3    |  -0.015em
  Card Header H3 |  Semibold (600)|  16px / 1.0rem|  20px / 1.35   |  -0.01em
  Body Default   |  Regular (400) |  14px / 0.87rem|  20px / 1.45   |  0.0em
  Caption / Tag  |  Medium (500)  |  12px / 0.75rem|  16px / 1.5    |  0.01em
```
*   *Typography Fallback:* `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### 4.3. Spacing, Rounding, and Shadow Token Scales
*   **8px Spacing Scale:** All grid gaps, paddings, and margin scales use an 8px grid (4px for micro-paddings, 8px for inner cards, 12px for form elements, 16px for general card layouts, 24px for major grids, and 32px/48px/64px for container sections).
*   **Border Radius Tokens:**
    *   `Outer Panels & Large Page Cards:` `16px` (Generates a clean visual block frame)
    *   `Data Tables, Input Boxes, Tool Buttons:` `12px` (Soft but modern enterprise look)
    *   `Tags, Badges, Status Blocks:` `9999px` (Fully pills-rounded outline profiles)
*   **Shadow Tokens:**
    *   `Shadow-SM:` `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Default card elevations)
    *   `Shadow-MD:` `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` (Hover card focus)
    *   `Shadow-LG:` `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)` (Modals, flyout notifications)

---

## 🏛️ 5. Application Shell & Structural Layout

The application features a responsive, unified layout composed of three primary structural zones:

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │ [Breadcrumb] / Calculator                [Search...]  [(3)]  [Profile] │ <-- TOPBAR
  ├──────────────┬─────────────────────────────────────────────────────────┤
  │ (o) Dash     │                                                         │
  │ [x] Calc     │                                                         │
  │ [ ] Metals   │                                                         │
  │ [ ] Grades   │                  MAIN WORKSPACE CANVAS                  │
  │ [ ] Reports  │                                                         │
  │              │                                                         │
  │ [ ] Settings │                                                         │
  └──────────────┴─────────────────────────────────────────────────────────┘
     SIDEBAR
```

### 5.1. Sidebar Design Standards
*   **Desktop Behavior (Width: 260px):** Always expanded. Displays the JSW Steel logo at the top, followed by a vertical navigation list.
*   **Tablet Behavior (Width: 80px):** Icons-only view. Displays high-contrast icons for each link, with popover tooltips on hover showing the page name.
*   **Mobile Behavior:** Off-screen drawer menu triggered by a topbar hamburger icon.
*   **Selected Interaction State:** Highlighted with the primary brand blue (`Hex: #005A9C`), a subtle left border strip, and bold, high-contrast white text.
*   **Role-Aware Filtering:** 
    *   If user is `PRODUCTION`, administrative links (e.g. User Management, System Logs) are automatically omitted from the sidebar.
    *   If user is `PROCUREMENT`, calculator links are hidden to focus their workflow on price list management.

### 5.2. Topbar Design Standards
*   **Breadcrumbs:** Clean text links (e.g., `Metals / SS-304 / Grade Settings`) representing the current path.
*   **Universal Search Bar (Width: 320px):** Allows quick searches for metals, batch IDs, or report documents.
*   **Global Actions:**
    *   *Real-time SSE Notification bell:* Displays unread alert badges.
    *   *Profile dropdown:* Quick access to user information and logout controls.

---

## 📄 6. Page Specifications & Layout Guidelines

---

### 6.1. Login Screen
Designed with a clean, focused, corporate layout that provides clear feedback during authorization actions.

```text
  ┌────────────────────────────────────────────────────────┐
  │                       [JSW Logo]                       │
  │                  Welcome back to MCMS                  │
  │             Enter credentials to access costing        │
  │                                                        │
  │   Email Address                                        │
  │   ┌────────────────────────────────────────────────┐   │
  │   │ production.engineer@jsw.in                     │   │
  │   └────────────────────────────────────────────────┘   │
  │   Password                                             │
  │   ┌────────────────────────────────────────────────┐   │
  │   │ ••••••••••••••••••••••••••                 [o] │   │
  │   └────────────────────────────────────────────────┘   │
  │                                                        │
  │   [x] Remember this machine       Forgot Password?     │
  │                                                        │
  │   ┌────────────────────────────────────────────────┐   │
  │   │                 Log In Securely                │   │
  │   └────────────────────────────────────────────────┘   │
  └────────────────────────────────────────────────────────┘
```
*   **Layout Structure:** A split-screen layout on desktop. The left side features a high-fidelity image of a JSW Steel production facility (visual anchor), while the right side contains a clean, centered login panel.
*   **Visual Indicators:** High-contrast focus rings highlight inputs, and errors (e.g. password mismatch) trigger clear, red validation states on the affected fields.

---

### 6.2. Executive Dashboard Screen
Summarizes core metrics, calculations, recent actions, and live system updates.

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │  Active Metrics                                                        │
  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
  │  │ calculations  │ │ active grades │ │ total quantity│ │ active alerts │ │
  │  │     1,420     │ │      182      │ │   4,200 Tons  │ │       3       │ │
  │  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ │
  │  Cost Trends                                                           │
  │  ┌───────────────────────────────────────────────┐ ┌───────────────────┐ │
  │  │ [Line chart detailing price fluctuations]     │ │ [Quick Actions]   │ │
  │  │                                               │ │ > New Cost Calc   │ │
  │  │                                               │ │ > Compare Grades  │ │
  │  │                                               │ │ > Export CSV      │ │
  │  └───────────────────────────────────────────────┘ └───────────────────┘ │
  └────────────────────────────────────────────────────────────────────────┘
```
*   **Layout Tiers:**
    1.  *Summary KPI grid:* Responsive 4-column widget display containing bold counts and micro success trends (e.g. `+12% from last week`).
    2.  *Core visualization grid (2-column layout):* The left side displays interactive metal price charts, and the right side hosts the quick-action shortcut panel.
*   **Aesthetic Principle:** Generous 24px grid gaps separate metrics card panels to keep dense data readable.

---

### 6.3. Cost Calculation Workspace (Core Interface)
Designed to support fast, highly efficient calculations. It features a three-panel layout to keep inputs and totals visible at all times during cost estimates.

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │  Cost Calculator Workspace (/calculator)                                │
  ├────────────────────────┬────────────────────────┬──────────────────────┤
  │  PANEL 1: MATERIALS    │  PANEL 2: PARAMETERS   │  PANEL 3: SUMMARY    │
  │                        │                        │                      │
  │  Base Metal            │  GST Slab Selection    │  Total Quantity      │
  │  ┌──────────────────┐  │  ┌──────────────────┐  │  1,500 kg            │
  │  │ SS-304           │  │  │ 18% GST Rate     │  │                      │
  │  └──────────────────┘  │  └──────────────────┘  │  Base cost sum       │
  │  Grade Selection       │  Transport Surcharge   │  235,500.00 INR      │
  │  ┌──────────────────┐  │  ┌──────────────────┐  │                      │
  │  │ Premium A-1      │  │  │ 120.00 INR/ton   │  │  Final Locked Cost   │
  │  └──────────────────┘  │  └──────────────────┘  │  ┌────────────────┐  │
  │  Quantity (kg)         │  Additional Surcharges │  │ 277,890.00 INR │  │
  │  ┌──────────────────┐  │  ┌──────────────────┐  │  └────────────────┘  │
  │  │ 1500             │  │  │ 500.00           │  │                      │
  │  └──────────────────┘  │  └──────────────────┘  │  [ Complete Batch ]  │
  └────────────────────────┴────────────────────────┴──────────────────────┘
```
*   **Panel 1 (Material Inputs):** Dropdowns to select base metals, alloys, and grades, alongside numeric fields to input the target mass or quantity.
*   **Panel 2 (Cost Parameters):** Accordion sections containing cost inputs like transport fees, scrap percentages, and GST slabs.
*   **Panel 3 (Live Cost Summary):** Rendered on the right side with a modern card design. Highlights the final calculated cost in a high-visibility, accented block, and updates in real-time as inputs in Panel 1 or 2 are modified.

---

### 6.4. Grade Comparison Matrix Screen
Supports side-by-side comparison modeling.

*   **Header Alignment:** Dynamic sticky table headers that remain visible as the user scrolls horizontally through comparison columns.
*   **Visual Highlights:** Chebyshev mechanical differences and cost differentials are highlighted using subtle background tints (e.g., light green for cost savings, light red for cost premiums).

---

### 6.5. Metal Master CRUD Panel
Admin and procurement view for managing raw metals and prices.

*   **Layout Structure:** Standard table view containing active search inputs, category drop-downs, and status toggles.
*   **Table Guidelines:** Large numbers are right-aligned, text labels are left-aligned, and actions are grouped inside a clean, right-aligned options menu.

---

### 6.6. Dynamic Report Generator Panel
Auditing view for compiling calculations, filtering transaction logs, and exporting reports.

*   **Filter Panel:** A collapsible top filter bar containing inputs for date ranges, metal categories, and user departments.
*   **Export Actions:** High-contrast buttons with matching file-type icons (e.g., green spreadsheet icon for Excel exports, red document icon for PDF exports).

---

## 🧱 7. Component Library Specifications

Standardized UI components ensure design consistency and streamline development.

```text
                       [ COMPONENT LIBRARY LAYOUT ]
   
       BUTTONS                   INPUT STATES                STATUS BADGES
   ┌─────────────┐             ┌───────────────┐           ┌──────────────┐
   │ Primary:    │             │ Default: Slate│           │ [Completed]  │
   │ Brand Blue  │             │ Focus: Blue   │           │ (Green Pill) │
   │             │             │ Ring (2px)    │           │              │
   │ Secondary:  │             │ Error: Red    │           │ [Draft]      │
   │ Border Gray │             │ Border        │           │ (Amber Pill) │
   └─────────────┘             └───────────────┘           └──────────────┘
```

### 7.1. Buttons
*   **Primary Button:**
    *   *Styling:* Solid JSW blue background (`Hex: #005A9C`), bold white Inter font, 12px border radius, subtle hover elevation.
    *   *Hover State:* Color shifts to `Hex: #00467A` using a smooth 150ms transition.
*   **Secondary Button:**
    *   *Styling:* Solid white background, 1px slate border outline (`Hex: #E2E8F0`), slate text, 12px border radius.
    *   *Hover State:* Background transitions to light gray (`Hex: #F8FAFC`).

### 7.2. Input Fields
*   **Structure:** 12px border radius, light gray background (`Hex: #F8FAFC`), 1px subtle border outline, and clear placeholder text.
*   **Focus State:** High-contrast, 2px primary blue outer ring (`Hex: #005A9C`), outline transitions to blue.
*   **Error State:** 1px red outline (`Hex: #EF4444`), accompanied by a clear red validation description label below the field.

### 7.3. Status Pills
*   **Completed Status:** Solid light green background pill with dark green text (`Hex: #10B981`, `Hex: #064E3B`).
*   **Draft Status:** Solid light amber background pill with dark amber text (`Hex: #F59E0B`, `Hex: #78350F`).
*   **Cancelled Status:** Solid light red background pill with dark red text (`Hex: #EF4444`, `Hex: #7F1D1D`).

### 7.4. Skeleton Loaders
*   **Design:** Gray blocks with a soft, pulsing opacity animation (`opacity: 0.3` to `0.7` over 1.5 seconds) that match the dimensions of the loading page elements, preventing sudden visual shifts.

---

## 📱 8. Responsive Adaptations & Breakpoints

MCMS is designed as a responsive web application that scales layouts cleanly across all screen sizes.

| Screen Type | Width Breakpoint | Primary Shell Layout | Component Scale |
| :--- | :--- | :--- | :--- |
| **Desktop (Large)**| `1440px` and above | Expanded sidebar (260px), 3-panel workspace calculator. | Default spacing tokens. |
| **Laptop (Standard)**| `1280px` to `1439px` | Expanded sidebar (260px), 3-panel calculator flows transition into a 2-panel scrolling workspace. | Default spacing tokens. |
| **Tablet** | `768px` to `1277px` | Sidebar collapses to icon-only navigation (80px), workspace panels stack vertically. | Compact padding tokens. |
| **Mobile** | `375px` to `767px` | Sidebar is hidden inside an off-screen drawer menu, data tables enable horizontal scroll. | Highly compact padding tokens. |

---

## 💡 9. Key User Experience (UX) Principles

*   **Progressive Disclosure:** Complex chemical properties and mechanical data are hidden by default inside accordion panels, keeping the workspace calculator clean and focused.
*   **Zero Loading States during Previews:** The calculator updates calculations instantly in-memory, providing fast visual feedback.
*   **Always Visible Totals:** The Final locked Cost remains pinned on the right side of the workspace calculator, ensuring key metrics are always visible during draft adjustments.
*   **Predictable Visual Feedback:** Completed calculations display distinct locked status banners to prevent users from attempting to edit finalized cost invoices.

---

## ✨ 10. Micro-Interactions & Transitions

1.  **Button Hover Transitions:** Hovering over buttons triggers smooth 150ms background color shifts, avoiding harsh flashing effects.
2.  **Summary cost updates:** Calculated numbers on the Cost Summary Panel increment or decrement with subtle opacity fades when input parameters change, signaling a live update.
3.  **Accordion Animations:** Section panels slide open smoothly over 200ms using a clean ease-out curve.
4.  **Toast Notification Entrances:** Alerts slide in from the top-right corner over 300ms using an elastic spring curve, drawing immediate visual attention.

---

## ♿ 11. Accessibility Compliance Targets (WCAG 2.1 AA)

*   **Color Contrast Compliance:** Text elements on page canvases strictly maintain a minimum contrast ratio of **4.5:1** against backgrounds, ensuring legibility for all users.
*   **Clear Focus States:** Interactive elements display distinct focus outlines when navigated using keyboard controls.
*   **Keyboard Navigation Flow:** Form panels support logical Tab indexes, allowing users to navigate and complete calculations entirely using a keyboard.
*   **Screen Reader Metadata:** Interactive visual components (like status pills, icons, and charts) include descriptive `aria-label` tags to support screen readers.
