import test from "node:test";
import assert from "node:assert/strict";
import { FOOD_DATABASE } from "../src/catalog.js";
import { emptyData } from "../src/storage.js";
import { MEAL_PLANS } from "../src/plans.js";
import {
  DAY_SLOTS,
  getPlannedMealStatus,
  getRecipeCandidates,
  suggestDay,
} from "../src/dailyPlanner.js";

process.env.TZ = "Asia/Dubai";
const date = "2026-09-06";
const foods = FOOD_DATABASE;
function setup() {
  const data = emptyData();
  data.babyProfile.birthDate = "2025-08-08";
  return data;
}
const candidates = (data, extra = {}) => getRecipeCandidates({
  data, foods, date, slotId: "breakfast", ...extra,
});
const recipe = (id, foodIds) => ({ id, name: id, foods: foodIds, description: "Family meal" });
const freeze = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

test("daily suggestions respect completed age at the selected local date", () => {
  const data = setup();
  for (const invalidDate of ["2026-08-07", "2027-08-08", "2026-02-30", ""])
    assert.equal(suggestDay({ data, foods, date: invalidDate }), null);
  for (const validDate of ["2026-08-08", "2027-08-07", new Date("2026-08-08T00:15:00+04:00")])
    assert.equal(suggestDay({ data, foods, date: validDate }).stage, "toddler12-24");
  data.babyProfile.birthDate = "";
  assert.deepEqual(candidates(data), []);
});

test("automatic plans contain three curated main meals and no automatic snacks", () => {
  const data = setup();
  const plan = suggestDay({ data, foods, date });
  assert.deepEqual(plan.meals.map((meal) => meal.slot), ["breakfast", "lunch", "dinner"]);
  const sources = MEAL_PLANS["toddler12-24"].days.flatMap((day) => day.meals.flatMap((meal) => meal.options));
  for (const meal of plan.meals) {
    assert.ok(sources.some((option) => option.foods.join() === meal.foods.join()));
    const roles = new Set(meal.foods.flatMap((id) => foods[id].roles));
    for (const role of ["iron", "energy", "produce"]) assert.ok(roles.has(role));
    assert.ok(!Object.hasOwn(meal, "consumption"));
  }
  assert.ok(plan.meals.some((meal) => meal.foods.some((id) => foods[id].roles.includes("animal"))));
});

test("recipe candidates use curated titles, preparation and references without exposing scores", () => {
  const data = setup();
  data.babyProfile.allergenStatus.peanut = "tolerated";
  for (const slot of DAY_SLOTS) {
    for (const candidate of candidates(data, { slotId: slot.id })) {
      assert.equal(typeof candidate.title, "string");
      assert.ok(Array.isArray(candidate.steps));
      assert.ok(candidate.steps.length >= 2 && candidate.steps.length <= 3,
        `${candidate.id} should retain its preparation steps`);
      assert.ok(candidate.sourceIds.includes("who2023"));
      assert.ok(candidate.reasons.length > 0 && candidate.reasons.length <= 2);
      assert.equal(candidate.isCustom, false);
      assert.equal(Object.hasOwn(candidate, "rank"), false);
      assert.equal(Object.hasOwn(candidate, "score"), false);
    }
  }
  assert.deepEqual(candidates(data, { slotId: "midnight" }), []);
});

test("peanut needs tolerated status and a later reaction suspends it again", () => {
  const data = setup();
  const peanutCandidates = () => candidates(data, { slotId: "afternoonSnack" })
    .filter((candidate) => candidate.foods.includes("peanutButter"));
  assert.equal(peanutCandidates().length, 0);
  data.babyProfile.allergenStatus.peanut = "tolerated";
  data.babyProfile.allergenReviewedAt.peanut = "2026-09-01T10:00:00Z";
  assert.ok(peanutCandidates().length > 0);
  data.feedingLog.push({
    date: "2026-09-02T10:00:00Z", foods: ["peanutButter"],
    consumption: "eaten", reaction: "Hives",
  });
  assert.equal(peanutCandidates().length, 0);
  data.babyProfile.allergenReviewedAt.peanut = "2026-09-03T10:00:00Z";
  data.babyProfile.foodStatus.peanutButter = "tolerated";
  data.babyProfile.foodReviewedAt.peanutButter = "2026-09-03T10:00:00Z";
  assert.ok(peanutCandidates().length > 0);
});

test("other unknown allergens are labelled and ingredient restrictions apply to custom recipes", () => {
  const data = setup();
  const withEgg = candidates(data).find((candidate) => candidate.foods.includes("egg"));
  assert.ok(withEgg.reasons.includes("Check ingredients are already tolerated"));
  const map = { ...foods, customMilk: { name: "Family sauce", allergens: ["milk"] } };
  data.recipes = [recipe("milk-meal", ["customMilk", "beans"]), recipe("beans-meal", ["beans", "avocado"] )];
  assert.equal(candidates(data, { foods: map }).some((item) => item.id === "saved-milk-meal"), false);
  assert.equal(candidates(data, { foods: map }).some((item) => item.id === "saved-beans-meal"), true);
  data.babyProfile.dairyFree = false;
  assert.equal(candidates(data, { foods: map }).some((item) => item.id === "saved-milk-meal"), true);
  data.babyProfile.foodStatus.customMilk = "avoid";
  assert.equal(candidates(data, { foods: map }).some((item) => item.id === "saved-milk-meal"), false);
});

