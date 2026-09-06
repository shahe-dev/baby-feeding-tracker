import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyData,
  normalizeData,
  parseBackup,
  loadData,
  saveData,
  persistData,
  createBackup,
  exportRawRecovery,
  STORAGE_KEY,
  PREVIOUS_KEY,
} from "../src/storage.js";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    values,
  };
}
const legacy = () => ({
  version: 1,
  babyProfile: {
    name: "Test",
    birthDate: "2024-01-01",
    solidStartDate: "2024-07-01",
    weight: [{ date: "2025-01-01T10:00:00.000Z", value: 9 }],
    height: [],
  },
  feedingLog: [
    {
      id: 123,
      date: "2025-01-01T10:00:00.000Z",
      mealType: "lunch",
      foods: ["tahini", "hummus"],
      amount: "2 tbsp",
      notes: "",
      description: "Lunch",
    },
  ],
});

test("legacy migration preserves records, defaults dairy-free, and is read-only", () => {
  const data = legacy();
  const rawProfile = JSON.stringify(data.babyProfile),
    rawFeeds = JSON.stringify(data.feedingLog);
  const storage = memoryStorage({
    babyProfile: rawProfile,
    feedingLog: rawFeeds,
  });
  const loaded = loadData(storage);
  assert.equal(loaded.error, null);
  assert.equal(loaded.data.babyProfile.dairyFree, true);
  assert.equal(loaded.data.babyProfile.feedingNotes, "");
  assert.deepEqual(loaded.data.dailyPlans, {});
  assert.equal(loaded.data.feedingLog[0].consumption, "unknown");
  assert.equal(loaded.data.feedingLog[0].amount, "2 tbsp");
  assert.equal(loaded.data.babyProfile.weight[0].value, 9);
  assert.equal(storage.getItem(STORAGE_KEY), null);
  const saved = saveData(loaded.data, { storage });
  assert.equal(saved.revision, 1);
  assert.equal(storage.getItem("babyProfile"), rawProfile);
  assert.equal(storage.getItem("feedingLog"), rawFeeds);
  assert.deepEqual(parseBackup(createBackup(saved)), saved);
});

test("feeding instructions survive migration, device saves, and backup import", () => {
  const data = legacy();
  const notes =
    "Parent's recorded feeding plan\nKeep the original wording: молоко.";
  data.babyProfile.feedingNotes = notes;
  const rawProfile = JSON.stringify(data.babyProfile);
  const storage = memoryStorage({
    babyProfile: rawProfile,
    feedingLog: JSON.stringify(data.feedingLog),
  });
  const migrated = loadData(storage).data;
  assert.equal(migrated.babyProfile.feedingNotes, notes);
  const saved = saveData(migrated, { storage });
  assert.equal(loadData(storage).data.babyProfile.feedingNotes, notes);
  assert.equal(storage.getItem("babyProfile"), rawProfile);
  assert.equal(
    parseBackup(storage.getItem(PREVIOUS_KEY)).babyProfile.feedingNotes,
    notes,
  );
  const imported = parseBackup(createBackup(saved));
  const anotherDevice = memoryStorage();
  saveData(imported, { storage: anotherDevice, expectedRevision: 0 });
  assert.equal(loadData(anotherDevice).data.babyProfile.feedingNotes, notes);
  assert.deepEqual(imported.feedingLog, saved.feedingLog);
});

test("older version 2 records gain empty feeding instructions without changing their saved bytes", () => {
  const oldData = emptyData();
  delete oldData.babyProfile.feedingNotes;
  const original = JSON.stringify(oldData);
  const storage = memoryStorage({ [STORAGE_KEY]: original });
  const loaded = loadData(storage);
  assert.equal(loaded.error, null);
  assert.equal(loaded.data.babyProfile.feedingNotes, "");
  assert.equal(loaded.data.version, 2);
  assert.equal(storage.getItem(STORAGE_KEY), original);
});

test("feeding instructions accept 4000 characters and reject invalid input before writing", () => {
  const data = emptyData();
  data.babyProfile.feedingNotes = "a".repeat(4000);
  assert.equal(
    parseBackup(createBackup(data)).babyProfile.feedingNotes.length,
    4000,
  );
  const original = JSON.stringify(emptyData());
  const storage = memoryStorage({ [STORAGE_KEY]: original });
  for (const invalid of ["a".repeat(4001), null, 123, {}]) {
    data.babyProfile.feedingNotes = invalid;
    assert.throws(
      () => saveData(data, { storage }),
      /Feeding instructions must be text/,
    );
    assert.equal(storage.getItem(STORAGE_KEY), original);
    assert.equal(storage.getItem(PREVIOUS_KEY), null);
  }
});

