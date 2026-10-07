// One-off diagnostic: per-statement Prisma latency for a DATABASE_URL.
// Usage: node scripts/latency.mjs <database-url>
// (argv, not env: WSL cannot pass env vars into Windows node.exe)
import { PrismaClient } from "@prisma/client";

const url = process.argv[2];
if (!url) throw new Error("usage: node scripts/latency.mjs <database-url>");
process.env.DATABASE_URL = url;
console.log(`target: ${url.replace(/:[^:@/]+@/, ":***@")}`);

const prisma = new PrismaClient();

const who = await prisma.$queryRaw`SELECT current_database() AS db, inet_server_addr() AS addr`;
console.log(`connected to: ${JSON.stringify(who)}`);

const t0 = Date.now();
await prisma.$queryRaw`SELECT 1`;
console.log(`first query (includes pool connect): ${Date.now() - t0}ms`);

for (let i = 1; i <= 6; i++) {
  const t = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  console.log(`query ${i}: ${Date.now() - t}ms`);
}

const tTx = Date.now();
await prisma.$transaction([
  prisma.$queryRaw`SELECT 1`,
  prisma.$queryRaw`SELECT 1`,
]);
console.log(`2-statement transaction: ${Date.now() - tTx}ms`);

await prisma.$disconnect();
