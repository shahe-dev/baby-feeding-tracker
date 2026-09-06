import test, { before, after, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { mkdir } from "node:fs/promises";
import { emptyData, STORAGE_KEY, PREVIOUS_KEY } from "../src/storage.js";
import { FOOD_DATABASE } from "../src/catalog.js";
import {
  localDateKey,
  toLocalInputValue,
  getAllergenStatuses,
  getFoodStatuses,
  getAllergenStats,
} from "../src/domain.js";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://example.test/tracker/",
  pretendToBeVisual: true,
});
for (const key of [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLSelectElement",
  "HTMLTextAreaElement",
  "Event",
  "MouseEvent",
  "localStorage",
]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
  });
}
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
dom.window.scrollTo = () => {};
dom.window.confirm = () => true;
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const { default: React, act } = await import("react");
const { createRoot } = await import("react-dom/client");
let App, root, host;

before(async () => {
  await mkdir(new URL("../.test-output/", import.meta.url), {
    recursive: true,
  });
  await build({
    entryPoints: ["src/App.jsx"],
    bundle: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    outfile: ".test-output/App.mjs",
    external: ["react", "react-dom"],
    loader: { ".css": "empty" },
    logLevel: "silent",
  });
  App = (await import("../.test-output/App.mjs")).default;
});
beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="test-root"></div>';
  host = document.getElementById("test-root");
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
});
after(() => dom.window.close());

async function mount(data = emptyData()) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  await act(async () => root.render(React.createElement(App)));
}
function field(label, scope = document) {
  const element = [...scope.querySelectorAll("label")].find(
    (item) => item.textContent.trim() === label,
  );
  assert.ok(element, `Missing label: ${label}`);
  const control = element.htmlFor
    ? document.getElementById(element.htmlFor)
    : element.querySelector("input,select,textarea");
  assert.ok(control, `Missing control for ${label}`);
  return control;
}
function button(text, scope = document) {
  const result = [...scope.querySelectorAll("button")].find(
    (item) => item.textContent.trim() === text,
  );
  assert.ok(result, `Missing button: ${text}`);
  return result;
}
async function click(element) {
  await act(async () =>
    element.dispatchEvent(
      new dom.window.MouseEvent("click", { bubbles: true }),
    ),
  );
}
async function fill(element, value) {
  const prototype =
    element.tagName === "SELECT"
      ? dom.window.HTMLSelectElement.prototype
      : element.tagName === "TEXTAREA"
        ? dom.window.HTMLTextAreaElement.prototype
        : dom.window.HTMLInputElement.prototype;
  await act(async () => {
    element.focus();
    Object.getOwnPropertyDescriptor(prototype, "value").set.call(
      element,
      value,
    );
    element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    element.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  });
}
async function submit(form) {
  await act(async () =>
    form.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true }),
    ),
  );
}
const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY));
function toddlerData() {
  const data = emptyData();
  const birth = new Date();
  birth.setMonth(birth.getMonth() - 14);
  birth.setDate(1);
  data.babyProfile.birthDate = localDateKey(birth);
  return data;
}

test("profile typing retains focus and saving weight preserves the unsaved height", async () => {
  await mount(toddlerData());
  await click(button("Profile"));
  const name = field("Child’s name");
  await fill(name, "A");
  await fill(name, "Al");
  await fill(name, "Alex");
  assert.equal(document.activeElement, name);
  assert.equal(field("Child’s name"), name);
  await submit(name.closest("form"));
  assert.equal(saved().babyProfile.name, "Alex");
  const weight = field("Weight (kg)"),
    height = field("Height (cm)");
  await fill(weight, "10.5");
  await fill(height, "78");
  await submit(weight.closest("form"));
  assert.equal(saved().babyProfile.weight.at(-1).value, 10.5);
  assert.equal(field("Height (cm)").value, "78");
  assert.equal(field("Height (cm)"), height);
});

test("feeding instructions survive profile saves and remain available beside meal ideas", async () => {
  await mount(toddlerData());
  await click(button("Profile"));
  const notes = field("Your feeding instructions");
  await fill(notes, "Continue the existing prescribed feed. Review plan at next appointment.");
  await fill(field("Weight (kg)"), "10");
  await submit(field("Weight (kg)").closest("form"));
  assert.match(field("Your feeding instructions").value, /Continue the existing/);
  await submit(notes.closest("form"));
  assert.equal(saved().babyProfile.feedingNotes, notes.value);
  await click(button("Meals"));
  assert.match(document.querySelector(".personal-instructions").textContent, /Continue the existing/);
});

