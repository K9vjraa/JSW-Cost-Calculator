# Database Backup & Recovery Guide

This guide details the procedure to perform daily backups, run verification checks, and execute database restores for the JSW Metal Cost Management System (MCMS) database.

---

## 1. Backup Procedure

To back up the database, a PowerShell script is provided to automate `pg_dump` execution in a non-interactive mode.

### Execution Command

Run the backup script from the workspace directory:

```powershell
powershell -ExecutionPolicy Bypass -File .\apps\backend\src\scripts\db-backup.ps1
```

### Script Actions

1. Extracts the database connection parameters (host, port, user, password, database name) from the `DATABASE_URL` environment variable.
2. Formats a dump file name using the current timestamp, e.g., `mcms_backup_20260604_154500.dump`.
3. Runs `pg_dump` in **custom custom-binary format (`-F c`)** which compresses the backup and allows selective restore features.
4. Checks the integrity by verifying that the resulting file exists and has a size greater than 0 bytes.

---

## 2. Restore Procedure

To restore the database (e.g., in a disaster recovery scenario or when seeding a staging database), use the restore script.

> [!CAUTION]
> Rebuilding or restoring the database drops existing schemas and tables. Make sure to back up active data before starting.

### Execution Command

Run the restore script with the backup dump file parameter:

```powershell
powershell -ExecutionPolicy Bypass -File .\apps\backend\src\scripts\db-restore.ps1 -BackupFile "path/to/mcms_backup_YYYYMMDD_HHMMSS.dump"
```

### Script Actions

1. Validates that the specified backup file exists.
2. Extracts credentials and configures connection settings.
3. Automatically launches `pg_restore` using `--clean` (`-c`) and `--if-exists` options. This drops all old tables in the `public` schema and rebuilds them fresh from the backup file, ensuring no duplication or primary key conflicts.

---

## 3. Backup Verification Checks

To guarantee backup reliability:

1. **Size Verification**: Verify that the file size is non-zero (automated by script).
2. **Prisma Synchronisation Check**: Run a quick validation check by performing a database connectivity ping using Prisma:

   ```bash
   npm run dev --workspace @jsw-mcms/backend
   ```

   If the backend boots without connection errors, the schema is valid and active.

---

## 4. Migration Rollback Plan

When deploying database schema changes using Prisma in production environments, there is a risk of a migration failing midway (e.g., due to lock timeouts, column constraints violations, or node crashes). In such cases, follow this rollback plan:

### Step 1: Identify the Failed Migration

If a migration fails, the database might be left in a half-migrated state. Prisma registers this state in the `_prisma_migrations` table where the `finished_at` column for the failed migration is set to `NULL`.

Run the following command to check migration status:

```bash
npx prisma migrate status --schema=apps/backend/prisma/schema.prisma
```

### Step 2: Revert Database Schema Manually

Since Prisma does not automatically rollback partial SQL changes on failure, you must manually run the SQL commands to undo whatever portions of the migration were applied.

1. Inspect the SQL file in `apps/backend/prisma/migrations/<migration_folder>/migration.sql`.
2. Write a compensating SQL script to revert changes (e.g., `DROP TABLE`, `ALTER TABLE ... DROP COLUMN`).
3. Connect to your database client and run the SQL commands within a transaction block if supported.

### Step 3: Resolve the Migration in Prisma

To tell Prisma that you have manually reverted the failed migration, mark it as rolled back in the internal tracking table:

```bash
npx prisma migrate resolve --rolled-back "<migration_folder_name>" --schema=apps/backend/prisma/schema.prisma
```

*(Example: `npx prisma migrate resolve --rolled-back "20260604120000_add_audit_indices"`)*

### Step 4: Apply Corrected Migration or Restore Backup

Once the database state is cleaned and Prisma's tracker is updated:

* If the failed migration was due to a minor SQL bug, fix it in the migration folder and run `npx prisma migrate deploy` to try again.
* If the schema state is severely corrupted and manual SQL revert is not feasible, restore the database from the last daily backup:

  ```powershell
  powershell -ExecutionPolicy Bypass -File .\apps\backend\src\scripts\db-restore.ps1 -BackupFile "path/to/mcms_backup_YYYYMMDD_HHMMSS.dump"
  ```
