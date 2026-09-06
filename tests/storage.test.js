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
