import { spawnSync } from "node:child_process";
import type { SpawnSyncOptions } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

type SeedEnv = {
  RUN_DB_SEED_AFTER_BUILD?: string;
  SKIP_DB_SEED?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  [key: string]: string | undefined;
};

export function shouldRunSeedAfterBuild(env: SeedEnv = process.env) {
  return getSeedSkipReason(env) === null;
}

export function getSeedSkipReason(env: SeedEnv = process.env) {
  if (env.SKIP_DB_SEED === "true") {
    return "SKIP_DB_SEED=true";
  }

  if (env.VERCEL === "1") {
    return "VERCEL=1";
  }

  if (env.VERCEL_ENV === "production") {
    return "VERCEL_ENV=production";
  }

  if (env.RUN_DB_SEED_AFTER_BUILD !== "true") {
    return "RUN_DB_SEED_AFTER_BUILD is not true";
  }

  return null;
}

export function getSeedSpawnOptions(platform: NodeJS.Platform = process.platform): {
  executable: string;
  args: string[];
  options: SpawnSyncOptions;
} {
  const isWindows = platform === "win32";

  return {
    executable: isWindows ? "cmd.exe" : "npx",
    args: isWindows
      ? ["/d", "/s", "/c", "npx.cmd", "prisma", "db", "seed"]
      : ["prisma", "db", "seed"],
    options: {
      env: process.env,
      shell: false,
      stdio: "inherit",
    },
  };
}

function runSeed() {
  const skipReason = getSeedSkipReason();

  if (skipReason) {
    console.log(`Skipping Prisma seed after build: ${skipReason}.`);
    return;
  }

  const seed = getSeedSpawnOptions();
  const result = spawnSync(seed.executable, seed.args, seed.options);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : null;
const modulePath = resolve(fileURLToPath(import.meta.url));

if (entryPath === modulePath) {
  runSeed();
}
