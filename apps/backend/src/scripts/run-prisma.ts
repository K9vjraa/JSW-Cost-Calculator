import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

// Simple env file parser to load variables on the host during Prisma CLI runs
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const firstEqual = trimmed.indexOf("=");
    if (firstEqual === -1) continue;
    const key = trimmed.substring(0, firstEqual).trim();
    let val = trimmed.substring(firstEqual + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL environment variable is not defined!");
  process.exit(1);
}

const args = process.argv.slice(2);
console.log(`[PRISMA WRAPPER] Running npx prisma ${args.join(" ")} with dynamic URL: ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":****@")}`);

const result = spawnSync("npx", ["prisma", ...args], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 0);