test("daily food prompts distinguish confirmed eating from offered, refused and unknown intake", async () => {
  const data = toddlerData();
  const date = new Date().toISOString();
  data.feedingLog = [
    { id: "eaten-beef", foods: ["beef"], consumption: "eaten" },
    { id: "offered-lentils", foods: ["lentils"], consumption: "offered" },
    { id: "refused-carrots", foods: ["carrots"], consumption: "refused" },
    { id: "unknown-banana", foods: ["banana"], consumption: "unknown" },
  ].map((feed) => ({ ...feed, date, mealType: "lunch", amount: "", description: "", notes: "", reaction: "None observed", reactionSeverity: "" }));
  await mount(data);
  const pattern = document.querySelector(".daily-pattern");
  assert.match(pattern.textContent, /Eaten: Beef/);
  assert.match(pattern.textContent, /Offered only: Lentils/);
  assert.match(pattern.textContent, /Offered only: Carrots/);
  assert.ok(!pattern.textContent.includes("Banana"));
  assert.ok(!pattern.textContent.includes("Eaten: Carrots"));
});

test("research is available in the app with age scope and only the selected source families", async () => {
  await mount(toddlerData());
  await click(button("Profile"));
  assert.match(document.body.textContent, /Reference values for 12–23 months/);
  assert.match(document.body.textContent, /6 g of peanut protein/);
  assert.match(document.body.textContent, /Original research summary \(archive\)/);
  assert.match(document.body.textContent, /newly|identified during the further/i);
  for (const a of document.querySelectorAll("a[href]")) {
    assert.ok(!/nhs\.uk|cdc\.gov|fda\.gov/.test(a.href), a.href);
  }
  const registry = document.querySelector(".source-context");
  assert.ok(registry?.textContent.trim(), "Source context must explain study scope");
});

test("a backdated meal can be saved, edited and reviewed with its actual amount", async () => {
  await mount(toddlerData());
  await click(button("Diary"));
  await click(button("Add entry"));
  const dialog = document.querySelector("dialog");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 30, 0, 0);
  await fill(field("Date and time", dialog), toLocalInputValue(yesterday));
  await fill(field("Meal or drink", dialog), "lunch");
  await click(button("Banana", dialog));
  await fill(field("What happened?", dialog), "eaten");
  await fill(field("Amount (optional)", dialog), "Half a banana");
  await submit(dialog.querySelector("form"));
  assert.ok(
    document.querySelector("dialog") === null,
    "Saved editor should close: " +
      document.querySelector("dialog")?.textContent.slice(-350),
  );
  assert.equal(saved().feedingLog.length, 1);
  assert.equal(saved().feedingLog[0].mealType, "lunch");
  assert.equal(
    localDateKey(saved().feedingLog[0].date),
    localDateKey(yesterday),
  );
  assert.match(document.body.textContent, /Half a banana/);
  await click(button("Edit entry"));
  await fill(
    field("Amount (optional)", document.querySelector("dialog")),
    "A few bites",
  );
  await submit(document.querySelector("dialog form"));
  assert.equal(saved().feedingLog.length, 1);
  assert.equal(saved().feedingLog[0].amount, "A few bites");
  assert.match(document.body.textContent, /A few bites/);
});

test("invalid import shows an error before any existing data changes", async () => {
  const data = toddlerData();
  data.babyProfile.name = "Keep";
  await mount(data);
  await click(button("Profile"));
  const before = localStorage.getItem(STORAGE_KEY);
  const input = document.querySelector("input[type=file]");
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [
      {
        name: "bad.json",
        size: 50,
        text: async () =>
          JSON.stringify({ version: 1, babyProfile: {}, feedingLog: {} }),
      },
    ],
  });
  await act(async () =>
    input.dispatchEvent(new dom.window.Event("change", { bubbles: true })),
  );
  assert.match(document.body.textContent, /Feeding log must be a valid list/);
  assert.equal(localStorage.getItem(STORAGE_KEY), before);
  assert.ok(!document.body.textContent.includes("Review before replacing"));
});

