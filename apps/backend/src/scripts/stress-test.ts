import jwt from "jsonwebtoken";
import axios from "axios";
import { env } from "../config/env.js";

// Generate admin test token
const token = jwt.sign(
  {
    sub: "00000000-0000-0000-0000-000000000000",
    email: "stress.admin@jsw.in",
    name: "Stress Tester",
    role: "COSTING_DEPARTMENT"
  },
  env.accessSecret,
  { expiresIn: "1h" }
);

const BASE_URL = `http://localhost:${env.port}`;
const CONCURRENT_USERS = 100;

interface TestMetrics {
  name: string;
  min: number;
  max: number;
  avg: number;
  successRate: number;
}

async function runBenchmarkForEndpoint(
  name: string,
  path: string,
  method: "GET" | "POST" = "GET",
  body?: any
): Promise<TestMetrics> {
  const latencies: number[] = [];
  let successes = 0;

  console.log(`Running benchmark on ${path} with ${CONCURRENT_USERS} concurrent requests...`);

  let loggedFirst = false;
  const requests = Array.from({ length: CONCURRENT_USERS }).map(async () => {
    const start = Date.now();
    try {
      const res = await axios({
        url: `${BASE_URL}${path}`,
        method,
        data: body,
        headers: {
          Authorization: `Bearer ${token}`
        },
        validateStatus: () => true // Don't throw on non-2xx to measure failure rates
      });
      const duration = Date.now() - start;
      latencies.push(duration);
      if (!loggedFirst) {
        loggedFirst = true;
        console.log(`Diagnostic [${name}] Status: ${res.status}, Body:`, res.data);
      }
      if (res.status === 200 || res.status === 201) {
        successes++;
      }
    } catch (err) {
      const duration = Date.now() - start;
      latencies.push(duration);
      if (!loggedFirst) {
        loggedFirst = true;
        console.log(`Diagnostic [${name}] Network/Axios Error:`, err instanceof Error ? err.message : err);
      }
    }
  });

  await Promise.all(requests);

  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = sum / latencies.length;
  const successRate = (successes / CONCURRENT_USERS) * 100;

  return { name, min, max, avg, successRate };
}

async function main() {
  console.log("=================================================");
  console.log("    MCMS Phase 5: Stress & Load Testing          ");
  console.log("=================================================");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENT_USERS} users\n`);

  try {
    const results: TestMetrics[] = [];

    // 1. Dashboard Admin
    results.push(await runBenchmarkForEndpoint("Dashboard Analytics", "/api/v1/dashboard/admin"));

    // 2. Cost Calculations List
    results.push(await runBenchmarkForEndpoint("Cost Calculations List", "/api/v1/calculations"));

    // 3. Reports List
    results.push(await runBenchmarkForEndpoint("Reports List", "/api/v1/reports"));

    // 4. Report Exports
    results.push(await runBenchmarkForEndpoint("Calculations Export CSV", "/api/v1/exports/calculations/csv"));

    // Display Results in Markdown Table format for the report
    console.log("\n\n=================================================");
    console.log("            PERFORMANCE METRICS REPORT           ");
    console.log("=================================================\n");
    console.log("| Endpoint | Min Latency (ms) | Max Latency (ms) | Avg Latency (ms) | Success Rate (%) |");
    console.log("| --- | --- | --- | --- | --- |");
    results.forEach((r) => {
      console.log(
        `| ${r.name} | ${r.min.toFixed(0)}ms | ${r.max.toFixed(0)}ms | ${r.avg.toFixed(1)}ms | ${r.successRate.toFixed(1)}% |`
      );
    });
    console.log("\n=================================================");
  } catch (error) {
    console.error("Stress test execution failed:", error);
    process.exit(1);
  }
}

main();
