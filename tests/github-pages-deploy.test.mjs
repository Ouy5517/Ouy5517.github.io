import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("creates a byte-identical 404 fallback for GitHub Pages routes", async () => {
  const distDir = await fs.mkdtemp(path.join(os.tmpdir(), "gugugaga-pages-"));
  const indexHtml = "<!doctype html><html><body>博客首页</body></html>";
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url><loc>https://ouy5517.github.io/</loc></url>
  <url><loc>https://ouy5517.github.io/articles</loc></url>
  <url><loc>https://ouy5517.github.io/articles/example-post</loc></url>
</urlset>`;

  try {
    await fs.writeFile(path.join(distDir, "index.html"), indexHtml, "utf8");
    await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
    await execFileAsync(process.execPath, ["scripts/prepare-github-pages.mjs"], {
      cwd: root,
      env: { ...process.env, GITHUB_PAGES_DIST_DIR: distDir },
    });

    assert.equal(await fs.readFile(path.join(distDir, "404.html"), "utf8"), indexHtml);
    assert.equal(await fs.readFile(path.join(distDir, "articles", "index.html"), "utf8"), indexHtml);
    assert.equal(
      await fs.readFile(path.join(distDir, "articles", "example-post", "index.html"), "utf8"),
      indexHtml,
    );
  } finally {
    await fs.rm(distDir, { recursive: true, force: true });
  }
});

test("GitHub Pages workflow builds the root-domain site from main", async () => {
  const workflow = await fs.readFile(
    path.join(root, ".github", "workflows", "deploy-github-pages.yml"),
    "utf8",
  );

  assert.match(workflow, /branches:\s*\[main\]/);
  assert.match(workflow, /SITE_URL:\s*https:\/\/ouy5517\.github\.io/);
  assert.match(workflow, /node-version:\s*"22"/);
  assert.match(workflow, /path:\s*\.\/dist/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
});
