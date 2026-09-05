import { ALLERGENS } from "./catalog.js";

export function parseLocalDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return null;
  return date;
}

export function localDateKey(value = new Date()) {
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? parseLocalDate(value)
      : new Date(value);
  if (!date || Number.isNaN(date.valueOf())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const calendarDay = (date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;

export function getCompletedMonths(birthDate, now = new Date()) {
  const birth = parseLocalDate(birthDate);
  if (
    !birth ||
    !Number.isFinite(now.valueOf()) ||
    calendarDay(birth) > calendarDay(now)
  )
    return null;
  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();
  const anniversaryDay = Math.min(
    birth.getDate(),
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  );
  if (now.getDate() < anniversaryDay) months -= 1;
  return months;
}

export function getAgeLabel(birthDate, now = new Date()) {
  const months = getCompletedMonths(birthDate, now);
  if (months === null) return "Add a birth date";
  const birth = parseLocalDate(birthDate);
  const anniversary = new Date(
    birth.getFullYear(),
    birth.getMonth() + months,
    1,
    12,
  );
  anniversary.setDate(
    Math.min(
      birth.getDate(),
      new Date(
        anniversary.getFullYear(),
        anniversary.getMonth() + 1,
        0,
      ).getDate(),
    ),
  );
  const days = calendarDay(now) - calendarDay(anniversary);
  return `${months} month${months === 1 ? "" : "s"}${days ? `, ${days} day${days === 1 ? "" : "s"}` : ""}`;
}

export function toLocalInputValue(value = new Date()) {
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) return "";
  return `${localDateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function fromLocalInputValue(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
  )
    throw new Error("Choose a valid date and time.");
  if (!parseLocalDate(value.slice(0, 10)))
    throw new Error("Choose a valid date.");
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf()) || toLocalInputValue(date) !== value)
    throw new Error("This local time does not exist. Choose another time.");
  return date.toISOString();
}

export function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `entry-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function getTodayFeeds(feeds, now = new Date()) {
  const today = localDateKey(now);
  return feeds
    .filter((feed) => localDateKey(feed.date) === today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getStreak(feeds, now = new Date()) {
  const days = new Set(
    feeds
      .filter((feed) => new Date(feed.date) <= now)
      .map((feed) => localDateKey(feed.date)),
  );
  const cursor = new Date(now);
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function getAllergenStats(feeds, foods, now = new Date()) {
  const counts = Object.fromEntries(
    ALLERGENS.map((allergen) => [allergen.id, 0]),
  );
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  for (const feed of feeds) {
    const date = new Date(feed.date);
    if (feed.consumption !== "eaten" || date < start || date > now) continue;
    const unique = new Set(
      (feed.foods || []).flatMap((id) => foods[id]?.allergens || []),
    );
    for (const allergen of unique)
      counts[allergen] = (counts[allergen] || 0) + 1;
  }
  return counts;
}

export function getAllergenStatuses(profile, feeds, foods) {
  const statuses = Object.fromEntries(
    ALLERGENS.map((allergen) => [
      allergen.id,
      profile.allergenStatus?.[allergen.id] || "unknown",
    ]),
  );
  for (const feed of feeds) {
    if (!feed.reaction || feed.reaction === "None observed") continue;
    const allergens = new Set(
      (feed.foods || []).flatMap((id) => foods[id]?.allergens || []),
    );
    for (const allergen of allergens) {
      const reviewed = new Date(
        profile.allergenReviewedAt?.[allergen] || 0,
      ).valueOf();
      const recordedAt = new Date(
        feed.reactionRecordedAt || feed.date,
      ).valueOf();
      const reviewedAsTolerated =
        profile.allergenStatus?.[allergen] === "tolerated" &&
        reviewed >= recordedAt;
      if (statuses[allergen] !== "avoid" && !reviewedAsTolerated)
        statuses[allergen] = "suspected";
    }
  }
  return statuses;
}

export function getSafeMealOptions(meal, profile, feeds, foods) {
  const statuses = getAllergenStatuses(profile, feeds, foods);
  const foodStatuses = getFoodStatuses(profile, feeds, foods);
  return (meal.options || []).filter((option) =>
    option.foods.every((id) => {
      const food = foods[id];
      if (!food) return false;
      if (["suspected", "avoid"].includes(foodStatuses[id])) return false;
      return food.allergens.every(
        (allergen) =>
          !(profile.dairyFree && allergen === "milk") &&
          !["suspected", "avoid"].includes(statuses[allergen]),
      );
    }),
  );
}

// Any food can be associated with a reaction, including foods outside the named
// allergen groups. Flag ingredients for review without diagnosing the culprit.
export function getFoodStatuses(profile, feeds, foods) {
  const statuses = Object.fromEntries(
    Object.keys(foods).map((id) => [id, profile.foodStatus?.[id] || "unknown"]),
  );
  for (const feed of feeds) {
    if (!feed.reaction || feed.reaction === "None observed") continue;
    for (const id of feed.foods || []) {
      if (!foods[id]) continue;
      const reviewed = new Date(profile.foodReviewedAt?.[id] || 0).valueOf();
      const recorded = new Date(feed.reactionRecordedAt || feed.date).valueOf();
      const reviewedAsTolerated =
        profile.foodStatus?.[id] === "tolerated" && reviewed >= recorded;
      if (statuses[id] !== "avoid" && !reviewedAsTolerated)
        statuses[id] = "suspected";
    }
  }
  return statuses;
}
