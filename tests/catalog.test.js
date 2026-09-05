import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLERGENS,
  FOOD_CATEGORIES,
  FOOD_DATABASE,
  SOURCES,
} from "../src/catalog.js";
import { getRecommendedPlanKey, MEAL_PLANS } from "../src/plans.js";

const originalFoodIds = [
  "beef",
  "lamb",
  "chicken",
  "salmon",
  "mackerel",
  "whitefish",
  "sardines",
  "egg",
  "peanutButter",
  "bamba",
  "tahini",
  "almondButter",
  "hummus",
  "avocado",
  "oliveOil",
  "sweetPotato",
  "spinach",
  "broccoli",
  "carrots",
  "lentils",
  "butternutSquash",
  "peas",
  "kale",
  "turkey",
  "chickenLiver",
  "cashewButter",
  "mushrooms",
  "quinoa",
];

test("catalog keeps every existing diary food ID and adds common family foods", () => {
  for (const id of [
    ...originalFoodIds,
    "banana",
    "apple",
    "bread",
    "rice",
    "pasta",
    "water",
    "milk",
    "tofu",
    "shrimp",
  ]) {
    assert.ok(FOOD_DATABASE[id], `Missing compatible food ID: ${id}`);
  }
});

test("every food is selectable once, has age guidance and uses valid allergen identifiers", () => {
  const allCategoryIds = Object.values(FOOD_CATEGORIES).flat();
  assert.equal(new Set(allCategoryIds).size, allCategoryIds.length);
  assert.deepEqual(
    [...allCategoryIds].sort(),
    Object.keys(FOOD_DATABASE).sort(),
  );
  const allergenIds = new Set(ALLERGENS.map((item) => item.id));
  assert.equal(allergenIds.size, ALLERGENS.length);
  for (const [id, food] of Object.entries(FOOD_DATABASE)) {
    assert.ok(
      FOOD_CATEGORIES[food.category]?.includes(id),
      `${id}: category mismatch`,
    );
    assert.ok(
      food.name && food.preparation,
      `${id}: missing display or preparation text`,
    );
    for (const age of ["6-7mo", "8-9mo", "10-12mo", "12-24mo"]) {
      assert.equal(
        typeof food.servingSize[age],
        "string",
        `${id}: no guidance for ${age}`,
      );
      assert.ok(food.servingSize[age].length > 0);
    }
    for (const allergen of food.allergens)
      assert.ok(
        allergenIds.has(allergen),
        `${id}: unknown allergen ${allergen}`,
      );
  }
  assert.deepEqual(FOOD_DATABASE.almondButter.allergens, ["almond"]);
  assert.deepEqual(FOOD_DATABASE.cashewButter.allergens, ["cashew"]);
  assert.deepEqual(FOOD_DATABASE.hummus.allergens, ["sesame"]);
  assert.deepEqual(FOOD_DATABASE.bread.allergens, ["wheat"]);
});

test("food and plan references are labeled links to primary sources", () => {
  const permittedHosts = new Set([
    "www.nhs.uk",
    "www.cdc.gov",
    "www.fda.gov",
    "pubmed.ncbi.nlm.nih.gov",
  ]);
  const references = [
    ...SOURCES,
    ...Object.values(FOOD_DATABASE).flatMap((food) => food.sources),
    ...Object.values(MEAL_PLANS).flatMap((plan) => plan.sources),
  ];
  for (const reference of references) {
    assert.ok(
      reference && reference.label && reference.url,
      "Missing labeled source",
    );
    const url = new URL(reference.url);
    assert.equal(url.protocol, "https:");
    assert.ok(permittedHosts.has(url.hostname));
    assert.notEqual(url.pathname, "/");
  }
});

