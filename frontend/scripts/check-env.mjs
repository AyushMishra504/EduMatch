// Failure guard for a real footgun: the Prisma CLI reads `prisma/.env`
// *instead of* `.env.local`, so a bare `npx prisma migrate …` can silently
// target a different database than the app. This compares the two and exits
// non-zero on a mismatch.
//
// Usage: npm run check:env
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readDatabaseUrl(relativePath) {
  const file = join(root, relativePath);
  if (!existsSync(file)) return null;
  const match = readFileSync(file, "utf8").match(
    /^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m,
  );
  return match ? match[1].trim() : null;
}

/** Host+port+database only — never print credentials. */
function fingerprint(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "5432"}${parsed.pathname}`;
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}

const app = readDatabaseUrl(".env.local");
const prisma = readDatabaseUrl("prisma/.env");

if (!app) {
  console.log("check:env — no .env.local found, skipping.");
  process.exit(0);
}
if (!prisma) {
  console.log(
    "check:env — no prisma/.env; the Prisma CLI will fall back to .env.local. OK.",
  );
  process.exit(0);
}

if (fingerprint(app) !== fingerprint(prisma)) {
  console.error(
    [
      "check:env — DATABASE_URL mismatch:",
      `  .env.local  -> ${fingerprint(app)}`,
      `  prisma/.env -> ${fingerprint(prisma)}`,
      "The app reads .env.local; the Prisma CLI reads prisma/.env.",
      "Sync them before running migrations.",
    ].join("\n"),
  );
  process.exit(1);
}

console.log(`check:env — ok (${fingerprint(app)})`);
