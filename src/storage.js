import { ALLERGENS, FOOD_DATABASE } from "./catalog.js";
import { localDateKey, parseLocalDate } from "./domain.js";

export const STORAGE_KEY = "baby-feeding-tracker:data:v2";
export const PREVIOUS_KEY = "baby-feeding-tracker:previous:v2";
const MAX_BACKUP_BYTES = 10 * 1024 * 1024;
const allowedStatuses = ["unknown", "tolerated", "suspected", "avoid"];
const allowedReactions = [
  "None observed",
  "Rash",
  "Hives",
  "Swelling",
  "Vomiting",
  "Diarrhea",
  "Fussiness",
];
const allowedAllergens = new Set(ALLERGENS.map((item) => item.id));
const fail = (message) => {
  throw new Error(message);
};
const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail(`${label} must be an object.`);
  return value;
};
const array = (value, label, max = 100000) => {
  if (!Array.isArray(value) || value.length > max)
    fail(`${label} must be a valid list (maximum ${max} entries).`);
  return value;
};
const string = (value, label, max = 2000, fallback = "") => {
  const result = value === undefined ? fallback : value;
  if (typeof result !== "string" || result.length > max)
    fail(`${label} must be text (maximum ${max} characters).`);
  return result;
};
const enumValue = (value, values, label, fallback) => {
  const result = value === undefined ? fallback : value;
  if (!values.includes(result)) fail(`${label} is not supported.`);
  return result;
};
const dateOnly = (value, label) => {
  const result = string(value, label, 10);
  if (result && (!parseLocalDate(result) || result > localDateKey()))
    fail(`${label} must be a valid date that is not in the future.`);
  return result;
};
const timestamp = (value, label) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) ||
    !parseLocalDate(value.slice(0, 10)) ||
    !Number.isFinite(new Date(value).valueOf())
  )
    fail(`${label} must contain a valid date and time.`);
  if (new Date(value).valueOf() > Date.now() + 300000)
    fail(`${label} cannot be in the future.`);
  return new Date(value).toISOString();
};
const idValue = (value, label) => {
  const id =
    typeof value === "number" && Number.isSafeInteger(value)
      ? String(value)
      : string(value, label, 120);
  if (
    !id ||
    !/^[\w-]+$/.test(id) ||
    ["__proto__", "constructor", "prototype"].includes(id)
  )
    fail(`${label} is invalid.`);
  return id;
};
const distinct = (items, label) => {
  if (new Set(items.map((item) => item.id)).size !== items.length)
    fail(`${label} contains duplicate IDs.`);
  return items;
};

export function emptyData() {
  return {
    version: 2,
    revision: 0,
    babyProfile: {
      name: "",
      birthDate: "",
      solidStartDate: "",
      weight: [],
      height: [],
      dairyFree: true,
      feedingNotes: "",
      texture: "family",
      allergenStatus: {},
      allergenReviewedAt: {},
      foodStatus: {},
      foodReviewedAt: {},
    },
    feedingLog: [],
    customFoods: [],
    recipes: [],
    dailyPlans: {},
  };
}

