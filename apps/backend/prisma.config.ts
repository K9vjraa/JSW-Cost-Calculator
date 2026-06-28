import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  engineType: "library",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:admin123@localhost:5432/mcms_db?schema=public",
  },
});
