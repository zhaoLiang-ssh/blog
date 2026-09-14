/**
 * 检查构建产物内相对链接是否指向存在文件
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const siteDir = fs.existsSync(path.join(root, "_site"))
  ? path.join(root, "_site")
  : root;

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

const hrefRe = /(?:href|src)=["']([^"']+)["']/gi;
const skipRe = /^(https?:|mailto:|tel:|#|data:|javascript:)/i;

let errors = 0;
const pages = walk(siteDir);

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  let m;
  hrefRe.lastIndex = 0;
  while ((m = hrefRe.exec(html))) {
    let target = m[1].trim();
    if (!target || skipRe.test(target)) continue;
    target = target.split("#")[0].split("?")[0];
    if (!target) continue;
    const resolved = path.normalize(path.join(dir, target));
    if (!resolved.startsWith(siteDir) && !resolved.startsWith(root)) {
      // allow
    }
    if (!fs.existsSync(resolved)) {
      console.error(`BROKEN ${path.relative(root, file)} → ${target}`);
      errors++;
    }
  }
}

// sitemap vs pages
const smPath = path.join(siteDir, "sitemap.xml");
if (fs.existsSync(smPath)) {
  const sm = fs.readFileSync(smPath, "utf8");
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
  for (const loc of locs) {
    const name = loc.replace(/.*\//, "");
    const p = path.join(siteDir, name);
    if (!fs.existsSync(p)) {
      console.error(`SITEMAP missing file: ${name}`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\n${errors} link issue(s).`);
  process.exit(1);
}
console.log(`OK: checked ${pages.length} HTML files under ${path.relative(root, siteDir) || "."}`);