function normalizeProfile(raw) {
  const profile = object(raw, "Baby profile");
  const base = emptyData().babyProfile;
  const birthDate = dateOnly(profile.birthDate, "Birth date");
  const solidStartDate = dateOnly(profile.solidStartDate, "Solids start date");
  if (birthDate && solidStartDate && solidStartDate < birthDate)
    fail("Solids start date cannot precede the birth date.");
  if (profile.dairyFree !== undefined && typeof profile.dairyFree !== "boolean")
    fail("Dairy-free preference must be true or false.");
  const allergenStatus = {};
  const allergenReviewedAt = {};
  const foodStatus = {};
  const foodReviewedAt = {};
  for (const [id, value] of Object.entries(
    object(profile.allergenStatus || {}, "Allergen statuses"),
  )) {
    const ids = id === "tree nuts" ? ["almond", "cashew"] : [id];
    for (const key of ids) {
      if (!allowedAllergens.has(key)) fail(`Unknown allergen: ${key}.`);
      allergenStatus[key] = enumValue(
        value,
        allowedStatuses,
        "Allergen status",
        "unknown",
      );
    }
  }
  for (const [id, value] of Object.entries(
    object(profile.allergenReviewedAt || {}, "Allergen review dates"),
  )) {
    if (!allowedAllergens.has(id)) fail(`Unknown allergen: ${id}.`);
    allergenReviewedAt[id] = timestamp(value, "Allergen review date");
  }
  for (const [id, value] of Object.entries(
    object(profile.foodStatus || {}, "Food statuses"),
  )) {
    foodStatus[idValue(id, "Food status ID")] = enumValue(
      value,
      allowedStatuses,
      "Food status",
      "unknown",
    );
  }
  for (const [id, value] of Object.entries(
    object(profile.foodReviewedAt || {}, "Food review dates"),
  )) {
    foodReviewedAt[idValue(id, "Food review ID")] = timestamp(
      value,
      "Food review date",
    );
  }
  const measurements = (values, label, min, max) =>
    distinct(
      array(values ?? [], label, 10000).map((entry, index) => {
        object(entry, label);
        if (
          typeof entry.value !== "number" ||
          !Number.isFinite(entry.value) ||
          entry.value < min ||
          entry.value > max
        )
          fail(`${label} contains an invalid measurement.`);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(entry.date)
          ? dateOnly(entry.date, `${label} date`)
          : timestamp(entry.date, `${label} date`);
        if (!date || (birthDate && localDateKey(date) < birthDate))
          fail(`${label} date cannot precede the birth date.`);
        return {
          id: idValue(
            entry.id ?? `${label.toLowerCase()}-${index}`,
            `${label} ID`,
          ),
          date,
          value: entry.value,
        };
      }),
      label,
    ).sort((a, b) => {
      const dayOrder = localDateKey(a.date).localeCompare(localDateKey(b.date));
      const instant = (value) =>
        parseLocalDate(value)?.valueOf() ?? new Date(value).valueOf();
      return dayOrder || instant(a.date) - instant(b.date);
    });
  return {
    ...base,
    name: string(profile.name, "Name", 100),
    birthDate,
    solidStartDate,
    dairyFree: profile.dairyFree ?? true,
    feedingNotes: string(profile.feedingNotes, "Feeding instructions", 4000),
    texture: enumValue(
      profile.texture,
      ["puree", "mashed", "finger", "family"],
      "Food texture",
      "family",
    ),
    allergenStatus,
    allergenReviewedAt,
    foodStatus,
    foodReviewedAt,
    weight: measurements(profile.weight, "Weight", 0.2, 100),
    height: measurements(profile.height, "Height", 10, 200),
  };
}

