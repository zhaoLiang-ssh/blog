import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "src", "pages", "index.njk");
let s = fs.readFileSync(indexPath, "utf8");

const map = [
  ["emergency.html", "emergency"],
  ["anxiety.html", "anxiety"],
  ["sleep.html", "sleep"],
  ["lowmood.html", "lowmood"],
  ["mindfulness.html", "mindfulness"],
  ["thoughtlog.html", "thoughtlog"],
  ["selfcare.html", "selfcare"],
  ["action.html", "action"],
  ["relationship.html", "relationship"],
  ["meaning.html", "meaning"]
];

for (const [href, icon] of map) {
  const re = new RegExp(
    `(<a class="tool-card" href="${href.replace(".", "\\.")}">\\s*<span class="tool-emoji" aria-hidden="true">)<svg[\\s\\S]*?<\\/svg>(</span>)`,
    "i"
  );
  if (!re.test(s)) {
    console.error("no match", href);
    process.exitCode = 1;
    continue;
  }
  s = s.replace(re, `$1{% icon "${icon}" %}$2`);
  console.log("ok", icon);
}

fs.writeFileSync(indexPath, s);

// tool page page-tag icons
const pageIcons = {
  "emergency.njk": "emergency",
  "anxiety.njk": "anxiety",
  "sleep.njk": "sleep",
  "lowmood.njk": "lowmood",
  "mindfulness.njk": "mindfulness",
  "thoughtlog.njk": "thoughtlog",
  "selfcare.njk": "selfcare",
  "action.njk": "action",
  "relationship.njk": "relationship",
  "meaning.njk": "meaning",
  "resources.njk": "resources",
  "books.njk": "books"
};

for (const [file, icon] of Object.entries(pageIcons)) {
  const fp = path.join(root, "src", "pages", file);
  if (!fs.existsSync(fp)) continue;
  let t = fs.readFileSync(fp, "utf8");
  const re = /(<span class="page-tag">)<svg[\s\S]*?<\/svg>/i;
  if (!re.test(t)) {
    console.log("skip page-tag", file);
    continue;
  }
  t = t.replace(re, `$1{% icon "${icon}" %}`);
  fs.writeFileSync(fp, t);
  console.log("page-tag", icon);
}
