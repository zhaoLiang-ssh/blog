/**
 * 将 _site 同步到仓库根目录，兼容 GitHub Pages「Deploy from branch / root」
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const siteDir = path.join(root, "_site");

if (!fs.existsSync(siteDir)) {
  console.error("_site missing — run npm run build first");
  process.exit(1);
}

const skip = new Set([".git", "node_modules", "src", "scripts", "docs", "public", "_site", ".github", ".cursor"]);

for (const name of fs.readdirSync(siteDir)) {
  const from = path.join(siteDir, name);
  const to = path.join(root, name);
  fs.cpSync(from, to, { recursive: true });
}

console.log("synced _site → repo root");