test("legacy free-text notes never determine intake", () => {
  const data = legacy();
  data.feedingLog[0].notes = "Refused. Tried later.";
  assert.equal(normalizeData(data).feedingLog[0].consumption, "unknown");
  data.feedingLog[0].notes = "Refused carrots but ate beef";
  assert.equal(normalizeData(data).feedingLog[0].consumption, "unknown");
});

test("malformed backup shapes, unknown versions and invalid dates are rejected", () => {
  for (const value of [
    { version: 1, babyProfile: {}, feedingLog: {} },
    { ...legacy(), version: 999 },
    { ...legacy(), babyProfile: { weight: "bad" } },
    { ...legacy(), babyProfile: { birthDate: "2025-02-30" } },
    {
      ...legacy(),
      feedingLog: [{ ...legacy().feedingLog[0], date: "not-a-date" }],
    },
    {
      ...legacy(),
      feedingLog: [{ ...legacy().feedingLog[0], foods: ["missing-id"] }],
    },
  ])
    assert.throws(() => parseBackup(JSON.stringify(value)));
  assert.throws(() => parseBackup("{broken"));
});

test("corrupt records are preserved for recovery, and valid import repairs without deleting original bytes", () => {
  const corrupt = "{broken";
  const storage = memoryStorage({ [STORAGE_KEY]: corrupt });
  const loaded = loadData(storage);
  assert.equal(loaded.data, null);
  assert.match(loaded.error, /No records were overwritten/);
  assert.equal(storage.getItem(STORAGE_KEY), corrupt);
  saveData(emptyData(), { storage, expectedRevision: 0 });
  assert.equal(storage.getItem(PREVIOUS_KEY), corrupt);
  assert.equal(
    JSON.parse(exportRawRecovery(storage)).records[PREVIOUS_KEY],
    corrupt,
  );
});

test("corrupted legacy keys can also be recovered by explicit validated import", () => {
  const storage = memoryStorage({ babyProfile: "{bad", feedingLog: "[]" });
  assert.ok(loadData(storage).error);
  saveData(emptyData(), { storage });
  assert.equal(storage.getItem("babyProfile"), "{bad");
  assert.equal(
    JSON.parse(storage.getItem(PREVIOUS_KEY)).records.babyProfile,
    "{bad",
  );
});

test("failed storage write retains current data and never returns success", () => {
  const original = JSON.stringify(emptyData());
  const storage = memoryStorage({ [STORAGE_KEY]: original });
  storage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  assert.throws(
    () =>
      saveData(
        {
          ...emptyData(),
          babyProfile: { ...emptyData().babyProfile, name: "Changed" },
        },
        { storage },
      ),
    /not saved/,
  );
  assert.equal(storage.getItem(STORAGE_KEY), original);
});

test("valid replacements keep previous data, and stale tabs cannot overwrite newer records", () => {
  const storage = memoryStorage();
  const first = saveData(emptyData(), { storage });
  const second = saveData(
    { ...first, babyProfile: { ...first.babyProfile, name: "Changed" } },
    { storage },
  );
  assert.deepEqual(parseBackup(storage.getItem(PREVIOUS_KEY)), first);
  assert.throws(() => saveData(first, { storage }), /another tab/);
  assert.deepEqual(loadData(storage).data, second);
});

test("custom foods and complete family recipes survive export and import", () => {
  const data = emptyData();
  data.customFoods = [
    {
      id: "custom-1",
      name: "Family bread",
      category: "Custom foods",
      allergens: ["wheat"],
      preparation: "Serve soft, cut appropriately.",
    },
  ];
  data.recipes = [
    {
      id: "recipe-1",
      name: "Lunch",
      foods: ["custom-1", "hummus"],
      description: "Soft bread and hummus",
    },
  ];
  const restored = parseBackup(createBackup(data));
  assert.deepEqual(restored.customFoods, data.customFoods);
  assert.deepEqual(restored.recipes, data.recipes);
});

