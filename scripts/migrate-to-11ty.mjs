/**
 * 一次性迁移：把根目录扁平 HTML 拆成 11ty 源码（src/）
 * 用法：node scripts/migrate-to-11ty.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const pagesDir = path.join(srcDir, "pages");
const scriptsDir = path.join(srcDir, "_includes", "page-scripts");

const NAV_MAP = {
  "index.html": "home",
  "books.html": "books",
  "resources.html": "resources",
  "about.html": "about"
};

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function extract(re, html, group = 1) {
  const m = html.match(re);
  return m ? m[group].trim() : "";
}

function yamlEscape(s) {
  if (!s) return '""';
  return JSON.stringify(s);
}

function convertFile(filename) {
  const html = fs.readFileSync(path.join(root, filename), "utf8");
  const title = extract(/<title>([^<]*)<\/title>/i, html);
  const description = extract(/<meta\s+name="description"\s+content="([^"]*)"/i, html);
  const robots = extract(/<meta\s+name="robots"\s+content="([^"]*)"/i, html);
  const twitterDesc = extract(/<meta\s+name="twitter:description"\s+content="([^"]*)"/i, html);

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) throw new Error("no main in " + filename);
  const mainOpen = html.match(/<main\b[^>]*>/i)[0];
  const mainClass = extract(/class="([^"]*)"/i, mainOpen) || "container";
  const mainInner = mainMatch[1].trim();

  const footerDisc = extract(
    /<footer class="site-footer">\s*<p class="disclaimer">([\s\S]*?)<\/p>/i,
    html
  )
    .replace(/\s+/g, " ")
    .trim();
  const footerCopy = extract(/<p class="copy">([\s\S]*?)<\/p>/i, html)
    .replace(/\s+/g, " ")
    .trim();

  let pageScriptKey = null;
  const afterScript = html.split(/<script src="script\.js"><\/script>/i)[1] || "";
  const scriptBlocks = [...afterScript.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  if (scriptBlocks.length) {
    const base = filename.replace(/\.html$/, "");
    pageScriptKey = `page-scripts/${base}.js`;
    fs.writeFileSync(
      path.join(scriptsDir, `${base}.js`),
      scriptBlocks.map((m) => m[1].trim()).join("\n\n") + "\n",
      "utf8"
    );
  }

  const permalink = `/${filename}`;
  const nav = NAV_MAP[filename] || "";
  const isTool = mainClass.includes("tool-page");
  const noindex = /noindex/i.test(robots);

  const lines = [
    "---",
    `title: ${yamlEscape(title)}`,
    `description: ${yamlEscape(description)}`,
    twitterDesc && twitterDesc !== description
      ? `twitterDescription: ${yamlEscape(twitterDesc)}`
      : null,
    `permalink: ${JSON.stringify(permalink)}`,
    `mainClass: ${JSON.stringify(mainClass)}`,
    nav ? `nav: ${nav}` : null,
    isTool ? "toolPage: true" : null,
    noindex ? "noindex: true" : null,
    footerDisc ? `footerDisclaimer: ${yamlEscape(footerDisc)}` : null,
    footerCopy ? `footerCopy: ${yamlEscape(footerCopy)}` : null,
    pageScriptKey ? `pageScript: ${pageScriptKey}` : null,
    "layout: base.njk",
    "---",
    "",
    mainInner,
    ""
  ].filter((line) => line !== null);

  fs.writeFileSync(
    path.join(pagesDir, filename.replace(/\.html$/, ".njk")),
    lines.join("\n"),
    "utf8"
  );
  console.log("converted", filename, pageScriptKey ? `(${pageScriptKey})` : "");
}

ensureDir(pagesDir);
ensureDir(scriptsDir);

for (const f of fs.readdirSync(root).filter((x) => x.endsWith(".html"))) {
  convertFile(f);
}

console.log("Done.");
