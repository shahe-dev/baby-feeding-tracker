import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const template = await readFile(
  new URL("../scripts/service-worker.template.js", import.meta.url),
  "utf8",
);
const scope = "https://example.test/baby-feeding-tracker/";
const buildId = "test-build";
const precache = [
  "./index.html",
  "./assets/app-HASH.js",
  "./assets/app-HASH.css",
  "./manifest.json",
];
const cacheName =
  "baby-feeding-tracker-" +
  encodeURIComponent("/baby-feeding-tracker/") +
  "-" +
  buildId;
const html = `<meta name="app-build" content="${buildId}"><main>Tracker</main>`;

function harness({
  failUrl,
  mismatchIndex = false,
  failPut = false,
  oldCaches = [],
  workerSource,
  releaseFiles,
} = {}) {
  const listeners = new Map();
  const stores = new Map(oldCaches.map((name) => [name, new Map()]));
  const calls = { skipWaiting: 0, claim: 0, network: [], deleted: [] };
  let offline = false;
  const key = (request) =>
    typeof request === "string" ? request : request.url;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async put(request, response) {
          if (failPut && key(request).endsWith(".css"))
            throw new Error("Quota exceeded");
          store.set(key(request), response.clone());
        },
        async match(request) {
          return store.get(key(request))?.clone();
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      calls.deleted.push(name);
      return stores.delete(name);
    },
  };
  const self = {
    registration: { scope },
    clients: {
      async claim() {
        calls.claim++;
      },
    },
    async skipWaiting() {
      calls.skipWaiting++;
    },
    addEventListener(name, listener) {
      listeners.set(name, listener);
    },
  };
  const fetch = async (request) => {
    const url = key(request);
    calls.network.push(url);
    if (offline) throw new Error("Network unavailable");
    if (url === failUrl) return new Response("Unavailable", { status: 503 });
    if (releaseFiles) {
      return releaseFiles.has(url)
        ? new Response(releaseFiles.get(url))
        : new Response("Missing release file", { status: 404 });
    }
    if (url.endsWith("/index.html"))
      return new Response(
        mismatchIndex ? '<meta name="app-build" content="old">' : html,
      );
    return new Response(
      url.endsWith(".css") ? "body{color:green}" : "static file",
    );
  };
  vm.runInNewContext(
    workerSource || template
      .replace("__BUILD_ID__", JSON.stringify(buildId))
      .replace("__PRECACHE_URLS__", JSON.stringify(precache)),
    { self, caches, fetch, URL, Request, Set, Promise, Error },
  );
  return {
    stores,
    calls,
    setOffline() {
      offline = true;
    },
    async dispatch(name, data = {}) {
      let pending;
      listeners.get(name)({
        ...data,
        waitUntil(promise) {
          pending = promise;
        },
      });
      await pending;
    },
    request(url, { mode = "cors", method = "GET" } = {}) {
      let response;
      listeners.get("fetch")({
        request: { url, mode, method },
        respondWith(value) {
          response = value;
        },
      });
      return response;
    },
  };
}

test("the generated release installs and serves its actual HTML and assets offline", async () => {
  const root = new URL("../", import.meta.url);
  const workerSource = await readFile(new URL("service-worker.js", root), "utf8");
  const releasePaths = JSON.parse(workerSource.match(/const PRECACHE_URLS = (\[[\s\S]*?\]);/)[1]);
  const releaseFiles = new Map(await Promise.all(releasePaths.map(async (path) => [
    new URL(path, scope).href,
    await readFile(new URL(path, root)),
  ])));
  const app = harness({ workerSource, releaseFiles });
  await app.dispatch("install");
  assert.equal(app.calls.skipWaiting, 0);
  assert.equal(app.calls.network.length, releasePaths.length);
  await app.dispatch("activate");
  app.setOffline();
  const navigation = await app.request(scope, { mode: "navigate" });
  assert.equal(await navigation.text(), releaseFiles.get(scope + "index.html").toString());
  for (const [url, bytes] of releaseFiles) {
    const response = await app.request(url);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes);
  }
});

