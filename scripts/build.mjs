import { build } from "esbuild";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateIcons } from "./generate-icons.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = await build({
  absWorkingDir: root,
  entryPoints: ["src/main.jsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  write: false,
  outdir: "assets",
  entryNames: "app-[hash]",
  assetNames: "[name]-[hash]",
  format: "esm",
  target: ["safari15", "chrome100", "firefox100"],
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
  metafile: true,
});
const assets = result.outputFiles.map((file) => ({
  name: path.relative(root, file.path).split(path.sep).join("/"),
  contents: file.contents,
}));
const js = assets.find((file) => file.name.endsWith(".js"));
const css = assets.find((file) => file.name.endsWith(".css"));
if (!js || !css)
  throw new Error("Both a JavaScript bundle and a CSS bundle are required.");
const indexTemplate = await readFile(
  new URL("index.html", import.meta.url),
  "utf8",
);
const swTemplate = await readFile(
  new URL("service-worker.template.js", import.meta.url),
  "utf8",
);
await mkdir(path.join(root, "icons"), { recursive: true });
await generateIcons(new URL("../icons/", import.meta.url));
const staticFiles = [
  "manifest.json",
  "icons/app.svg",
  "icons/app-180.png",
  "icons/app-192.png",
  "icons/app-512.png",
];
const digest = createHash("sha256").update(indexTemplate).update(swTemplate);
for (const asset of [...assets].sort((a, b) => a.name.localeCompare(b.name)))
  digest.update(asset.name).update(asset.contents);
for (const name of staticFiles)
  digest.update(name).update(await readFile(path.join(root, name)));
const buildId = digest.digest("hex").slice(0, 20);
const index = indexTemplate
  .replaceAll("__BUILD_ID__", buildId)
  .replaceAll("__JS_ASSET__", "./" + js.name)
  .replaceAll("__CSS_ASSET__", "./" + css.name);
const precache = [
  "./index.html",
  ...assets
    .filter((file) => !file.name.endsWith(".LEGAL.txt"))
    .map((file) => "./" + file.name),
  ...staticFiles.map((name) => "./" + name),
];
const worker = swTemplate
  .replace("__BUILD_ID__", JSON.stringify(buildId))
  .replace("__PRECACHE_URLS__", JSON.stringify(precache, null, 2));
await mkdir(path.join(root, "assets"), { recursive: true });
for (const asset of assets)
  await writeFile(path.join(root, asset.name), asset.contents);
await writeFile(path.join(root, "index.html"), index);
await writeFile(path.join(root, "service-worker.js"), worker);
// Only remove stale generated files after the new build succeeds.
const generated = new Set(assets.map((file) => path.basename(file.name)));
for (const name of await readdir(path.join(root, "assets")))
  if (!generated.has(name)) await rm(path.join(root, "assets", name));
console.log(`Built ${buildId}: ${js.name}, ${css.name}`);
