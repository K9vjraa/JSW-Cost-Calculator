---
description: Standard development workflow for the existing JSW Metal Cost Management System. Ensures code reuse, RBAC compliance, Supabase integration, backward compatibility, testing, and enterprise-grade implementation.
---

# MCMS Development Workflow

## Project Context

This is an EXISTING project:

JSW Metal Cost Management System (MCMS)

Do NOT create a new application.

Always modify, enhance, extend, optimize, or fix the existing codebase.

Priority:

Reuse Existing Code > Extend Existing Features > Create New Features

---

## Before Any Task

Always perform the following:

1. Inspect existing implementation.
2. Analyze project architecture.
3. Check existing routes.
4. Check existing components.
5. Check existing database schema.
6. Check existing APIs.
7. Check existing Supabase tables.
8. Identify reusable code.

Never assume functionality does not exist.

Search first.

---

## Implementation Process

### Step 1 — Analysis

Document:

- Current State
- Existing Functionality
- Existing Components
- Existing Database Structure
- Dependencies

---

### Step 2 — Planning

Create implementation plan:

- Objective
- Files Affected
- Components Affected
- Database Impact
- API Impact
- RBAC Impact
- Testing Strategy

---

### Step 3 — Development

Requirements:

- TypeScript Strict Mode
- Reusable Components
- Existing Design System
- Existing Layout System
- Existing Service Layer
- Existing Query Layer

Avoid duplication.

---

### Step 4 — Database

Supabase is the source of truth.

Rules:

- Reuse existing tables
- Create migrations only when needed
- Preserve existing data
- Preserve backward compatibility

Prefer:

ALTER TABLE

Instead of:

DROP TABLE

---

### Step 5 — Authentication

Use existing authentication.

Never create a second auth system.

Use:

- Supabase Auth
- Existing Session Logic
- Existing Protected Routes

---

### Step 6 — RBAC

Supported Roles:

COSTING_DEPARTMENT

PDQC

Remove dependency on:

- ADMIN
- EMPLOYEE
- USER

Role Rules:

COSTING_DEPARTMENT

Full CRUD

PDQC

Read Only

All new modules must respect RBAC.

---

### Step 7 — UI Development

Maintain:

- JSW Branding
- Light Theme
- Existing Layout Structure
- Existing Navigation

Do not redesign the entire application.

Only modify affected screens.

---

### Step 8 — Grade Builder Rule

Grade Builder belongs inside:

Calculation Workspace

Structure:

Metal Calculator
Raw Material Builder
Grade Builder

Do not create a separate application.

Do not create a separate dashboard.

Do not create a separate workspace.

---

### Step 9 — Testing

Verify:

- Build Success
- No TypeScript Errors
- No Lint Errors
- Existing Features Work
- RBAC Works
- Database Operations Work

---

### Step 10 — Delivery Summary

After implementation provide:

### Summary

What was completed

### Files Changed

List modified files

### Database Changes

List migrations and schema updates

### Testing

List validation results

### Next Recommendation

Suggest next development task

---

## Current Project Priorities

1. RBAC Migration
2. Login System Cleanup
3. Sidebar Permission Control
4. Grade Builder Integration
5. Material Master
6. Grade Comparison
7. Reports
8. Audit Logs

Always follow priority order unless explicitly instructed otherwise.

---

## Final Rule

MCMS is an enterprise industrial costing platform for JSW Steel.

Every implementation must:

- Improve maintainability
- Improve usability
- Improve security
- Preserve architecture
- Preserve existing functionality

Never behave like a code generator.

Behave like a senior engineer maintaining a production enterprise system.