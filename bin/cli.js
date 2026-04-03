#!/usr/bin/env node
/**
 * boneyard-vue CLI
 *
 * Visits your running Vue app at every breakpoint, captures all named
 * <BoneyardSkeleton> components, and writes responsive bones JSON files to disk.
 *
 * Usage:
 *   npx boneyard-vue build [url] [options]
 *   npx boneyard-vue build                          <- auto-detects your dev server
 *   npx boneyard-vue build http://localhost:5173     <- explicit URL
 *
 * Options:
 *   --out <dir>          Where to write .bones.json files (default: auto-detected)
 *   --breakpoints <bp>   Viewport widths to capture, comma-separated (default: 375,768,1280)
 *   --wait <ms>          Extra ms to wait after page load (default: 800)
 *
 * Requires playwright:
 *   npm install -D playwright && npx playwright install chromium
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { resolve, join, dirname } from "path";
import http from "http";
import https from "https";

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

if (command !== "build") {
  console.error(`boneyard-vue: unknown command "${command}". Try: npx boneyard-vue build`);
  process.exit(1);
}

// ── Parse args ────────────────────────────────────────────────────────────────

const urls = [];
let outDir = existsSync(resolve(process.cwd(), "src")) ? "./src/bones" : "./bones";
let breakpoints = null;
let waitMs = 800;

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--out") {
    outDir = args[++i];
  } else if (args[i] === "--breakpoints") {
    breakpoints = args[++i]
      .split(",")
      .map(Number)
      .filter((n) => n > 0);
  } else if (args[i] === "--wait") {
    waitMs = Math.max(0, Number(args[++i]) || 800);
  } else if (!args[i].startsWith("--")) {
    try {
      new URL(args[i]);
      urls.push(args[i]);
    } catch {
      console.error(
        `  boneyard-vue: "${args[i]}" is not a valid URL. Use http://localhost:5173 format.`,
      );
      process.exit(1);
    }
  }
}

// ── Auto-detect breakpoints from Tailwind ────────────────────────────────────

const TAILWIND_DEFAULTS = [640, 768, 1024, 1280, 1536];

async function detectTailwindBreakpoints() {
  const cssConfigPaths = [
    "src/app/globals.css",
    "src/globals.css",
    "app/globals.css",
    "styles/globals.css",
    "src/index.css",
    "src/assets/main.css",
    "src/style.css",
    "index.css",
  ];

  for (const p of cssConfigPaths) {
    const full = resolve(process.cwd(), p);
    if (!existsSync(full)) continue;
    try {
      const css = readFileSync(full, "utf-8");
      if (
        css.includes('@import "tailwindcss"') ||
        css.includes("@import 'tailwindcss'") ||
        css.includes("@tailwind")
      ) {
        return TAILWIND_DEFAULTS;
      }
    } catch {
      // skip unreadable files
    }
  }

  try {
    const pkgPath = resolve(process.cwd(), "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps["tailwindcss"]) return TAILWIND_DEFAULTS;
    }
  } catch {
    // skip parse errors
  }

  return null;
}

if (!breakpoints) {
  const tw = await detectTailwindBreakpoints();
  if (tw) {
    breakpoints = [375, ...tw];
    process.stdout.write(
      `  boneyard-vue: detected Tailwind — using breakpoints: ${breakpoints.join(", ")}px\n`,
    );
  } else {
    breakpoints = [375, 768, 1280];
  }
}

// ── Auto-detect dev server ────────────────────────────────────────────────────

function probe(url) {
  return new Promise((res) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { timeout: 1500 }, (response) => {
      response.destroy();
      res(true);
    });
    req.on("error", () => res(false));
    req.on("timeout", () => {
      req.destroy();
      res(false);
    });
  });
}

// Vite-first port detection order
const DEV_PORTS = [5173, 5174, 3000, 3001, 4173, 8080, 8000, 4200];

async function detectDevServer() {
  for (const port of DEV_PORTS) {
    const url = `http://localhost:${port}`;
    const ok = await probe(url);
    if (ok) return url;
  }
  return null;
}

if (urls.length === 0) {
  process.stdout.write("  boneyard-vue: no URL provided — scanning for dev server...");
  const detected = await detectDevServer();
  if (detected) {
    process.stdout.write(` found ${detected}\n`);
    urls.push(detected);
  } else {
    process.stdout.write(" none found\n\n");
    console.error(
      "  boneyard-vue: could not find a running dev server.\n\n" +
        "  Start your dev server first, then run:\n" +
        "    npx boneyard-vue build\n\n" +
        "  Or pass your URL explicitly:\n" +
        "    npx boneyard-vue build http://localhost:5173\n",
    );
    process.exit(1);
  }
}

// ── Load playwright ───────────────────────────────────────────────────────────

let chromium;
try {
  const pw = await import("playwright");
  chromium = pw.chromium;
} catch {
  console.error(
    "\nboneyard-vue: playwright not found.\n\n" +
      "Install it:\n" +
      "  npm install -D playwright\n" +
      "  npx playwright install chromium\n",
  );
  process.exit(1);
}

// ── Capture ───────────────────────────────────────────────────────────────────

console.log(`\n  \x1b[1m💀 boneyard-vue build\x1b[0m`);
console.log(`  \x1b[2m${"─".repeat(50)}\x1b[0m`);
console.log(`  \x1b[2mbreakpoints\x1b[0m  ${breakpoints.join(", ")}px`);
console.log(`  \x1b[2moutput\x1b[0m       ${outDir}\n`);

let browser;
try {
  browser = await chromium.launch();
} catch (e) {
  if (e.message.includes("Executable doesn't exist")) {
    console.log("  boneyard-vue: installing chromium...\n");
    const { execSync } = await import("child_process");
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const pwPath = dirname(require.resolve("playwright/package.json"));
    const playwrightCli = join(pwPath, "cli.js");
    execSync(`node "${playwrightCli}" install chromium`, { stdio: "inherit" });
    browser = await chromium.launch();
  } else {
    throw e;
  }
}
const page = await browser.newPage();

await page.addInitScript(() => {
  window.__BONEYARD_BUILD = true;
});

const collected = {};

const visited = new Set();
const toVisit = [...urls];

async function capturePage(pageUrl) {
  const pageSkeletons = new Map();
  const shortPath = pageUrl.replace(new URL(pageUrl).origin, "") || "/";
  console.log(`  ${shortPath}`);

  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: 900 });

    try {
      await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15_000 });
    } catch {
      // networkidle can timeout on heavy pages — still try to capture
    }

    if (waitMs > 0) await page.waitForTimeout(waitMs);

    const captureResult = await page.evaluate(() => {
      const fn = window.__BONEYARD_SNAPSHOT;
      if (!fn) return { results: {}, duplicates: [] };

      const elements = document.querySelectorAll("[data-boneyard]");
      const results = {};
      const duplicates = [];

      for (const el of elements) {
        const name = el.getAttribute("data-boneyard");
        if (!name) continue;

        if (results[name]) {
          duplicates.push(name);
          continue;
        }

        let config;
        const configStr = el.getAttribute("data-boneyard-config");
        if (configStr) {
          try {
            config = JSON.parse(configStr);
          } catch {
            // skip malformed config
          }
        }

        const target = el.firstElementChild;
        if (!target) continue;

        try {
          results[name] = fn(target, name, config);
        } catch {
          // skip on error
        }
      }

      return { results, duplicates: [...new Set(duplicates)] };
    });

    const bones = captureResult.results;

    if (captureResult.duplicates.length > 0) {
      for (const dup of captureResult.duplicates) {
        console.log(`    \u26a0  Duplicate name "${dup}" — only the first occurrence was captured`);
      }
    }

    const SAFE_NAME = /^[a-zA-Z0-9_-]+$/;
    const names = Object.keys(bones).filter((name) => {
      if (!SAFE_NAME.test(name)) {
        console.log(`    \u26a0  Skipping skeleton with unsafe name: "${name}"`);
        return false;
      }
      return true;
    });

    if (names.length === 0) {
      continue;
    }

    for (const name of names) {
      collected[name] ??= { breakpoints: {} };
      collected[name].breakpoints[width] = bones[name];
      const boneCount = bones[name].bones?.length ?? 0;
      if (!pageSkeletons.has(name)) {
        pageSkeletons.set(name, { counts: [] });
      }
      pageSkeletons.get(name).counts.push(boneCount);
    }
  }

  if (pageSkeletons.size === 0) {
    console.log(`    –  No skeletons found`);
  } else {
    for (const [name, info] of pageSkeletons) {
      const min = Math.min(...info.counts);
      const max = Math.max(...info.counts);
      const boneStr = min === max ? `${min} bones` : `${min} \u2192 ${max} bones (responsive)`;
      console.log(`    \u2713  ${name.padEnd(24)} ${boneStr}`);
    }
  }
}

async function discoverLinks(pageUrl) {
  try {
    await page.goto(pageUrl, { waitUntil: "networkidle", timeout: 15_000 });
  } catch {
    // timeout ok
  }
  if (waitMs > 0) await page.waitForTimeout(waitMs);

  const origin = new URL(pageUrl).origin;
  const links = await page.evaluate((orig) => {
    return [...document.querySelectorAll("a[href]")]
      .map((a) => a.href)
      .filter((href) => href.startsWith(orig))
      .map((href) => {
        const u = new URL(href);
        u.hash = "";
        u.search = "";
        return u.toString();
      });
  }, origin);

  return [...new Set(links)];
}

const startUrl = urls[0];
const startOrigin = new URL(startUrl).origin;

console.log(`  \x1b[2mCrawling ${startOrigin}\x1b[0m\n`);

for (const url of urls) {
  if (!visited.has(url)) {
    const links = await discoverLinks(url);
    for (const link of links) {
      if (!visited.has(link) && !toVisit.includes(link)) {
        toVisit.push(link);
      }
    }
  }
}

for (const pageUrl of toVisit) {
  if (visited.has(pageUrl)) continue;
  visited.add(pageUrl);
  await capturePage(pageUrl);
}

await browser.close();

// ── Write files ───────────────────────────────────────────────────────────────

if (Object.keys(collected).length === 0) {
  console.error(
    "\n  boneyard-vue: nothing captured.\n\n" +
      '  Make sure your components have <BoneyardSkeleton name="my-component" :loading="false">\n' +
      "  so boneyard-vue can snapshot them before the CLI reads the registry.\n",
  );
  process.exit(1);
}

// ── Validate bones ──────────────────────────────────────────────────────────

let hasWarnings = false;
for (const [name, data] of Object.entries(collected)) {
  for (const [bp, result] of Object.entries(data.breakpoints)) {
    const bones = result.bones;
    if (!bones || bones.length === 0) continue;
    const maxRight = Math.max(...bones.map((b) => b.x + b.w));
    if (maxRight < 50) {
      if (!hasWarnings) {
        console.log(`\n  \x1b[33m\u26a0  Bone coverage warnings:\x1b[0m`);
        hasWarnings = true;
      }
      console.log(
        `     "${name}" at ${bp}px: bones only cover ${maxRight.toFixed(0)}% of container width`,
      );
      console.log(
        `     This usually means the skeleton was captured from a container wider than its content.`,
      );
      console.log(
        `     Check that the element rendered inside <BoneyardSkeleton name="${name}"> fills its container.\n`,
      );
    }
  }
}

const outputDir = resolve(process.cwd(), outDir);
if (!outputDir.startsWith(resolve(process.cwd()))) {
  console.error("  boneyard-vue: --out path must be inside the current working directory");
  process.exit(1);
}
mkdirSync(outputDir, { recursive: true });

console.log(`\n  \x1b[2m${"─".repeat(50)}\x1b[0m`);
console.log(`  \x1b[1mWriting files\x1b[0m\n`);
for (const [name, data] of Object.entries(collected)) {
  const outPath = join(outputDir, `${name}.bones.json`);
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  const bpCount = Object.keys(data.breakpoints).length;
  console.log(
    `  \x1b[32m\u2192\x1b[0m ${name}.bones.json  \x1b[2m(${bpCount} breakpoint${bpCount !== 1 ? "s" : ""})\x1b[0m`,
  );
}

// ── Generate registry.ts ─────────────────────────────────────────────────────

const names = Object.keys(collected);
const registryLines = [
  "// Auto-generated by `npx boneyard-vue build` — do not edit",
  "import { registerBones } from 'boneyard-vue/vue'",
  "",
];
for (const name of names) {
  const varName = "_" + name.replace(/[^a-zA-Z0-9]/g, "_");
  registryLines.push(`import ${varName} from './${name}.bones.json'`);
}
registryLines.push("");
registryLines.push("registerBones({");
for (const name of names) {
  const varName = "_" + name.replace(/[^a-zA-Z0-9]/g, "_");
  registryLines.push(`  "${name}": ${varName},`);
}
registryLines.push("})");
registryLines.push("");

const registryPath = join(outputDir, "registry.ts");
writeFileSync(registryPath, registryLines.join("\n"));
console.log(
  `  \x1b[32m\u2192\x1b[0m registry.ts  \x1b[2m(${names.length} skeleton${names.length !== 1 ? "s" : ""})\x1b[0m`,
);

const count = names.length;
console.log(`\n  \x1b[32m\x1b[1m💀 ${count} skeleton${count !== 1 ? "s" : ""} captured.\x1b[0m\n`);
console.log(`  \x1b[2mAdd once to your app entry:\x1b[0m  import '${outDir}/registry'`);
console.log(
  `  \x1b[2mThen just use:\x1b[0m              <BoneyardSkeleton name="..." :loading="isLoading">\n`,
);

// ── Help ──────────────────────────────────────────────────────────────────────

function printHelp() {
  console.log(`
  boneyard-vue build [url] [options]

  Visits your Vue app in a headless browser, captures all named <BoneyardSkeleton>
  components, and writes .bones.json files + a registry to disk.

  Auto-detects your dev server if no URL is given (scans ports 5173, 3000, etc.).

  Options:
    --out <dir>          Output directory             (default: ./src/bones)
    --breakpoints <bp>   Comma-separated px widths    (default: 375,768,1280)
    --wait <ms>          Extra wait after page load   (default: 800)

  Examples:
    npx boneyard-vue build
    npx boneyard-vue build http://localhost:5173
    npx boneyard-vue build --breakpoints 390,820,1440 --out ./public/bones

  Setup:
    1. Wrap your component:
       <BoneyardSkeleton name="blog-card" :loading="isLoading">
         <BlogCard />
       </BoneyardSkeleton>

    2. Run: npx boneyard-vue build

    3. Import the registry once in your app entry:
       import './bones/registry'

    Done. Every <BoneyardSkeleton name="..."> auto-resolves its bones.
`);
}
