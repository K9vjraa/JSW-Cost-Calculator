# 🧪 QUALITY ASSURANCE & TESTING MATRIX SPECIFICATIONS
## Project Name: Metal Cost Management System (MCMS)
### Client: JSW Steel
**Document Version:** 1.0.0  
**Date:** May 31, 2026  
**Document Status:** Approved  
**Target Environment:** Vitest, Playwright, Supertest, k6 Performance Suite

---

## 📋 1. Purpose & Objectives

This document details the complete **Quality Assurance (QA) and Testing Matrix** for the **JSW Metal Cost Management System (MCMS)**. 

To ensure the platform calculates metal costs with absolute mathematical precision and securely enforces role-based access, the testing strategy spans multiple tiers:
*   **Vitest Unit Tests:** Verifies costing formula logic, helper libraries, and Zod validator schemas.
*   **Supertest Integration Tests:** Validates Express API endpoints, cookie managers, and rate-limit buffers.
*   **Playwright E2E Tests:** Simulates active user workflows (e.g. login, workspace calculations, comparing grades, and exports) on standard browsers.
*   **k6 Performance Tests:** Validates backend response benchmarks under peak concurrent user loads.

---

## 🏛️ 2. The Multi-Tier Testing Lifecycle

Testing tasks are run sequentially inside the CI workflow before pull requests can be merged into production branches:

```text
    ┌───────────────────────────────────┐
    │   Stage 1: Linter & Format check  │  <─── Prettier & ESLint checks
    └─────────────────┬─────────────────┘
                      ▼
    ┌───────────────────────────────────┐
    │     Stage 2: Vitest Unit Tests    │  <─── Costing calculations checks (>80% coverage)
    └─────────────────┬─────────────────┘
                      ▼
    ┌───────────────────────────────────┐
    │    Stage 3: Integration Tests     │  <─── Supertest API validation checks
    └─────────────────┬─────────────────┘
                      ▼
    ┌───────────────────────────────────┐
    │     Stage 4: Playwright E2E QA    │  <─── E2E browser behavior validations
    └───────────────────────────────────┘
```

---

## 🧪 3. Technical Test Suite Examples

---

### 3.1. Vitest Unit Test: High-Precision Calculation Logic
Verifies that the `CalculationService` correctly parses quantities and multipliers using arbitrary decimal precision, preventing floating-point rounding errors.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalculationService } from '../../src/services/CalculationService';
import prisma from '../../src/config/prisma';

// Mock the Prisma database client
vi.mock('../../src/config/prisma', () => ({
  default: {
    gstSlab: { findUnique: vi.fn() },
    priceList: { findFirst: vi.fn() },
    grade: { findUnique: vi.fn() },
  },
}));

describe('CalculationService - High Precision Evaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate the costing structure with absolute mathematical precision', async () => {
    // Mock the GST slab rate (18% tax rate)
    prisma.gstSlab.findUnique.mockResolvedValue({ id: 'gst-18', rate: 0.18, active: true });

    // Mock the Metal price (200.00 INR/kg)
    prisma.priceList.findFirst.mockResolvedValue({ pricePerUnit: 200.00, active: true });

    // Mock the Grade multiplier (1.0500) and extra surcharge (50.00 INR/kg)
    prisma.grade.findUnique.mockResolvedValue({ multiplier: 1.0500, extraPrice: 50.00, active: true });

    const itemsInput = [{ metalId: 'met-1', gradeId: 'grd-1', quantity: 1000.00 }];
    const result = await CalculationService.evaluateCalculation(itemsInput, 'gst-18');

    // Expected calculations:
    // Base unit cost = 200.00 INR/kg
    // Grade base cost = (200 * 1.05) + 50 = 260.00 INR/kg
    // Calculated Base Cost = 260.00 * 1000 = 260,000.00 INR
    // GST Surcharge (18%) = 260,000 * 0.18 = 46,800.00 INR
    // Final Cost = 260,000 + 46,800 = 306,800.00 INR

    expect(result.totalQuantity).toBe(1000.00);
    expect(result.baseCost).toBe(260000.00);
    expect(result.gstAmount).toBe(46800.00);
    expect(result.finalCost).toBe(306800.00);
  });
});
```

---

### 3.2. Supertest Integration Test: Role-Based Authorization Guards
Validates that backend middleware correctly restricts access to administrative endpoints, blocking requests from unauthorized users with an HTTP `403 Forbidden` response.

```typescript
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/app';
import { generateTestJWT } from '../helpers/authHelper';

describe('RBAC Middleware - Route Protection Validation', () => {
  it('should block non-permitted users from accessing administrative endpoints', async () => {
    // Generate a valid JWT token representing a PRODUCTION engineer role
    const mockUserToken = generateTestJWT({
      userId: 'usr-9921',
      role: 'PRODUCTION',
      email: 'production.engineer@jsw.in'
    });

    const response = await request(app)
      .post('/api/users') // Administrative User Creation endpoint
      .set('Authorization', `Bearer ${mockUserToken}`)
      .send({
        name: 'New Administrator',
        email: 'admin.new@jsw.in',
        role: 'ADMIN'
      });

    // Verify the response is blocked with an HTTP 403 Forbidden status code
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Forbidden: You do not have sufficient clearance');
  });
});
```

---

### 3.3. Playwright E2E Test: Calculation Snapshot Lock Workflow
Simulates a full browser session where a production engineer creates a calculation draft, verifies live totals, saves it, and confirms that completed calculations lock pricing details to prevent future updates.

```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E Calculator Workspace - Snapshot Lock Workflow', () => {
  test('should allow engineers to log in, compile costs, and finalize a calculation', async ({ page }) => {
    // 1. Log in to the application
    await page.goto('/login');
    await page.fill('input[type="email"]', 'production@jsw-mcms.local');
    await page.fill('input[type="password"]', 'MCMS@2026');
    await page.click('button:has-text("Log In")');

    // 2. Confirm redirect to the Dashboard and navigate to the Calculator Workspace
    await expect(page).toHaveURL('/dashboard');
    await page.click('a[href="/calculator"]');
    await expect(page).toHaveURL('/calculator');

    // 3. Configure calculation parameters
    await page.selectOption('select[name="metalId"]', { label: 'Stainless Steel' });
    await page.selectOption('select[name="gradeId"]', { label: 'Premium A-1' });
    await page.fill('input[name="quantity"]', '1000');

    // 4. Verify live calculator totals update on the page
    const finalCostCard = page.locator('[data-testid="final-cost-badge"]');
    await expect(finalCostCard).toContainText('INR');

    // 5. Complete the calculation and lock the pricing snapshot
    await page.click('button:has-text("Complete Calculation")');

    // 6. Confirm success modal and verify the calculation inputs are disabled
    await expect(page.locator('text=Calculation successfully completed')).toBeVisible();
    const quantityField = page.locator('input[name="quantity"]');
    await expect(quantityField).toBeDisabled();
  });
});
```

---

## 📊 4. Quality Performance Targets

*   **API Response Benchmark:** 95% of standard REST API transactions (excluding report generations) must resolve in **< 500ms** under normal user loads.
*   **Database Query Speeds:** Price master indexing lookups must resolve query transactions in **< 10ms**.
*   **Test Coverage Baseline:** Vitest test suites must cover a minimum **80%** test coverage threshold before main branch merges are permitted.
*   **System Reliability Target:** Core costing worksheets and locked calculation features must maintain a **100%** mathematical audit success rate.
