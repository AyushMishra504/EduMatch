// Local dev database — starts an embedded Postgres (bundled native
// binaries, needs neither Docker nor sudo), creates the `edumatch` DB and
// applies Prisma migrations, then keeps running until Ctrl-C.
//
//   terminal 1:  npm run db:local
//   terminal 2:  npm run dev
//
// DATABASE_URL in .env.local must point at this cluster (127.0.0.1:5433).
// Data lives in ./.local-db (gitignored); delete the folder to reset.
import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import EmbeddedPostgres from "embedded-postgres";

const PORT = 5433;
const USER = "postgres";
const PASSWORD = "postgres";
const DB = "edumatch";

const databaseDir = path.resolve(process.cwd(), ".local-db");
const DATABASE_URL = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/${DB}?schema=public`;

const pg = new EmbeddedPostgres({
  databaseDir,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
  onLog: () => {},
});

if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
  console.log(`[local-db] initialising cluster in ${databaseDir} (first run only)…`);
  await pg.initialise();
}

console.log(`[local-db] starting postgres on 127.0.0.1:${PORT}…`);
await pg.start();

try {
  await pg.createDatabase(DB);
} catch (err) {
  if (!/already exists/i.test(String(err))) throw err;
}

console.log("[local-db] applying prisma migrations…");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true, // Windows: let cmd resolve npx.cmd
  env: { ...process.env, DATABASE_URL },
});
if (migrate.status !== 0) {
  console.error("[local-db] prisma migrate deploy failed");
  process.exit(migrate.status ?? 1);
}

console.log(`[local-db] ready → ${DATABASE_URL}`);
console.log("[local-db] leave this running, then run `npm run dev` (Ctrl-C stops the DB)");