export function normalizeData(raw) {
  object(raw, "Backup");
  if (![1, 2].includes(raw.version))
    fail(
      "This backup version is not supported. Your existing data has not been changed.",
    );
  const revision = raw.revision ?? 0;
  if (!Number.isSafeInteger(revision) || revision < 0)
    fail("Invalid data revision.");
  const babyProfile = normalizeProfile(raw.babyProfile);
  const customFoods = distinct(
    array(raw.customFoods ?? [], "Custom foods", 2000).map((food) => {
      object(food, "Custom food");
      const id = idValue(food.id, "Food ID");
      if (Object.hasOwn(FOOD_DATABASE, id))
        fail("Custom food IDs cannot replace built-in foods.");
      const allergens = [
        ...new Set(
          array(food.allergens, "Food allergens", 50).map((allergen) => {
            if (!allowedAllergens.has(allergen))
              fail(`Unknown allergen: ${allergen}.`);
            return allergen;
          }),
        ),
      ];
      const name = string(food.name, "Food name", 120).trim();
      if (!name) fail("A custom food needs a name.");
      return {
        id,
        name,
        category: string(food.category, "Food category", 100, "Custom foods"),
        allergens,
        preparation: string(food.preparation, "Preparation", 2000),
      };
    }),
    "Custom foods",
  );
  const validFoodIds = new Set([
    ...Object.keys(FOOD_DATABASE),
    ...customFoods.map((food) => food.id),
  ]);
  for (const id of [
    ...Object.keys(babyProfile.foodStatus),
    ...Object.keys(babyProfile.foodReviewedAt),
  ]) {
    if (!validFoodIds.has(id))
      fail(`A food restriction references an unknown food: ${id}.`);
  }
  const foodIds = (value, label) => [
    ...new Set(
      array(value, label, 100).map((id) => {
        if (typeof id !== "string" || !validFoodIds.has(id))
          fail(
            `${label} contains an unknown food: ${String(id)}. Add or restore that food first.`,
          );
        return id;
      }),
    ),
  ];
  const feedingLog = distinct(
    array(raw.feedingLog, "Feeding log").map((feed) => {
      object(feed, "Feeding entry");
      const notes = string(feed.notes, "Notes", 10000);
      const foods = foodIds(feed.foods ?? [], "Meal ingredients");
      const mealType = enumValue(
        feed.mealType,
        ["breakfast", "lunch", "dinner", "snack", "drink", "breastfeed"],
        "Meal type",
        "snack",
      );
      if (!foods.length && mealType !== "breastfeed")
        fail("A feeding entry needs at least one food or drink.");
      // Old records do not distinguish offered from eaten. Retain them, but do not turn them into confirmed exposure.
      const consumption = enumValue(
        feed.consumption,
        ["eaten", "offered", "refused", "unknown"],
        "Consumption",
        "unknown",
      );
      return {
        id: idValue(feed.id, "Entry ID"),
        date: timestamp(feed.date, "Feeding date"),
        mealType,
        foods,
        amount: string(feed.amount, "Amount", 300),
        notes,
        description: string(feed.description, "Meal description", 2000),
        consumption,
        reaction: enumValue(
          feed.reaction,
          allowedReactions,
          "Reaction",
          "None observed",
        ),
        reactionSeverity: enumValue(
          feed.reactionSeverity,
          ["", "Mild", "Moderate", "Severe"],
          "Reaction severity",
          "",
        ),
        ...(feed.reactionRecordedAt
          ? {
              reactionRecordedAt: timestamp(
                feed.reactionRecordedAt,
                "Reaction recorded date",
              ),
            }
          : {}),
      };
    }),
    "Feeding log",
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
  const recipes = distinct(
    array(raw.recipes ?? [], "Recipes", 2000).map((recipe) => {
      object(recipe, "Recipe");
      const name = string(recipe.name, "Recipe name", 120).trim();
      if (!name) fail("A recipe needs a name.");
      const foods = foodIds(recipe.foods, "Recipe ingredients");
      if (!foods.length) fail("A recipe needs at least one ingredient.");
      return {
        id: idValue(recipe.id, "Recipe ID"),
        name,
        foods,
        description: string(recipe.description, "Recipe description", 2000),
      };
    }),
    "Recipes",
  );
  const planObject = (value, label) => {
    object(value, label);
    if (
      ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
      Object.keys(value).some((key) =>
        ["__proto__", "constructor", "prototype"].includes(key),
      )
    )
      fail(`${label} contains an invalid object or key.`);
    return value;
  };
  const planText = (value, label, max) => {
    if (typeof value !== "string")
      fail(`${label} must be text (maximum ${max} characters).`);
    return string(value, label, max);
  };
  const planEntries = Object.entries(
    planObject(
      raw.dailyPlans === undefined ? {} : raw.dailyPlans,
      "Daily plans",
    ),
  );
  if (planEntries.length > 1000)
    fail("Daily plans can contain a maximum of 1000 saved days.");
  const dailyPlans = {};
  for (const [date, rawPlan] of planEntries) {
    if (!parseLocalDate(date))
      fail("A daily plan date must be a valid YYYY-MM-DD date.");
    if (babyProfile.birthDate && date < babyProfile.birthDate)
      fail("A daily plan date cannot precede the birth date.");
    const plan = planObject(rawPlan, "Daily plan");
    const stage = enumValue(
      plan.stage,
      ["toddler12-24"],
      "Daily plan stage",
    );
    const slots = new Set();
    const meals = array(plan.meals, "Planned meals", 5).map((rawMeal) => {
      const meal = planObject(rawMeal, "Planned meal");
      const slot = enumValue(
        meal.slot,
        ["breakfast", "lunch", "dinner", "morningSnack", "afternoonSnack"],
        "Planned meal slot",
      );
      if (slots.has(slot)) fail("A daily plan contains duplicate meal slots.");
      slots.add(slot);
      const recipeId = planText(meal.recipeId, "Planned recipe ID", 160);
      const title = planText(meal.title, "Planned meal title", 160);
      const foods = foodIds(meal.foods, "Planned meal ingredients");
      if (!recipeId.trim()) fail("A planned meal needs a recipe ID.");
      if (!title.trim()) fail("A planned meal needs a title.");
      if (!foods.length) fail("A planned meal needs at least one ingredient.");
      return {
        slot,
        recipeId,
        title,
        description: planText(
          meal.description,
          "Planned meal description",
          2000,
        ),
        foods,
        steps: array(meal.steps, "Planned meal steps", 8).map((step) =>
          planText(step, "Planned meal step", 500),
        ),
        sourceIds: array(meal.sourceIds, "Planned meal sources", 32).map(
          (sourceId) => planText(sourceId, "Planned meal source", 80),
        ),
      };
    });
    // Retain snapshots after recipes change and as the child ages. Planned meals
    // are not feeding records and do not establish intake or allergen exposure.
    dailyPlans[date] = { stage, meals };
  }
  return {
    version: 2,
    revision,
    babyProfile,
    feedingLog,
    customFoods,
    recipes,
    dailyPlans,
  };
}

export function parseBackup(text) {
  if (typeof text !== "string" || text.length > MAX_BACKUP_BYTES)
    fail("Backup is too large (maximum 10 MB).");
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    fail(
      "This file is not valid JSON. Your existing data has not been changed.",
    );
  }
  return normalizeData(raw);
}

