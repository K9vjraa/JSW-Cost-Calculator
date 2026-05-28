-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  PostgreSQL Initialization Script — Local Docker Dev                   ║
-- ║  Runs once on first container start (docker-entrypoint-initdb.d)       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝

-- Enable pg_stat_statements for query monitoring (optional, safe to remove)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create read-only role for reporting queries (optional)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mcms_reader') THEN
    CREATE ROLE mcms_reader NOLOGIN;
  END IF;
END
$$;

-- Grant read-only access to mcms schema on future tables
ALTER DEFAULT PRIVILEGES FOR ROLE mcms IN SCHEMA public
  GRANT SELECT ON TABLES TO mcms_reader;

-- Print confirmation
DO $$
BEGIN
  RAISE NOTICE 'JSW MCMS — PostgreSQL initialized successfully (%)' , current_timestamp;
END
$$;