const planMeal = () => ({
  slot: "lunch",
  recipeId: "recipe-1",
  title: "Family lunch",
  description: "A saved recipe snapshot.",
  foods: ["hummus"],
  steps: ["Prepare the meal."],
  sourceIds: ["who-2023"],
});
const dailyPlan = (meals = [planMeal()]) => ({
  stage: "toddler12-24",
  meals,
});

test("future daily plans with all meal slots and custom foods survive save and backup import", () => {
  const data = normalizeData(legacy());
  data.customFoods = [
    {
      id: "custom-bread",
      name: "Family bread",
      category: "Custom foods",
      allergens: ["wheat"],
      preparation: "Serve soft.",
    },
  ];
  data.dailyPlans = {
    "2099-02-28": dailyPlan(
      ["breakfast", "lunch", "dinner", "morningSnack", "afternoonSnack"].map(
        (slot) => ({ ...planMeal(), slot, foods: ["custom-bread", "hummus"] }),
      ),
    ),
    "2099-03-01": dailyPlan([]),
  };
  const storage = memoryStorage();
  const saved = saveData(data, { storage });
  assert.deepEqual(loadData(storage).data.dailyPlans, data.dailyPlans);
  assert.deepEqual(saved.feedingLog, data.feedingLog);
  const restored = parseBackup(createBackup(saved));
  assert.deepEqual(restored, saved);
  const anotherDevice = memoryStorage();
  saveData(restored, { storage: anotherDevice, expectedRevision: 0 });
  assert.deepEqual(loadData(anotherDevice).data.dailyPlans, data.dailyPlans);
});

test("saved daily plan snapshots survive deletion of their source recipe", () => {
  const data = emptyData();
  data.recipes = [
    {
      id: "recipe-1",
      name: "Family lunch",
      foods: ["hummus"],
      description: "Original recipe.",
    },
  ];
  data.dailyPlans = { "2025-02-28": dailyPlan() };
  const storage = memoryStorage();
  const saved = saveData(data, { storage });
  const changed = saveData({ ...saved, recipes: [] }, { storage });
  assert.deepEqual(changed.dailyPlans, data.dailyPlans);
  assert.deepEqual(
    parseBackup(createBackup(changed)).dailyPlans,
    data.dailyPlans,
  );
  assert.deepEqual(changed.recipes, []);
});

test("saved recipe snapshots retain prefixed IDs and the complete source union", () => {
  const data = emptyData();
  const recipeId = `saved-${"r".repeat(120)}`;
  const sourceIds = Array.from({ length: 19 }, (_, index) => `source-${index}`);
  data.dailyPlans = {
    "2099-01-01": dailyPlan([{ ...planMeal(), recipeId, sourceIds }]),
  };
  const storage = memoryStorage();
  const saved = saveData(data, { storage });
  const restored = parseBackup(createBackup(saved));
  assert.equal(restored.dailyPlans["2099-01-01"].meals[0].recipeId, recipeId);
  assert.deepEqual(
    restored.dailyPlans["2099-01-01"].meals[0].sourceIds,
    sourceIds,
  );
  assert.deepEqual(loadData(storage).data.dailyPlans, data.dailyPlans);
});

test("older backups gain empty daily plans without rewriting existing device data", () => {
  for (const version of [1, 2]) {
    const oldData = { ...legacy(), version };
    const original = JSON.stringify(oldData);
    const storage = memoryStorage({ [STORAGE_KEY]: original });
    const loaded = loadData(storage);
    assert.equal(loaded.error, null);
    assert.deepEqual(loaded.data.dailyPlans, {});
    assert.equal(storage.getItem(STORAGE_KEY), original);
    assert.equal(storage.getItem(PREVIOUS_KEY), null);
    assert.deepEqual(parseBackup(original).dailyPlans, {});
  }
});

