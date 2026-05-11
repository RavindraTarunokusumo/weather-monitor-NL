import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type SeedEnv = {
  SKIP_DB_SEED?: string;
  VERCEL_ENV?: string;
  [key: string]: string | undefined;
};

export function shouldRunSeedAfterBuild(env: SeedEnv = process.env) {
  if (env.SKIP_DB_SEED === "true") {
    return false;
  }

  return env.VERCEL_ENV !== "production";
}

function runSeed() {
  if (!shouldRunSeedAfterBuild()) {
    console.log("Skipping Prisma seed after production build.");
    return;
  }

  const executable = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(executable, ["prisma", "db", "seed"], {
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
const modulePath = resolve(fileURLToPath(import.meta.url));

if (entryPath === modulePath) {
  runSeed();
}
