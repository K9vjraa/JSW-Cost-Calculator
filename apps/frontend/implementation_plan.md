# JSW MCMS Material Rates Redesign

This plan covers the transformation of the current Material Rates page into a complete **Raw Materials Master & Pricing Management System**, adhering closely to the existing ERP-style UI.

## Goal
To extend the Material Rates page to become the master source for all material pricing across the application, adding robust tracking, category classification, history logging, and real-time Grade Builder synchronization. All existing JSW styling, banners, navigation, and visual hierarchy will be strictly maintained.

> [!WARNING]
> **Database Schema Migration**
> We will need to add new fields (`category`, `currentRate`, `supplier`, `createdById`, `updatedById`) to the `RawMaterial` model in `schema.prisma`. 
> A Supabase DB migration will be generated for these changes.

## Open Questions
> [!IMPORTANT]
> **Metals vs. Raw Materials Integration**
> Currently, the Material Rates page displays a merged list of both `Metals` and `RawMaterials`. Should the new enhanced Material Master Table continue to display both, or should it strictly focus on `RawMaterial` entities, given that Metals also have prices?

> [!IMPORTANT]
> **Seed Data Initialization**
> We will create a backend seed script (e.g. `npm run seed:raw-materials`) to populate the 32 required raw materials (RM001 - RM032). Should any of these have specific starting prices, or should they default to `0` initially?

## Proposed Changes

### Database & Backend

---

#### [MODIFY] `schema.prisma`
- Add `category`, `supplier`, `currentRate` to `RawMaterial`.
- Add `createdById`, `updatedById` fields with `User` relations to track who created/updated a material.
- Add `effectiveDate` to `PriceHistory` if it's missing (it currently relies on `updatedAt`).

#### [NEW] `supabase/migrations/xxxx_add_raw_materials_columns.sql`
- Generate SQL migration mapping the Prisma changes into the Supabase PostgreSQL database.

#### [MODIFY] `metal.service.ts` & `metal.controller.ts`
- **RawMaterial CRUD**: Update creation and update logic to accept the new fields (`category`, `supplier`, etc.).
- **Price Adjustment Logic**: Refactor the price adjustment workflow so that updating a material's price will:
  1. Record the old and new rate in `PriceHistory`.
  2. Update the `currentRate` directly on the `RawMaterial`.
  3. Emit an Audit Log.
  4. Generate a Notification.
- **Seeding Endpoint/Script**: Create a mechanism to preload the `RM001` through `RM032` materials.

### Frontend

---

#### [MODIFY] `OperationsPages.tsx`
- **Material Rates View**:
  - Add the **[ Add Material ]** button beside the existing Sync Database and Price Adjuster buttons.
  - Implement the **Add Material Modal** with fields: Material Code (Auto-generated), Name, Category (Dropdown), Unit, Supplier, Current Rate, Description, Status.
  - Replace the "Active Locked Prices" simple table with the **Enhanced Material Master Table** (TanStack Table format) featuring Search and Category filters.
  - Update the **ERP Master Price History Logs Table** to show Old Rate, New Rate, Adjuster, Reason, Effective Date, Time.
  - Enhance the **Price Adjuster Modal** with the required fields.

#### [MODIFY] `WorkspacePage.tsx` (Grade Builder logic)
- **Live Sync**: Update the Grade Builder's material selection to dynamically fetch from the live `/masters/raw-materials` and `/masters/metals` endpoints.
- Ensure the formula `Material Cost = Quantity × Current Rate` strictly uses the backend's `currentRate`.

#### [MODIFY] `dashboard.ts` (Backend) / `Dashboards.tsx` (Frontend)
- Update the admin dashboard statistics to track Total Materials, Active Materials, and Price Updates This Month.

## Verification Plan

### Automated Tests
- Ensure Prisma schema successfully pushes/migrates without dropping tables.
- Run `npm run lint` and `npm run build` to confirm TS typings are satisfied.

### Manual Verification
- Log in as **Costing Department** user.
  - Verify ability to Add new material.
  - Verify ability to use the Price Adjuster to change a price.
  - Verify that the change generates a new History Log and Audit Log.
- Log in as **PDQC** user.
  - Verify that the Add Material and Edit Price buttons are hidden/disabled.
- Go to the **Calculation Workspace / Grade Builder**.
  - Verify that updating a price in the Material Rates page instantly updates the calculated cost when the material is selected.