test("recorded reactions to a non-allergen ingredient also exclude saved and built-in recipes", () => {
  const data = setup();
  data.recipes = [recipe("carrot-meal", ["carrots", "beans", "oliveOil"])];
  data.feedingLog.push({ date: "2026-09-04T10:00:00Z", foods: ["carrots"], reaction: "Hives" });
  for (const slot of DAY_SLOTS)
    assert.ok(candidates(data, { slotId: slot.id }).every((candidate) => !candidate.foods.includes("carrots")));
});

test("saved family recipes retain known ingredient references without inferred nutrients", () => {
  const data = setup();
  const map = { ...foods, customFood: { name: "Our recipe ingredient", allergens: [], category: "Meat & Eggs" } };
  data.recipes = [recipe("unknown-food", ["customFood"]), recipe("known-foods", ["lentils", "avocado"])];
  const list = candidates(data, { foods: map });
  const known = list.find((item) => item.id === "saved-known-foods");
  assert.deepEqual(known.foods, ["lentils", "avocado"]);
  assert.ok(known.sourceIds.includes("blissProtocol"));
  assert.equal(known.isCustom, true);
  const unknown = list.find((item) => item.id === "saved-unknown-food");
  assert.deepEqual(unknown.sourceIds, []);
  assert.ok(!unknown.reasons.some((reason) => /iron|animal|meat/i.test(reason)));
  assert.ok(list.indexOf(known) < list.indexOf(unknown));
});

test("only confirmed recent intake changes variety ranking", () => {
  const data = setup();
  const baseline = candidates(data, { slotId: "lunch" });
  const previousChoice = baseline[0];
  data.feedingLog = [{ date: "2026-09-05T10:00:00Z", foods: previousChoice.foods, consumption: "offered" }];
  assert.deepEqual(candidates(data, { slotId: "lunch" }), baseline);
  data.feedingLog[0].consumption = "eaten";
  assert.notEqual(candidates(data, { slotId: "lunch" })[0].id, previousChoice.id);
  for (const ignoredDate of ["2026-08-25T10:00:00Z", "2026-09-07T10:00:00Z"]) {
    data.feedingLog[0].date = ignoredDate;
    assert.deepEqual(candidates(data, { slotId: "lunch" }), baseline);
  }
});

test("chosen recipes guide variety and suggestions are deterministic across repeated renders", () => {
  const data = setup();
  const original = suggestDay({ data, foods, date });
  assert.deepEqual(suggestDay({ data, foods, date }), original);
  const signatures = new Set(["2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"].map((day) =>
    suggestDay({ data, foods, date: day }).meals.map((meal) => meal.recipeId).join(),
  ));
  assert.ok(signatures.size > 1);
  const lunch = candidates(data, { slotId: "lunch" })[0];
  const otherChoice = candidates(data, { slotId: "lunch", selectedMeals: [lunch] })[0];
  assert.notEqual(otherChoice.id, lunch.id);
});

test("saved choices including optional snacks survive regeneration and are independently rechecked", () => {
  const data = setup();
  const plan = suggestDay({ data, foods, date });
  const lunch = plan.meals.find((meal) => meal.slot === "lunch");
  const snack = { slot: "morningSnack", recipeId: "saved-snack", title: "Family snack", foods: ["banana"], description: "", steps: [], sourceIds: [] };
  data.babyProfile.foodStatus[lunch.foods[0]] = "avoid";
  const regenerated = suggestDay({ data, foods, date, lockedMeals: [lunch, lunch, snack] });
  assert.equal(regenerated.meals.length, 4);
  assert.deepEqual(regenerated.meals.find((meal) => meal.slot === "lunch"), lunch);
  assert.deepEqual(regenerated.meals.find((meal) => meal.slot === "morningSnack"), snack);
  assert.equal(getPlannedMealStatus(lunch, { data, foods, date }).allowed, false);
  assert.match(getPlannedMealStatus(lunch, { data, foods, date }).reason, /restricted/);
  assert.equal(getPlannedMealStatus(snack, { data, foods, date }).allowed, true);
});

test("saved snapshots fail review when age or ingredient information changes", () => {
  const data = setup();
  const meal = { foods: ["beef", "carrots"] };
  assert.equal(getPlannedMealStatus(meal, { data, foods, date }).allowed, true);
  assert.equal(getPlannedMealStatus(meal, { data, foods, date: "2027-08-08" }).allowed, false);
  assert.equal(getPlannedMealStatus({ foods: ["missing"] }, { data, foods, date }).allowed, false);
  assert.equal(getPlannedMealStatus({ foods: [] }, { data, foods, date }).allowed, false);
  const missingMetadata = { ...foods, custom: { name: "Unreviewed ingredient" } };
  data.recipes = [recipe("incomplete", ["custom"])];
  assert.equal(candidates(data, { foods: missingMetadata }).some((item) => item.id === "saved-incomplete"), false);
});

test("planning is pure and returned snapshots never share ingredient arrays with saved inputs", () => {
  const data = freeze(setup());
  const original = JSON.stringify(data);
  const previous = freeze(suggestDay({ data, foods, date }));
  const next = suggestDay({ data, foods, date, lockedMeals: previous.meals });
  next.meals[0].foods.push("pear");
  assert.notDeepEqual(next.meals[0].foods, previous.meals[0].foods);
  assert.equal(JSON.stringify(data), original);
  assert.deepEqual(data.feedingLog, []);
});

test("a fully restricted catalogue leaves slots empty without inventing replacements", () => {
  const data = setup();
  data.babyProfile.foodStatus = Object.fromEntries(Object.keys(foods).map((id) => [id, "avoid"]));
  assert.deepEqual(suggestDay({ data, foods, date }), { stage: "toddler12-24", meals: [] });
});
