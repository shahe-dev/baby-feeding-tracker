import {
  getAllergenStatuses,
  getCompletedMonths,
  getSafeMealOptions,
  localDateKey,
  parseLocalDate,
} from "./domain.js";
import { MEAL_PLANS } from "./plans.js";

export const DAY_SLOTS = [
  { id: "breakfast", label: "Breakfast", optional: false },
  { id: "lunch", label: "Lunch", optional: false },
  { id: "dinner", label: "Dinner", optional: false },
  { id: "morningSnack", label: "Morning snack", optional: true },
  { id: "afternoonSnack", label: "Afternoon snack", optional: true },
];

const STAGE = "toddler12-24";
const CHECK_TOLERANCE = "Check ingredients are already tolerated";
const unique = (items) => [...new Set(items)];
const rolesFor = (ids, foods) =>
  new Set(ids.flatMap((id) => foods[id]?.roles || []));
const allergensFor = (ids, foods) =>
  unique(ids.flatMap((id) => foods[id]?.allergens || []));

function targetDate(date) {
  if (typeof date === "string") return parseLocalDate(date);
  if (date instanceof Date && Number.isFinite(date.valueOf()))
    return parseLocalDate(localDateKey(date));
  return null;
}

function inReviewedAgeRange(data, date) {
  const target = targetDate(date);
  const months = target && getCompletedMonths(data?.babyProfile?.birthDate, target);
  return Number.isInteger(months) && months >= 12 && months < 24;
}

// Recheck snapshots against today's restrictions, even when planning another
// date. A saved choice never establishes tolerance or records consumption.
export function getPlannedMealStatus(meal, { data, foods = {}, date }) {
  if (!inReviewedAgeRange(data, date))
    return {
      allowed: false,
      reason: "These recipe suggestions cover 12–23 completed months. Check the birth date and plan date.",
    };
  if (
    !Array.isArray(meal?.foods) ||
    !meal.foods.length ||
    meal.foods.some((id) => !foods[id] || !Array.isArray(foods[id].allergens))
  )
    return { allowed: false, reason: "Check the recipe’s full ingredient and allergen information." };

  const profile = data.babyProfile;
  const feeds = data.feedingLog || [];
  const safe = getSafeMealOptions({ options: [meal] }, profile, feeds, foods);
  if (!safe.length)
    return {
      allowed: false,
      reason: "This recipe includes an ingredient restricted in Profile or awaiting review after a reaction.",
    };
  const allergens = allergensFor(meal.foods, foods);
  const statuses = getAllergenStatuses(profile, feeds, foods);
  if (allergens.includes("peanut") && statuses.peanut !== "tolerated")
    return {
      allowed: false,
      reason: "Peanut must be confirmed as tolerated in Profile before this recipe is suggested.",
    };
  return {
    allowed: true,
    reason: allergens.some((id) => statuses[id] !== "tolerated")
      ? CHECK_TOLERANCE
      : "",
  };
}

function recipesForSlot(data, foods, slot) {
  const plan = MEAL_PLANS[STAGE];
  const seen = new Set();
  const builtIn = [];
  for (const day of plan.days) {
    for (const meal of day.meals.filter((item) => item.time === slot.label)) {
      meal.options.forEach((option, index) => {
        const ingredientKey = [...option.foods].sort().join("|");
        if (seen.has(ingredientKey)) return;
        seen.add(ingredientKey);
        builtIn.push({
          id: `${STAGE}-${day.day}-${slot.id}-${index}`,
          title: option.title || meal.title || option.description,
          description: option.description || "",
          foods: [...option.foods],
          steps: [...(option.steps || meal.steps || [])],
          sourceIds: [...(option.sourceIds || meal.sourceIds || plan.sourceIds)],
          isCustom: false,
        });
      });
    }
  }
  const custom = (data.recipes || []).map((recipe) => ({
    id: `saved-${recipe.id}`,
    title: recipe.name || recipe.title || recipe.description,
    description: recipe.description || "",
    foods: [...(recipe.foods || [])],
    steps: [...(recipe.steps || [])],
    // These references support known ingredient roles, not a validation of the
    // family recipe. Unknown custom ingredients receive no inferred roles.
    sourceIds: unique((recipe.foods || []).flatMap((id) =>
      (foods[id]?.sources || []).map((source) => source.id),
    )),
    isCustom: true,
  }));
  return [...builtIn, ...custom];
}

function recentIntake(data, date) {
  const end = localDateKey(date);
  const start = new Date(date);
  start.setDate(start.getDate() - 6);
  const startKey = localDateKey(start);
  return (data.feedingLog || []).filter((feed) => {
    const day = localDateKey(feed.date);
    return feed.consumption === "eaten" && day >= startKey && day <= end;
  });
}

