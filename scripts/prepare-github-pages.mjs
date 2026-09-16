import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = process.env.GITHUB_PAGES_DIST_DIR
  ? path.resolve(process.env.GITHUB_PAGES_DIST_DIR)
  : path.join(root, "dist");

const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");

await fs.copyFile(indexPath, fallbackPath);
console.log(`GitHub Pages SPA fallback generated: ${fallbackPath}`);
