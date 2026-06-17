# 🔒 ENTERPRISE SECURITY ARCHITECTURE SPECIFICATIONS
## Project Name: Metal Cost Management System (MCMS)
### Client: JSW Steel
**Document Version:** 1.0.0  
**Date:** May 31, 2026  
**Document Status:** Approved  
**Target Environment:** Express API server & React Client SPA (Vercel CDN + Railway Containers)

---

## 📋 1. Purpose & Objectives

This document details the security architecture and hardening configurations for the **JSW Metal Cost Management System (MCMS)**. 

Because MCMS manages valuable pricing data and calculations for JSW Steel's metallurgical operations, it is designed with strict security controls to prevent unauthorized data modifications and block brute-force attacks:
*   **Zero-Trust Session Design:** Implements stateless JWT access tokens combined with secure, rotating, cross-site scripting (XSS) resistant `HttpOnly` refresh cookies.
*   **Granular Privilege Control:** Restricts database modifications to authorized personnel using role-based routing controls on both the frontend and backend.
*   **Input Sanitization:** Uses Zod schemas to sanitize and validate incoming payloads, preventing SQL injection and cross-site scripting (XSS) attacks.

---

## 🏛️ 2. Security Infrastructure & Threat Vector Control

The system implements multiple visual and programmatic security layers to protect the application shell:

```text
               JSW Steel Personnel Browser
                            │
                   ( HTTPS / TLS 1.3 )
                            │
               [ Nginx Reverse Proxy Gate ]
              (Enforce CORS, CSP, Rate Limit)
                            │
               [ Express JWT Auth Middleware ]
              (Validate Signature, Check Expiry)
                            │
             [ authorizeRoles RBAC Middleware ]
              /             │                \
    ( ADMIN )         ( PROCUREMENT )      ( PRODUCTION )
        |                   |                    |
  System Setup        Price Tables          Calculators
```

---

## 🛡️ 3. Authentication & Session Lifecycles

MCMS utilizes a stateless, token-based session model to authorize user requests without storing session states on the server.

### 3.1. Token Specifications & Verification
*   **Access Token (JWT):** Short-lived (15 minutes). Sent in the standard `Authorization: Bearer <Token>` header. Cryptographically signed with HMAC-SHA256 containing role parameters.
*   **Refresh Token:** Long-lived (7 days). Stored in the database inside secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookies. Revoked and regenerated upon each transaction (Token Rotation).

### 3.2. Automatic Token Rotation & Revocation
*   **Detection of Reuse:** If an attacker attempts to hijack and reuse an old refresh token, the server detects the token conflict, revokes the user's active session, and deletes all linked tokens, forcing a clean re-authentication.
*   **Revocation Flow:** When a user logs out, the refresh token is deleted from the `refresh_tokens` database table, immediately terminating the session.

---

## 🔑 4. Authorization & Role-Based Access Control (RBAC)

Authorization is managed via backend role-based route guards that inspect token claims using Express middleware.

### 4.1. Permission Matrix by Corporate Roles

| System Modules | Admin | Procurement | Finance | Production |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Users** (`/api/users`) | **Write / Read** | Denied | Denied | Denied |
| **System Settings** (`/api/settings`) | **Write / Read**| Denied | **Read Only** | Denied |
| **GST Slabs Setup** (`/api/gst-slabs`)| **Write / Read**| Denied | **Write / Read**| Denied |
| **Manage Metals** (`/api/metals`) | **Write / Read**| **Write / Read**| Read Only | Read Only |
| **Update Prices** (`/api/prices`) | **Write / Read**| **Write / Read**| Read Only | Read Only |
| **Cost Calculations** (`/api/calculations`)| Read Only | Denied | Read Only | **Write / Read**|
| **Grade Comparisons** (`/api/comparisons`)| Read Only | Denied | Read Only | **Write / Read**|
| **System Audit Logs** (`/api/audit-logs`)| **Read Only** | Denied | Denied | Denied |

---

## 🧱 5. Code & Payload Protection Standards

The platform implements robust validations at all API entry points to prevent common exploits.

### 5.1. SQL Injection Preventions
*   **Parameterized Queries:** Uses Prisma ORM, which implements parameterization bindings under-the-hood, preventing malicious input from escaping query targets.
*   **Restricted Raw Queries:** Direct raw queries (`$queryRaw`) are restricted to absolute emergencies and require typed schema parameters, preventing typical SQL injection attacks.

### 5.2. Payload Validation via Zod Schemas
Zod schemas sanitize and validate incoming payloads, sanitizing inputs before database storage.

```typescript
import { z } from 'zod';

export const createCalculationSchema = z.object({
  name: z.string().min(2, "Calculation name must have at least 2 characters").max(100),
  mode: z.enum(['SINGLE_METAL', 'ALLOY_BUILDER']),
  items: z.array(
    z.object({
      metalId: z.string().uuid("Invalid metal identifier").optional(),
      rawMaterialId: z.string().uuid("Invalid raw material identifier").optional(),
      gradeId: z.string().uuid("Invalid grade identifier").optional(),
      quantity: z.number().positive("Quantity must be greater than zero"),
    })
  ).min(1, "Calculation must contain at least 1 line item"),
  gstSlabId: z.string().uuid("Invalid GST slab identifier"),
});
```

---

## ⚙️ 6. Hardening Configurations & Network Security

*   **Secure Headers via Helmet:** Express API routes run `helmet()` to configure secure headers:
    *   `Content-Security-Policy (CSP):` Enforces strict asset sources and blocks external inline scripts.
    *   `X-Frame-Options (SAMEORIGIN):` Prevents the application from being embedded in iframes, blocking Clickjacking attacks.
    *   `Strict-Transport-Security (HSTS):` Forces HTTPS for a duration of two years.
*   **CORS (Cross-Origin Resource Sharing) Limits:**
    ```typescript
    app.use(cors({
      origin: process.env.ALLOWED_CLIENT_ORIGIN || 'https://jsw-mcms.jsw.in',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    ```
*   **API Rate Limiting:**
    *   Authentication endpoints: max 5 login requests per 15 minutes per IP address.
    *   Standard business API routes: capped at 100 requests per minute per IP address.

---

## 🛡️ 7. Secrets & Keys Management

*   **Production Environment Safeguards:** Database URIs, JWT signing secrets, cookie salts, and server ports are loaded strictly from `/apps/backend/.env` files and managed via secure cloud secret services in production.
*   **Encryption of Stored Hashes:** Password hashes utilize bcrypt with a salt round density of 10, ensuring database breaches do not compromise user credentials.
