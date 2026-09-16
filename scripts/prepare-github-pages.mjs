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

const sitemap = await fs.readFile(path.join(distDir, "sitemap.xml"), "utf8");
const routePaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => new URL(match[1]).pathname.replace(/^\/+|\/+$/g, ""))
  .filter(Boolean);

let generatedRoutes = 0;
for (const routePath of routePaths) {
  const routeDir = path.resolve(distDir, routePath);
  const relativeRouteDir = path.relative(distDir, routeDir);
  if (relativeRouteDir.startsWith("..") || path.isAbsolute(relativeRouteDir)) continue;

  await fs.mkdir(routeDir, { recursive: true });
  await fs.copyFile(indexPath, path.join(routeDir, "index.html"));
  generatedRoutes += 1;
}

console.log(`GitHub Pages SPA fallback generated with ${generatedRoutes} route entries.`);