// A date-seeded tie break changes suggestions across days without randomness,
// exposed numeric scores, nutrient calculations or allergen exposure quotas.
function tieBreak(value) {
  let hash = 2166136261;
  for (const character of value)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) / 4294967296;
}

export function getRecipeCandidates({ data, foods = {}, date, slotId, selectedMeals = [] }) {
  const slot = DAY_SLOTS.find((item) => item.id === slotId);
  if (!slot || !inReviewedAgeRange(data, date)) return [];
  const target = targetDate(date);
  const recent = recentIntake(data, target);
  const recentCounts = new Map();
  for (const feed of recent)
    for (const id of unique(feed.foods || []))
      recentCounts.set(id, (recentCounts.get(id) || 0) + 1);
  const chosen = new Set(selectedMeals.flatMap((meal) => meal.foods || []));
  const todayEaten = recent
    .filter((feed) => localDateKey(feed.date) === localDateKey(target))
    .flatMap((feed) => feed.foods || []);
  const dayRoles = rolesFor([...chosen, ...todayEaten], foods);

  return recipesForSlot(data, foods, slot)
    .map((candidate) => {
      const status = getPlannedMealStatus(candidate, { data, foods, date });
      if (!status.allowed) return null;
      const roles = rolesFor(candidate.foods, foods);
      let rank = 0;
      if (!slot.optional) {
        // Composition is the first preference; no total establishes adequacy.
        for (const role of ["iron", "energy", "produce"])
          if (roles.has(role)) rank += 100;
        if (roles.has("animal") && !dayRoles.has("animal")) rank += 35;
      }
      for (const id of candidate.foods) {
        const foodRoles = foods[id]?.roles || [];
        if (!foodRoles.some((role) => ["iron", "produce", "animal"].includes(role))) continue;
        if (chosen.has(id)) rank -= 12;
        rank -= Math.min(recentCounts.get(id) || 0, 5) * 2;
      }
      if (selectedMeals.some((meal) =>
        (meal.recipeId || meal.id) === candidate.id ||
        [...(meal.foods || [])].sort().join("|") === [...candidate.foods].sort().join("|"),
      )) rank -= 100;

      const reasons = [];
      if (status.reason) reasons.push(status.reason);
      const differentVegetable = chosen.size > 0 && candidate.foods.some((id) =>
        foods[id]?.category === "Vegetables" && !chosen.has(id),
      );
      if (differentVegetable) reasons.push("Adds a different vegetable");
      if (!slot.optional && roles.has("iron")) reasons.push("Includes an iron-rich food");
      if (!slot.optional && roles.has("animal") && !dayRoles.has("animal"))
        reasons.push("Adds meat, fish or egg to the day");
      if (candidate.isCustom) reasons.push("From your saved recipes");
      if (roles.has("produce")) reasons.push("Includes fruit or vegetables");
      if (!reasons.length) reasons.push("A choice from your recipe collection");
      return {
        candidate: { ...candidate, reasons: reasons.slice(0, 2) },
        rank,
        tie: tieBreak(`${localDateKey(target)}:${slotId}:${candidate.id}`),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.rank - a.rank || b.tie - a.tie || a.candidate.id.localeCompare(b.candidate.id))
    .map((item) => item.candidate);
}

function snapshot(meal, slot = meal.slot) {
  return {
    slot,
    recipeId: meal.recipeId || meal.id,
    title: meal.title,
    description: meal.description || "",
    foods: [...(meal.foods || [])],
    steps: [...(meal.steps || [])],
    sourceIds: [...(meal.sourceIds || [])],
  };
}

export function suggestDay({ data, foods = {}, date, lockedMeals = [] }) {
  if (!inReviewedAgeRange(data, date)) return null;
  const bySlot = new Map();
  for (const meal of lockedMeals) {
    if (DAY_SLOTS.some((slot) => slot.id === meal.slot) && !bySlot.has(meal.slot))
      bySlot.set(meal.slot, snapshot(meal));
  }
  for (const slot of DAY_SLOTS.filter((item) => !item.optional)) {
    if (bySlot.has(slot.id)) continue;
    const candidate = getRecipeCandidates({
      data, foods, date, slotId: slot.id, selectedMeals: [...bySlot.values()],
    })[0];
    if (candidate) bySlot.set(slot.id, snapshot(candidate, slot.id));
  }
  return {
    stage: STAGE,
    meals: DAY_SLOTS.flatMap((slot) => bySlot.has(slot.id) ? [bySlot.get(slot.id)] : []),
  };
}
