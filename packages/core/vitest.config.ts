import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Kökteki .env (TEST_DATABASE_URL) varsa okunur.
const rootEnv = new URL("../../.env", import.meta.url);
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

// Entegrasyon testleri tek bir test veritabanını paylaşır: dosyalar sırayla çalışır.
export default defineConfig({
  test: {
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 15_000,
  },
});