test("every plan has seven complete days with resolvable ingredients and introductions", () => {
  assert.deepEqual(Object.keys(MEAL_PLANS), [
    "week1-2",
    "week3-4",
    "month2",
    "month3",
    "month4-6",
    "toddler12-24",
  ]);
  for (const [key, plan] of Object.entries(MEAL_PLANS)) {
    assert.deepEqual(
      plan.days.map((day) => day.day),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.ok(
      plan.name && plan.ageRange && plan.guidance.length && plan.goals.length,
    );
    for (const day of plan.days) {
      assert.ok(day.meals.length);
      for (const meal of day.meals) {
        assert.ok(meal.time && meal.options.length);
        for (const option of meal.options) {
          assert.ok(option.description && option.foods.length);
          assert.equal(new Set(option.foods).size, option.foods.length);
          for (const id of option.foods)
            assert.ok(
              FOOD_DATABASE[id],
              `${key} day ${day.day}: unresolved ${id}`,
            );
          if (meal.allergenIntro)
            assert.ok(
              option.foods.includes(meal.allergenIntro.food),
              "Introduction missing from ingredients",
            );
        }
      }
    }
  }
});

test("named ingredients that previously disappeared from logs and groceries are included", () => {
  const ingredientTerms = [
    [/\bbanana\b/i, "banana"],
    [/\bapple\b/i, "apple"],
    [/\bcucumber\b/i, "cucumber"],
    [/\bbarley\b/i, "barley"],
    [/\bchapati\b/i, "chapati"],
    [/\bsunflower\b/i, "sunflowerButter"],
    [/\b(?:bread|toast)\b/i, "bread"],
    [/\bfishcake\b/i, "egg"],
  ];
  for (const plan of Object.values(MEAL_PLANS))
    for (const day of plan.days)
      for (const meal of day.meals)
        for (const option of meal.options) {
          for (const [term, id] of ingredientTerms) {
            if (term.test(option.description))
              assert.ok(
                option.foods.includes(id),
                `${option.description}: missing ${id}`,
              );
          }
        }
});

test("toddler plan offers three meals and optional snacks while remaining dairy-free", () => {
  const usedFoods = new Set();
  for (const day of MEAL_PLANS["toddler12-24"].days) {
    assert.deepEqual(
      day.meals.filter((meal) => !meal.optional).map((meal) => meal.time),
      ["Breakfast", "Lunch", "Dinner"],
    );
    assert.equal(day.meals.filter((meal) => meal.optional).length, 2);
    for (const meal of day.meals)
      for (const option of meal.options)
        for (const id of option.foods) {
          usedFoods.add(id);
          assert.ok(
            !FOOD_DATABASE[id].allergens.includes("milk"),
            `Dairy default: ${id}`,
          );
        }
  }
  for (const category of [
    "Fruit",
    "Vegetables",
    "Grains & Starches",
    "Beans & Pulses",
    "Meat & Eggs",
    "Fish & Shellfish",
  ]) {
    assert.ok(
      [...usedFoods].some((id) => FOOD_DATABASE[id].category === category),
      `Missing variety: ${category}`,
    );
  }
  for (const [key, plan] of Object.entries(MEAL_PLANS)) {
    if (key === "toddler12-24") continue;
    assert.ok(
      plan.days.every((day) =>
        day.meals.every((meal) => !/snack/i.test(meal.time)),
      ),
      "Infant menus should not mandate snacks",
    );
  }
});

test("calendar age selects stages at their actual birthdays", () => {
  // Deliberately synthetic dates, unrelated to any child's profile.
  const profile = { birthDate: "2024-02-20", solidStartDate: "2024-08-20" };
  const cases = [
    ["2024-08-19", null],
    ["2024-08-20", "week1-2"],
    ["2024-09-02", "week1-2"],
    ["2024-09-03", "week3-4"],
    ["2024-09-20", "month2"],
    ["2024-10-20", "month3"],
    ["2024-11-20", "month4-6"],
    ["2025-02-19", "month4-6"],
    ["2025-02-20", "toddler12-24"],
    ["2026-02-19", "toddler12-24"],
    ["2026-02-20", null],
  ];
  for (const [date, expected] of cases)
    assert.equal(
      getRecommendedPlanKey(profile, new Date(`${date}T12:00:00`)),
      expected,
      date,
    );
});

test("missing, invalid or future dates do not guess a feeding stage", () => {
  const now = new Date("2025-03-01T12:00:00");
  for (const profile of [
    undefined,
    {},
    { birthDate: "" },
    { birthDate: "bad date" },
    { birthDate: "2026-01-01" },
  ]) {
    assert.equal(getRecommendedPlanKey(profile, now), null);
  }
  const infantNow = new Date("2024-09-05T12:00:00");
  for (const solidStartDate of [
    undefined,
    "",
    "2024-02-30",
    "bad date",
    "2024-12-01",
  ]) {
    assert.equal(
      getRecommendedPlanKey(
        { birthDate: "2024-02-20", solidStartDate },
        infantNow,
      ),
      "week1-2",
    );
  }
});

test("toddlers use the toddler plan even when starting solids late", () => {
  const now = new Date("2025-03-01T12:00:00");
  for (const solidStartDate of ["", "2025-02-28", "2024-08-20"]) {
    assert.equal(
      getRecommendedPlanKey({ birthDate: "2024-02-20", solidStartDate }, now),
      "toddler12-24",
    );
  }
});
