import test from "node:test";
import assert from "node:assert/strict";
import { FOOD_DATABASE } from "../src/catalog.js";
import {
  getAgeLabel,
  getCompletedMonths,
  localDateKey,
  toLocalInputValue,
  fromLocalInputValue,
  getTodayFeeds,
  getStreak,
  getAllergenStats,
  getAllergenStatuses,
  getFoodStatuses,
  getSafeMealOptions,
} from "../src/domain.js";

process.env.TZ = "Asia/Dubai";
const now = new Date("2026-09-05T01:00:00+04:00");
test("completed age respects monthly birthday and leap dates", () => {
  const reviewDate = new Date("2026-09-15T01:00:00+04:00");
  assert.equal(getCompletedMonths("2025-08-18", reviewDate), 12);
  assert.equal(getAgeLabel("2025-08-18", reviewDate), "12 months, 28 days");
  assert.equal(
    getCompletedMonths("2025-08-18", new Date("2026-09-18T00:00:00+04:00")),
    13,
  );
  assert.equal(
    getCompletedMonths("2024-02-29", new Date("2025-02-28T12:00:00+04:00")),
    12,
  );
  assert.equal(getCompletedMonths("2026-09-06", now), null);
  assert.equal(getCompletedMonths("2025-02-31", now), null);
  assert.equal(getCompletedMonths("", now), null);
});

test("today and a streak cross local midnight, not UTC midnight", () => {
  const feeds = [
    { date: "2026-09-04T10:00:00+04:00" },
    { date: "2026-09-05T00:30:00+04:00" },
  ];
  assert.equal(localDateKey(feeds[1].date), "2026-09-05");
  assert.equal(getTodayFeeds(feeds, now).length, 1);
  assert.equal(getStreak(feeds, now), 2);
  assert.equal(getStreak(feeds.slice(0, 1), now), 1);
  assert.equal(toLocalInputValue(feeds[1].date), "2026-09-05T00:30");
  assert.equal(
    fromLocalInputValue("2026-09-05T00:30"),
    "2026-09-04T20:30:00.000Z",
  );
  assert.throws(() => fromLocalInputValue("2026-02-30T00:30"));
});

test("allergen counts use eaten occasions in seven local calendar days", () => {
  const feeds = [
    {
      date: "2026-09-05T00:30:00+04:00",
      foods: ["tahini", "hummus"],
      consumption: "eaten",
    },
    {
      date: "2026-09-04T10:00:00+04:00",
      foods: ["tahini"],
      consumption: "refused",
    },
    {
      date: "2026-09-04T11:00:00+04:00",
      foods: ["tahini"],
      consumption: "offered",
    },
    {
      date: "2026-09-04T12:00:00+04:00",
      foods: ["tahini"],
      consumption: "unknown",
    },
    {
      date: "2026-09-06T10:00:00+04:00",
      foods: ["tahini"],
      consumption: "eaten",
    },
    {
      date: "2026-08-29T23:59:00+04:00",
      foods: ["tahini"],
      consumption: "eaten",
    },
    {
      date: "2026-08-30T00:00:00+04:00",
      foods: ["peanutButter", "bamba"],
      consumption: "eaten",
    },
  ];
  const stats = getAllergenStats(feeds, FOOD_DATABASE, now);
  assert.equal(stats.sesame, 1);
  assert.equal(stats.peanut, 1);
});

test("reactions suspend suggestions and a later reaction overrides an earlier review", () => {
  const profile = {
    dairyFree: true,
    allergenStatus: { peanut: "tolerated" },
    allergenReviewedAt: { peanut: "2026-09-01T10:00:00Z" },
  };
  const feeds = [
    {
      date: "2026-09-04T10:00:00Z",
      foods: ["peanutButter"],
      reaction: "Hives",
    },
  ];
  assert.equal(
    getAllergenStatuses(profile, feeds, FOOD_DATABASE).peanut,
    "suspected",
  );
  const meal = {
    options: [{ foods: ["peanutButter"] }, { foods: ["beef", "carrots"] }],
  };
  assert.deepEqual(getSafeMealOptions(meal, profile, feeds, FOOD_DATABASE), [
    { foods: ["beef", "carrots"] },
  ]);
  const reviewed = {
    ...profile,
    allergenReviewedAt: { peanut: "2026-09-05T10:00:00Z" },
  };
  assert.equal(
    getAllergenStatuses(reviewed, feeds, FOOD_DATABASE).peanut,
    "tolerated",
  );
  assert.equal(
    getAllergenStatuses(
      { ...reviewed, allergenStatus: { peanut: "unknown" } },
      feeds,
      FOOD_DATABASE,
    ).peanut,
    "suspected",
  );
  assert.equal(
    getAllergenStatuses(
      { ...reviewed, allergenStatus: { peanut: "avoid" } },
      feeds,
      FOOD_DATABASE,
    ).peanut,
    "avoid",
  );
  const backdated = [
    { ...feeds[0], reactionRecordedAt: "2026-09-05T11:00:00Z" },
  ];
  assert.equal(
    getAllergenStatuses(reviewed, backdated, FOOD_DATABASE).peanut,
    "suspected",
  );
});

test("diet restrictions apply to custom ingredient metadata too", () => {
  const foods = {
    ...FOOD_DATABASE,
    customMilk: { name: "Recipe ingredient", allergens: ["milk"] },
  };
  assert.deepEqual(
    getSafeMealOptions(
      { options: [{ foods: ["customMilk"] }] },
      { dairyFree: true },
      [],
      foods,
    ),
    [],
  );
});

test("reactions to foods outside named allergen groups also pause suggestions", () => {
  const feeds = [
    { date: "2026-09-04T10:00:00Z", foods: ["banana"], reaction: "Hives" },
  ];
  const profile = { dairyFree: true };
  assert.equal(
    getFoodStatuses(profile, feeds, FOOD_DATABASE).banana,
    "suspected",
  );
  const meal = { options: [{ foods: ["banana"] }, { foods: ["pear"] }] };
  assert.deepEqual(getSafeMealOptions(meal, profile, feeds, FOOD_DATABASE), [
    { foods: ["pear"] },
  ]);
  const reviewed = {
    ...profile,
    foodStatus: { banana: "tolerated" },
    foodReviewedAt: { banana: "2026-09-05T10:00:00Z" },
  };
  assert.equal(
    getFoodStatuses(reviewed, feeds, FOOD_DATABASE).banana,
    "tolerated",
  );
  assert.equal(
    getFoodStatuses(
      { ...reviewed, foodStatus: { banana: "unknown" } },
      feeds,
      FOOD_DATABASE,
    ).banana,
    "suspected",
  );
});