export function loadData(storage) {
  let recoveryRaw = null;
  try {
    storage ??= globalThis.localStorage;
    const current = storage.getItem(STORAGE_KEY);
    if (current !== null) {
      recoveryRaw = current;
      return { data: parseBackup(current), error: null, recoveryRaw: null };
    }
    const profile = storage.getItem("babyProfile");
    const feeds = storage.getItem("feedingLog");
    recoveryRaw = JSON.stringify({ babyProfile: profile, feedingLog: feeds });
    if (profile === null && feeds === null)
      return { data: emptyData(), error: null, recoveryRaw: null };
    const data = normalizeData({
      version: 1,
      babyProfile: profile === null ? {} : JSON.parse(profile),
      feedingLog: feeds === null ? [] : JSON.parse(feeds),
    });
    // Read-only migration: legacy keys remain untouched until (and after) the next successful save.
    return { data, error: null, recoveryRaw: null };
  } catch (error) {
    return {
      data: null,
      error: `Could not load saved records: ${error.message}. No records were overwritten.`,
      recoveryRaw,
    };
  }
}

export function saveData(
  next,
  { expectedRevision = next.revision ?? 0, storage } = {},
) {
  const normalized = normalizeData(next);
  let current;
  try {
    storage ??= globalThis.localStorage;
    current = storage.getItem(STORAGE_KEY);
    // Corrupted current data can be repaired through the explicit recovery import, while retaining its exact bytes.
    let currentRevision = 0;
    if (current !== null) {
      try {
        currentRevision = parseBackup(current).revision;
      } catch {
        currentRevision = expectedRevision;
      }
    }
    if (currentRevision !== expectedRevision)
      fail(
        "Records changed in another tab. Export your draft if needed, then reload before saving.",
      );
    const result = { ...normalized, revision: currentRevision + 1 };
    if (current !== null) storage.setItem(PREVIOUS_KEY, current);
    else {
      const legacyProfile = storage.getItem("babyProfile");
      const legacyFeeds = storage.getItem("feedingLog");
      if (legacyProfile !== null || legacyFeeds !== null) {
        let previous;
        try {
          previous = JSON.stringify({
            version: 1,
            babyProfile: JSON.parse(legacyProfile || "{}"),
            feedingLog: JSON.parse(legacyFeeds || "[]"),
          });
        } catch {
          previous = JSON.stringify({
            recoveryExport: true,
            records: { babyProfile: legacyProfile, feedingLog: legacyFeeds },
          });
        }
        storage.setItem(PREVIOUS_KEY, previous);
      }
    }
    // localStorage.setItem replaces a single complete record atomically. React state changes only after this returns.
    storage.setItem(STORAGE_KEY, JSON.stringify(result));
    return result;
  } catch (error) {
    throw new Error(
      `Changes were not saved: ${error.message}. Keep this page open and export a backup before trying again.`,
    );
  }
}

// Web Locks serialize the complete revision-check/backup/save transaction across tabs.
// Older browsers without Web Locks retain the revision check; use one app tab there.
export async function persistData(next, options = {}) {
  const locks = options.locks ?? globalThis.navigator?.locks;
  if (locks?.request)
    return locks.request(`${STORAGE_KEY}:write`, () => saveData(next, options));
  return saveData(next, options);
}

export function createBackup(data) {
  return JSON.stringify(
    { ...normalizeData(data), exportDate: new Date().toISOString() },
    null,
    2,
  );
}

export function readPreviousBackup(storage) {
  try {
    storage ??= globalThis.localStorage;
    const previous = storage.getItem(PREVIOUS_KEY);
    if (previous === null)
      throw new Error("There is no previous save on this device yet.");
    return parseBackup(previous);
  } catch (error) {
    throw new Error(`Could not open the previous save: ${error.message}`);
  }
}

export function exportRawRecovery(storage) {
  const result = {};
  try {
    storage ??= globalThis.localStorage;
  } catch (error) {
    return JSON.stringify({
      recoveryExport: true,
      error: `Unable to access storage: ${error.message}`,
    });
  }
  for (const key of [STORAGE_KEY, PREVIOUS_KEY, "babyProfile", "feedingLog"]) {
    try {
      result[key] = storage.getItem(key);
    } catch (error) {
      result[key] = `Unable to read: ${error.message}`;
    }
  }
  return JSON.stringify(
    {
      recoveryExport: true,
      exportedAt: new Date().toISOString(),
      records: result,
    },
    null,
    2,
  );
}