test("failed entry save keeps the editor and entered amount available", async () => {
  await mount(toddlerData());
  await click(button("Diary"));
  await click(button("Add entry"));
  const dialog = document.querySelector("dialog");
  await fill(field("Meal or drink", dialog), "snack");
  await click(button("Banana", dialog));
  await fill(field("What happened?", dialog), "eaten");
  await fill(field("Amount (optional)", dialog), "Keep this draft");
  const original = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = () => {
    throw new Error("Device storage full");
  };
  try {
    await submit(dialog.querySelector("form"));
    assert.ok(document.querySelector("dialog[open]"));
    assert.equal(field("Amount (optional)", dialog).value, "Keep this draft");
    assert.match(dialog.textContent, /not saved|could not be saved/i);
  } finally {
    dom.window.Storage.prototype.setItem = original;
  }
  assert.equal(saved().feedingLog.length, 0);
});

test("a toddler gets the toddler plan and a missing birthday does not silently choose an infant plan", async () => {
  await mount(toddlerData());
  await click(button("Meals"));
  assert.equal(field("Feeding stage").value, "toddler12-24");
  await click(button("Profile"));
  await fill(field("Birth date"), "");
  await submit(field("Birth date").closest("form"));
  await click(button("Meals"));
  assert.equal(field("Browse a stage manually").value, "");
  assert.ok(!document.querySelector(".meal-grid"));
});

test("logging a suggested introduction requires intake confirmation and includes the allergen", async () => {
  await mount(toddlerData());
  await click(button("Meals"));
  await fill(field("Feeding stage"), "week1-2");
  await click(button("Use in a log", document.querySelector(".meal-grid")));
  const dialog = document.querySelector("dialog");
  assert.equal(saved().feedingLog.length, 0);
  assert.equal(field("What happened?", dialog).value, "");
  await submit(dialog.querySelector("form"));
  assert.equal(saved().feedingLog.length, 0);
  await fill(field("What happened?", dialog), "eaten");
  await submit(dialog.querySelector("form"));
  assert.ok(saved().feedingLog[0].foods.includes("peanutButter"));
  assert.equal(getAllergenStats(saved().feedingLog, FOOD_DATABASE).peanut, 1);
});

test("adding a symptom to an older entry pauses its food and allergen after prior review", async () => {
  const data = toddlerData();
  const previousReview = new Date(Date.now() - 3600000).toISOString();
  data.babyProfile.allergenStatus = { peanut: "tolerated" };
  data.babyProfile.allergenReviewedAt = { peanut: previousReview };
  data.babyProfile.foodStatus = { peanutButter: "tolerated" };
  data.babyProfile.foodReviewedAt = { peanutButter: previousReview };
  data.feedingLog = [
    {
      id: "older-meal",
      date: new Date(Date.now() - 86400000).toISOString(),
      mealType: "snack",
      foods: ["peanutButter"],
      amount: "A little",
      description: "Snack",
      notes: "",
      consumption: "eaten",
      reaction: "None observed",
      reactionSeverity: "",
    },
  ];
  await mount(data);
  await click(button("Diary"));
  await click(button("Edit entry"));
  const dialog = document.querySelector("dialog");
  await fill(field("Observed symptom", dialog), "Hives");
  await fill(field("Observed severity", dialog), "Mild");
  await submit(dialog.querySelector("form"));
  const current = saved();
  assert.ok(current.feedingLog[0].reactionRecordedAt > previousReview);
  assert.equal(
    getAllergenStatuses(current.babyProfile, current.feedingLog, FOOD_DATABASE)
      .peanut,
    "suspected",
  );
  assert.equal(
    getFoodStatuses(current.babyProfile, current.feedingLog, FOOD_DATABASE)
      .peanutButter,
    "suspected",
  );
  await click(button("Profile"));
  assert.equal(field("Peanut").value, "suspected");
  assert.equal(field("Smooth peanut butter").value, "suspected");
});

test("a custom ingredient and family recipe retain their ingredients and allergen metadata", async () => {
  await mount(toddlerData());
  await click(button("Foods"));
  await click(button("Add food"));
  const name = field("Food name");
  await fill(name, "Home bread");
  const form = name.closest("form");
  await click(field("Wheat", form));
  await click(
    field("I have checked the ingredients and allergen information.", form),
  );
  await submit(form);
  assert.equal(saved().customFoods.length, 1);
  assert.deepEqual(saved().customFoods[0].allergens, ["wheat"]);
  await click(button("Recipes"));
  const recipeName = field("Recipe name");
  await fill(recipeName, "Bread and hummus");
  const recipeForm = recipeName.closest("form");
  await click(button("Home bread", recipeForm));
  await click(button("Hummus (with tahini)", recipeForm));
  await submit(recipeForm);
  assert.equal(saved().recipes.length, 1);
  assert.deepEqual(
    new Set(saved().recipes[0].foods),
    new Set([saved().customFoods[0].id, "hummus"]),
  );
});

