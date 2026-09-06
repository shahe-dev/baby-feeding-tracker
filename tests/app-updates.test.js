import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

// Execute the actual entry point, stubbing only rendering and unrelated imports.
const stubs = {
  react: "export class Component {}; export default { createElement() { return null; } };",
  "react-dom/client": "export function createRoot() { return { render() {} }; }",
  "./App.jsx": "export default function App() {}",
  "./storage.js": "export function exportRawRecovery() { return ''; }",
};
const compiled = await build({
  entryPoints: [new URL("../src/main.jsx", import.meta.url).pathname],
  bundle: true,
  write: false,
  format: "iife",
  loader: { ".css": "empty" },
  logLevel: "silent",
  plugins: [{
    name: "update-test-rendering-stubs",
    setup(builder) {
      builder.onResolve({ filter: /^(react|react-dom\/client|\.\/App\.jsx|\.\/storage\.js)$/ }, ({ path }) => ({ path, namespace: "stub" }));
      builder.onLoad({ filter: /.*/, namespace: "stub" }, ({ path }) => ({ contents: stubs[path], loader: "js" }));
    },
  }],
});

async function harness({ state = "installing", waiting = false } = {}) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: "https://example.test/baby-feeding-tracker/",
  });
  const { document, Event, EventTarget } = dom.window;
  Object.defineProperty(document, "readyState", { value: "complete" });
  const calls = { messages: [], reloads: 0 };
  const worker = Object.assign(new EventTarget(), {
    state,
    postMessage(message) { calls.messages.push(message.type); },
  });
  const registration = Object.assign(new EventTarget(), {
    installing: waiting ? null : worker,
    waiting: waiting ? worker : null,
    async update() {},
  });
  const serviceWorker = Object.assign(new EventTarget(), {
    controller: {},
    async register() { return registration; },
  });
  const window = Object.assign(new EventTarget(), {
    location: { reload() { calls.reloads++; } },
  });
  vm.runInNewContext(compiled.outputFiles[0].text, {
    window,
    document,
    navigator: { serviceWorker },
    console,
  });
  await new Promise((resolve) => setImmediate(resolve));
  return { dom, document, Event, worker, registration, serviceWorker, calls };
}

test("an installation already in progress when registration resolves still offers its update", async () => {
  const app = await harness();
  try {
    assert.equal(app.document.getElementById("app-update-banner"), null);
    app.worker.state = "installed";
    app.registration.waiting = app.worker;
    // updatefound happened before registration resolved; only statechange follows.
    app.worker.dispatchEvent(new app.Event("statechange"));
    const banner = app.document.getElementById("app-update-banner");
    assert.ok(banner);
    assert.deepEqual(app.calls.messages, []);
    banner.querySelector("button").click();
    assert.deepEqual(app.calls.messages, ["SKIP_WAITING"]);
    assert.equal(app.calls.reloads, 0);
    app.serviceWorker.dispatchEvent(new app.Event("controllerchange"));
    app.serviceWorker.dispatchEvent(new app.Event("controllerchange"));
    assert.equal(app.calls.reloads, 1);
  } finally {
    app.dom.window.close();
  }
});

test("a worker already installed when registration resolves offers an update immediately", async () => {
  const app = await harness({ state: "installed" });
  try {
    assert.ok(app.document.getElementById("app-update-banner"));
    assert.deepEqual(app.calls.messages, []);
    assert.equal(app.calls.reloads, 0);
  } finally {
    app.dom.window.close();
  }
});

test("an existing waiting update can be dismissed without activation or reload", async () => {
  const app = await harness({ state: "installed", waiting: true });
  try {
    const banner = app.document.getElementById("app-update-banner");
    assert.ok(banner);
    [...banner.querySelectorAll("button")].find((button) => button.textContent === "Later").click();
    assert.equal(app.document.getElementById("app-update-banner"), null);
    assert.deepEqual(app.calls.messages, []);
    assert.equal(app.calls.reloads, 0);
  } finally {
    app.dom.window.close();
  }
});