test("malformed daily plans are rejected before changing saved data or previous backup", () => {
  const base = normalizeData(legacy());
  const original = JSON.stringify(base);
  const previous = JSON.stringify(emptyData());
  const storage = memoryStorage({
    [STORAGE_KEY]: original,
    [PREVIOUS_KEY]: previous,
  });
  const wrap = (plan) => ({ "2099-01-01": plan });
  const mealChanges = [
    { slot: "snack" },
    { recipeId: "r".repeat(161) },
    { recipeId: " \n" },
    { title: "t".repeat(161) },
    { title: "\t " },
    { title: undefined },
    { description: "d".repeat(2001) },
    { foods: ["missing-food"] },
    { foods: [] },
    { foods: {} },
    { steps: Array(9).fill("Step") },
    { steps: ["s".repeat(501)] },
    { steps: [null] },
    { sourceIds: Array(33).fill("who-2023") },
    { sourceIds: ["s".repeat(81)] },
    { sourceIds: [123] },
  ];
  const invalidPlans = [
    null,
    [],
    "invalid",
    { "2099-02-29": dailyPlan() },
    { "2023-12-31": dailyPlan() },
    { "2099-1-01": dailyPlan() },
    { "2099-01-01T12:00:00Z": dailyPlan() },
    JSON.parse('{"__proto__": {"stage":"toddler12-24","meals":[]}}'),
    { constructor: dailyPlan() },
    { prototype: dailyPlan() },
    wrap(null),
    wrap([]),
    wrap({ stage: "infant", meals: [] }),
    wrap({ stage: "toddler12-24", meals: {} }),
    wrap(dailyPlan([planMeal(), planMeal()])),
    wrap(dailyPlan(Array(6).fill(planMeal()))),
    wrap(dailyPlan([null])),
    wrap(dailyPlan([JSON.parse('{"__proto__": {}}')])),
    ...mealChanges.map((change) =>
      wrap(dailyPlan([{ ...planMeal(), ...change }])),
    ),
  ];
  for (const dailyPlans of invalidPlans) {
    const invalid = { ...base, dailyPlans };
    assert.throws(() => parseBackup(JSON.stringify(invalid)));
    assert.throws(() => saveData(invalid, { storage }));
    assert.equal(storage.getItem(STORAGE_KEY), original);
    assert.equal(storage.getItem(PREVIOUS_KEY), previous);
  }
});

test("daily plans retain historical stages and enforce the saved-day limit", () => {
  const data = normalizeData(legacy());
  // A retained plan is not reclassified or removed as the child ages.
  data.dailyPlans = { "2024-01-01": dailyPlan([]) };
  assert.deepEqual(normalizeData(data).dailyPlans, data.dailyPlans);
  data.dailyPlans = Object.fromEntries(
    Array.from({ length: 1000 }, (_, index) => [
      new Date(Date.UTC(2090, 0, index + 1)).toISOString().slice(0, 10),
      dailyPlan([]),
    ]),
  );
  assert.equal(Object.keys(normalizeData(data).dailyPlans).length, 1000);
  data.dailyPlans["2099-01-01"] = dailyPlan([]);
  assert.throws(() => normalizeData(data), /maximum of 1000 saved days/);
});

test("concurrent saves are serialized and the stale draft is rejected", async () => {
  let queue = Promise.resolve();
  const locks = {
    request(name, callback) {
      const result = queue.then(callback);
      queue = result.catch(() => {});
      return result;
    },
  };
  const storage = memoryStorage();
  const a = emptyData(),
    b = emptyData();
  a.babyProfile.name = "A";
  b.babyProfile.name = "B";
  const results = await Promise.allSettled([
    persistData(a, { storage, locks }),
    persistData(b, { storage, locks }),
  ]);
  assert.equal(results[0].status, "fulfilled");
  assert.equal(results[1].status, "rejected");
  assert.match(results[1].reason.message, /another tab/);
  assert.equal(loadData(storage).data.babyProfile.name, "A");
});

test("measurements are ordered by timestamp within the same local day", () => {
  const data = legacy();
  data.babyProfile.weight = [
    { date: "2025-01-01T20:00:00Z", value: 11 },
    { date: "2025-01-01T08:00:00Z", value: 10 },
  ];
  const weights = normalizeData(data).babyProfile.weight;
  assert.deepEqual(
    weights.map((entry) => entry.value),
    [10, 11],
  );
});

test("storage getter failures reach recovery without overwriting anything", () => {
  const oldDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Storage blocked");
    },
  });
  try {
    assert.match(loadData().error, /Storage blocked/);
    assert.match(exportRawRecovery(), /Storage blocked/);
    assert.throws(() => saveData(emptyData()), /Storage blocked/);
  } finally {
    if (oldDescriptor)
      Object.defineProperty(globalThis, "localStorage", oldDescriptor);
    else delete globalThis.localStorage;
  }
});