test("the recovery screen can restore a valid backup while retaining corrupt originals", async () => {
  const original = "{bad-json";
  localStorage.setItem(STORAGE_KEY, original);
  await act(async () => root.render(React.createElement(App)));
  assert.match(document.body.textContent, /saved records need attention/);
  const input = document.querySelector("input[type=file]");
  const backup = toddlerData();
  backup.babyProfile.name = "Restored";
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [
      {
        name: "good.json",
        size: 500,
        text: async () => JSON.stringify(backup),
      },
    ],
  });
  await act(async () =>
    input.dispatchEvent(new dom.window.Event("change", { bubbles: true })),
  );
  assert.match(document.body.textContent, /Review before replacing/);
  assert.equal(localStorage.getItem(STORAGE_KEY), original);
  await click(button("Replace with this backup"));
  assert.equal(saved().babyProfile.name, "Restored");
  assert.equal(localStorage.getItem(PREVIOUS_KEY), original);
  assert.ok(
    !document.body.textContent.includes("saved records need attention"),
  );
});

test("restoring a backup clears measurement drafts from the previous dataset", async () => {
  const data = toddlerData();
  const date = localDateKey(new Date(Date.now() - 86400000));
  data.babyProfile.weight = [{ id: "old-weight", date, value: 9 }];
  await mount(data);
  await click(button("Profile"));
  await click(button("Edit", field("Weight (kg)").closest(".growth-section")));
  await fill(field("Weight (kg)"), "12");
  const imported = toddlerData();
  imported.babyProfile.weight = [{ id: "new-weight", date, value: 10 }];
  const input = document.querySelector("input[type=file]");
  Object.defineProperty(input, "files", {
    configurable: true,
    value: [
      {
        name: "replacement.json",
        size: 500,
        text: async () => JSON.stringify(imported),
      },
    ],
  });
  await act(async () =>
    input.dispatchEvent(new dom.window.Event("change", { bubbles: true })),
  );
  await click(button("Replace with this backup"));
  assert.equal(saved().babyProfile.weight[0].id, "new-weight");
  assert.equal(field("Weight (kg)").value, "");
  assert.ok(
    ![...document.querySelectorAll("button")].some(
      (item) => item.textContent === "Update weight",
    ),
  );
});

test("recovery can preview and restore the previous local save without a separate file", async () => {
  const previous = toddlerData();
  previous.babyProfile.name = "Previous";
  localStorage.setItem(STORAGE_KEY, "{broken");
  localStorage.setItem(PREVIOUS_KEY, JSON.stringify(previous));
  await act(async () => root.render(React.createElement(App)));
  await click(button("Preview previous save"));
  assert.match(document.body.textContent, /Review before replacing/);
  assert.equal(localStorage.getItem(STORAGE_KEY), "{broken");
  await click(button("Replace with this backup"));
  assert.equal(saved().babyProfile.name, "Previous");
  assert.equal(localStorage.getItem(PREVIOUS_KEY), "{broken");
});

test("recovery download includes the damaged record and all retained snapshots", async () => {
  const previous = JSON.stringify(toddlerData());
  localStorage.setItem(STORAGE_KEY, "{broken");
  localStorage.setItem(PREVIOUS_KEY, previous);
  localStorage.setItem("babyProfile", '{"name":"Legacy"}');
  await act(async () => root.render(React.createElement(App)));
  let exported;
  const oldCreate = URL.createObjectURL,
    oldClick = dom.window.HTMLAnchorElement.prototype.click;
  URL.createObjectURL = (blob) => {
    exported = blob;
    return "blob:recovery-test";
  };
  dom.window.HTMLAnchorElement.prototype.click = () => {};
  try {
    await click(button("Download recovery data"));
  } finally {
    URL.createObjectURL = oldCreate;
    dom.window.HTMLAnchorElement.prototype.click = oldClick;
  }
  const copy = JSON.parse(await exported.text());
  assert.equal(copy.records[STORAGE_KEY], "{broken");
  assert.equal(copy.records[PREVIOUS_KEY], previous);
  assert.equal(copy.records.babyProfile, '{"name":"Legacy"}');
});