test("installation caches every required file and does not activate without consent", async () => {
  const app = harness();
  await app.dispatch("install");
  assert.equal(app.calls.skipWaiting, 0);
  assert.deepEqual(
    [...app.stores.get(cacheName).keys()].sort(),
    precache.map((path) => new URL(path, scope).href).sort(),
  );
  await app.dispatch("message", { data: { type: "SKIP_WAITING" } });
  assert.equal(app.calls.skipWaiting, 1);
});

test("missing required CSS rejects installation and preserves the previous cache", async () => {
  const app = harness({
    failUrl: new URL("./assets/app-HASH.css", scope).href,
    oldCaches: ["baby-feeding-tracker-v4"],
  });
  await assert.rejects(
    app.dispatch("install"),
    /Required offline file unavailable/,
  );
  assert.equal(app.stores.has(cacheName), false);
  assert.equal(app.stores.has("baby-feeding-tracker-v4"), true);
  assert.equal(app.calls.skipWaiting, 0);
});

test("partial cache writes are removed if storage is full", async () => {
  const app = harness({
    failPut: true,
    oldCaches: ["baby-feeding-tracker-v4"],
  });
  await assert.rejects(app.dispatch("install"), /Quota exceeded/);
  assert.equal(app.stores.has(cacheName), false);
  assert.equal(app.stores.has("baby-feeding-tracker-v4"), true);
});

test("an index from a different build cannot replace a working installation", async () => {
  const app = harness({
    mismatchIndex: true,
    oldCaches: ["baby-feeding-tracker-v4"],
  });
  await assert.rejects(app.dispatch("install"), /different builds/);
  assert.equal(app.stores.has(cacheName), false);
  assert.equal(app.stores.has("baby-feeding-tracker-v4"), true);
});

test("activation removes only this app scope and legacy tracker caches", async () => {
  const previous = cacheName.replace(buildId, "previous-build");
  const anotherScope = "baby-feeding-tracker-%2Fanother-tracker%2F-other-build";
  const app = harness({
    oldCaches: [
      previous,
      "baby-feeding-tracker-v4",
      "unrelated-app-cache",
      anotherScope,
    ],
  });
  await app.dispatch("install");
  await app.dispatch("activate");
  assert.equal(app.stores.has(cacheName), true);
  assert.equal(app.stores.has(previous), false);
  assert.equal(app.stores.has("baby-feeding-tracker-v4"), false);
  assert.equal(app.stores.has("unrelated-app-cache"), true);
  assert.equal(app.stores.has(anotherScope), true);
  assert.equal(app.calls.claim, 1);
});

test("query-string app shortcuts navigate offline using the matching cached HTML", async () => {
  const app = harness();
  await app.dispatch("install");
  app.setOffline();
  const response = await app.request(scope + "?view=history", {
    mode: "navigate",
  });
  assert.equal(await response.text(), html);
});

test("versioned assets work offline without returning HTML", async () => {
  const app = harness();
  await app.dispatch("install");
  app.setOffline();
  const response = await app.request(scope + "assets/app-HASH.css");
  assert.equal(await response.text(), "body{color:green}");
});

test("unknown assets and requests outside the app are not intercepted", async () => {
  const app = harness();
  await app.dispatch("install");
  app.setOffline();
  assert.equal(app.request(scope + "missing.js"), undefined);
  assert.equal(app.request("https://cdn.example.test/react.js"), undefined);
  assert.equal(
    app.request("https://example.test/another-app/?view=log", {
      mode: "navigate",
    }),
    undefined,
  );
  assert.equal(
    app.request(scope + "assets/app-HASH.js", { method: "POST" }),
    undefined,
  );
});

test("a missing asset in the active cache does not fall through to another app version", async () => {
  const app = harness({ oldCaches: ["baby-feeding-tracker-v4"] });
  await app.dispatch("install");
  const assetUrl = scope + "assets/app-HASH.js";
  app.stores.get(cacheName).delete(assetUrl);
  app.stores
    .get("baby-feeding-tracker-v4")
    .set(assetUrl, new Response("old JavaScript"));
  app.setOffline();
  await assert.rejects(app.request(assetUrl), /Network unavailable/);
});
