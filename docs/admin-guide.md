# JSW Metal Cost Management System — Admin Guide

This guide details administrative procedures, security configurations, and data maintenance workflows for the **JSW Metal Cost Management System (MCMS)**.

---

## 1. Master Data Lock Security

MCMS enforces **Master-Locked Pricing** to prevent unauthorized alteration of material pricing sheets.

- **Locking Mechanism**: Material, grade, and base costs are locked in the database. General users (`USER` role) can select materials and grades for costing worksheets but cannot alter their prices or multipliers.
- **Role Enforcement**:
  - `ADMIN`: Complete read/write access to metals, grades, base prices, settings, and users.
  - `EMPLOYEE`: Can modify metals/grades and submit price changes for review, but cannot approve price changes.
  - `USER`: Read-only access to master prices.

---

## 2. Pricing Review & Approval Workflows

When commodity prices fluctuate, JSW Procurement teams update the price list. MCMS manages this via a strict review queue:

```
[Employee Submits Price Update] ──> [Status: PENDING_REVIEW] ──> [Admin Approves] ──> [Status: APPROVED (Active)]
```

### Steps for Pricing Updates:
1. **Procurement Submission**:
   - An `EMPLOYEE` logs in and navigates to the **Price Master**.
   - They enter the revised unit price and click **Submit Price**.
   - The price enters the system as `PENDING_REVIEW` and is flagged as inactive.
2. **Administrator Approval**:
   - An `ADMIN` logs in and navigates to **Dashboard > Price Approvals**.
   - They review the proposed rate and click **Approve**.
   - The system deactivates the previous active price, sets the new price as active (`APPROVED`), records a `PRICE_APPROVE` audit log, and logs a `PriceHistory` entry.

---

## 3. Rate Limiting & System Hardening

To protect the server from denial of service and brute force logins:

- **Global Route Limiter**: All requests matching `/api/*` are capped at 100 requests per 15-minute window per IP. This threshold is increased to 10,000 requests during development testing (`STRESS_TEST=true`).
- **Auth Endpoint Limiter**: Login attempts at `/api/v1/auth/login` are strictly capped at 10 attempts per minute per IP to prevent dictionary attacks.
- **Hardening Headers**: Helmet middleware is initialized in `apps/backend/src/app.ts` to configure standard security frames (`X-Frame-Options`, `Content-Security-Policy`, and `Strict-Transport-Security`).

---

## 4. System Settings & Customization

System settings reside in the `SystemSetting` database table and control variables such as:
- **`default_gst_rate`**: The default tax rate (default: `0.18` or `18%`) applied during calculation previews.
- **Session Duration**: Handled in environment variables via `JWT_ACCESS_SECRET` and cookie lifetime flags.

---

## 5. Maintenance & Disaster Recovery

- **Database Backups**: Backups are handled using PostgreSQL `pg_dump` tools. Administrative scripts are placed in `apps/backend/src/scripts/db-backup.ps1`.
- **Restore Procedure**: In the event of schema corruption or loss, refer to [Backup & Recovery Documentation](file:///c:/Users/ishan/OneDrive/Documents/Desktop/Projects/JSW%20Internship%20Project%201/Metal%20Cost%20Management%20System/JSW-Metal%20Cost%20Management%20System/docs/backup-recovery.md) for restoring databases via `db-restore.ps1`.
