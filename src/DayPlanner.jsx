import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { DAY_SLOTS, getRecipeCandidates, getPlannedMealStatus, suggestDay } from "./dailyPlanner.js";
import { getCompletedMonths, localDateKey, parseLocalDate } from "./domain.js";
import { getEvidenceSource } from "./evidence.js";
import "./day-planner.css";
const foodNames = (ids, foods) => ids.map((id) => foods[id]?.name || id).join(", ");
const snapshot = (recipe, slot) => ({
  slot,
  recipeId: recipe.id,
  title: recipe.title,
  description: recipe.description,
  foods: [...recipe.foods],
  steps: [...recipe.steps || []],
  sourceIds: [...recipe.sourceIds || []]
});
const roleNames = { iron: "Iron-rich food", energy: "Energy-rich food", produce: "Vegetables or fruit" };
function RecipeDetails({ meal, foods }) {
  return <details className="day-recipe-details">
      <summary>Recipe & ingredients</summary>
      {meal.steps?.length > 0 ? <ol>{meal.steps.map((step, i) => <li key={i}>{step}</li>)}</ol> : <p>{meal.description}</p>}
      <ul className="day-ingredients">
        {meal.foods.map((id) => <li key={id}><strong>{foods[id]?.name || id}</strong><span>{foods[id]?.preparation}</span></li>)}
      </ul>
      <p className="caption">Offer a small helping and more if wanted. Adapt textures to your child’s skills and check packaged ingredients.</p>
      <details>
        <summary>Why this meal?</summary>
        <dl className="meal-components">
          {Object.entries(roleNames).map(([role, label]) => {
    const ids = meal.foods.filter((id) => foods[id]?.roles?.includes(role));
    return <div key={role}><dt>{label}</dt><dd>{ids.length ? foodNames(ids, foods) : "Not identified in these ingredients"}</dd></div>;
  })}
        </dl>
        <p className="caption">Suggestions use food roles and variety across the day. They do not calculate nutrient amounts or prove that a child’s needs have been met.</p>
        <ul className="source-list">{meal.sourceIds.map(getEvidenceSource).filter(Boolean).map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
        {!meal.sourceIds.length && <p className="caption">Your saved recipe. Its nutritional content has not been assessed.</p>}
      </details>
    </details>;
}
function DayPlanner({ data, foods, now, onSavePlan, onLog, onProfile, Dialog, pending, compact = false }) {
  const today = localDateKey(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = localDateKey(tomorrowDate);
  const [pickedDate, setPickedDate] = useState(today);
  const date = compact ? today : pickedDate;
  const activeDate = useRef(date);
  activeDate.current = date;
  const previousToday = useRef(today);
  useEffect(() => {
    if (pickedDate === previousToday.current) setPickedDate(today);
    previousToday.current = today;
  }, [today, pickedDate]);
  const [slotId, setSlotId] = useState(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(6);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [copied, setCopied] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  const dateId = useId(), searchId = useId();
  const selectedDate = parseLocalDate(date);
  const age = selectedDate ? getCompletedMonths(data.babyProfile.birthDate, selectedDate) : null;
  const supported = age !== null && age >= 12 && age < 24;
  const stored = data.dailyPlans?.[date];
  const proposed = useMemo(() => supported ? suggestDay({ data, foods, date }) : null, [data, foods, date, supported]);
  const plan = stored || proposed || { stage: "toddler12-24", meals: [] };
  const meals = plan.meals;
  const candidates = useMemo(() => slotId ? getRecipeCandidates({ data, foods, date, slotId, selectedMeals: meals.filter((meal) => meal.slot !== slotId) }) : [], [data, foods, date, slotId, meals]);
  const currentMeal = meals.find((meal) => meal.slot === slotId);
  const filtered = candidates.filter((recipe) => recipe.id !== currentMeal?.recipeId && `${recipe.title} ${foodNames(recipe.foods, foods)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const title = date === today ? "Today\u2019s meals" : date === tomorrow ? "Tomorrow\u2019s meals" : selectedDate?.toLocaleDateString(void 0, { day: "numeric", month: "long" }) || "Choose a day";
  const statuses = new Map(meals.map((meal) => [meal.slot, getPlannedMealStatus(meal, { data, foods, date })]));
  const blocked = meals.filter((meal) => !statuses.get(meal.slot).allowed);
  const mainCount = meals.filter((meal) => !DAY_SLOTS.find((slot) => slot.id === meal.slot)?.optional).length;
  const eligibleIds = [...new Set(meals.filter((meal) => statuses.get(meal.slot).allowed).flatMap((meal) => meal.foods))];
  const groceries = eligibleIds.sort((a, b) => (foods[a]?.name || a).localeCompare(foods[b]?.name || b));
  useEffect(() => {
    setSlotId(null);
    setMessage("");
    setSaveError("");
    setCopied("");
    setCopyFallback("");
  }, [date]);
  const openPicker = (id) => {
    setSlotId(id);
    setQuery("");
    setLimit(6);
    setSaveError("");
  };
  const save = async (next) => {
    setSaveError("");
    const ok = await onSavePlan(date, next);
    if (activeDate.current !== date) return ok;
    if (!ok) setSaveError("Your meal choices were not saved. Try again; your previous plan is still available.");
    else setMessage("Meal choices saved on this device.");
    return ok;
  };
  const choose = async (recipe) => {
    const next = { stage: "toddler12-24", meals: [...meals.filter((meal) => meal.slot !== slotId), snapshot(recipe, slotId)] };
    next.meals.sort((a, b) => DAY_SLOTS.findIndex((slot) => slot.id === a.slot) - DAY_SLOTS.findIndex((slot) => slot.id === b.slot));
    if (await save(next) && activeDate.current === date) setSlotId(null);
  };
  const logMeal = (meal) => {
    const when = date === today ? now : parseLocalDate(date);
    onLog({ foods: meal.foods, description: meal.title, mealType: meal.slot.includes("Snack") ? "snack" : meal.slot, date: when.toISOString() });
  };
  const copyGroceries = async () => {
    const text = `${title}
${groceries.map((id) => `- ${foods[id]?.name || id}`).join("\n")}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      if (activeDate.current !== date) return;
      setCopied("Shopping list copied.");
      setCopyFallback("");
    } catch {
      if (activeDate.current !== date) return;
      setCopied("Select the list below to copy it.");
      setCopyFallback(text);
    }
  };
  return <section className={`day-planner ${compact ? "day-planner-compact" : ""}`} aria-label="Daily meal planner">
      <header className="day-planner-heading">
        <div><p className="eyebrow">Your daily plan</p><h2>{title}</h2><p className="muted">{stored ? "Your choices, kept for this day." : "A suggested day to start with. Swap anything you like."}</p></div>
        <span className={`day-plan-state ${stored ? "is-saved" : ""}`}>{stored ? "Saved" : "Suggested"}</span>
      </header>
      {!compact && <div className="day-date-row">
          <div className="segmented" role="group" aria-label="Planning day">
            <button disabled={pending} aria-pressed={date === today} className={date === today ? "is-active" : ""} onClick={() => setPickedDate(today)}>Today</button>
            <button disabled={pending} aria-pressed={date === tomorrow} className={date === tomorrow ? "is-active" : ""} onClick={() => setPickedDate(tomorrow)}>Tomorrow</button>
          </div>
          <div className="field"><label htmlFor={dateId}>Choose date</label><input id={dateId} type="date" value={pickedDate} disabled={pending} onChange={(event) => {
    if (event.target.value) setPickedDate(event.target.value);
  }} /></div>
        </div>}
      {!supported && <div className="notice"><p>{age === null ? "Add a birth date in Profile to get meal suggestions." : "These daily recipe suggestions cover 12\u201323 months. You can still use your diary and browse the other stages."}</p><button className="text-button" onClick={onProfile}>Review profile</button></div>}
      {supported && <p className="day-context">Matched to age and food settings. Choose ingredients your child already tolerates.</p>}
      {data.babyProfile.feedingNotes && <details className="personal-instructions"><summary>Your feeding instructions</summary><p>{data.babyProfile.feedingNotes}</p><p className="caption">Check these when choosing; saved notes are not interpreted automatically.</p></details>}
      {blocked.length > 0 && <div className="notice notice-warning" role="status">{blocked.length === 1 ? "One saved meal needs" : "Some saved meals need"} a review after a change in age or food settings. Swap it before serving; your saved choices have been kept.</div>}
      {saveError && <p className="notice notice-error" role="alert">{saveError}</p>}
      <div className="day-meal-cards">
        {DAY_SLOTS.filter((slot) => !slot.optional).map((slot, index) => {
    const meal = meals.find((item) => item.slot === slot.id);
    const status = meal && statuses.get(slot.id);
    return <article className={`day-meal-card ${status && !status.allowed ? "needs-review" : ""}`} key={`${date}-${slot.id}-${meal?.recipeId || "empty"}`}>
              <div className="day-slot-heading"><span className={`day-slot-mark mark-${index}`} aria-hidden="true">{index + 1}</span><p className="eyebrow">{slot.label}</p><button className="text-button" aria-label={`Swap ${slot.label.toLowerCase()}`} disabled={pending || !supported} onClick={() => openPicker(slot.id)}>{meal ? "Swap" : "Choose"}</button></div>
              {meal ? <>
                <h3>{meal.title}</h3>
                <p className="day-meal-subtitle">{meal.foods.slice(0, 3).map((id) => foods[id]?.name || id).join(" \xB7 ")}</p>
                {status.reason && <p className={status.allowed ? "caption" : "day-restriction"}>{status.reason}</p>}
                <RecipeDetails meal={meal} foods={foods} />
                <button className="button button-secondary wide" disabled={pending || !status.allowed || date > today} onClick={() => logMeal(meal)}>Log {slot.label.toLowerCase()}</button>
              </> : <><h3>Choose {slot.label.toLowerCase()}</h3><p className="muted">No suitable recipe is selected. Try another recipe or review your food settings.</p></>}
            </article>;
  })}
      </div>
      {supported && <>
        <div className="day-snacks">
          <div><h3>Snacks, if wanted</h3><p className="caption">Add one when it suits your day.</p></div>
          {DAY_SLOTS.filter((slot) => slot.optional).map((slot) => {
    const meal = meals.find((item) => item.slot === slot.id);
    return <div className="day-snack-row" key={slot.id}><div><span className="caption">{slot.label}</span>{meal && <><strong>{meal.title}</strong>{statuses.get(slot.id).reason && <span className={statuses.get(slot.id).allowed ? "caption" : "day-restriction"}>{statuses.get(slot.id).reason}</span>}</>}</div><div className="day-snack-actions"><button className="text-button" disabled={pending} onClick={() => openPicker(slot.id)} aria-label={`${meal ? "Swap" : "Add"} ${slot.label.toLowerCase()}`}>{meal ? "Swap" : "+ Add"}</button>{meal && <><button className="text-button" disabled={pending || !statuses.get(slot.id).allowed || date > today} onClick={() => logMeal(meal)} aria-label={`Log ${slot.label.toLowerCase()}`}>Log</button><button className="text-button" disabled={pending} aria-label={`Remove ${slot.label.toLowerCase()}`} onClick={() => save({ ...plan, meals: meals.filter((item) => item.slot !== slot.id) })}>Remove</button></>}</div>{meal && <RecipeDetails meal={meal} foods={foods} />}</div>;
  })}
        </div>
        {!stored && <div className="day-use-row"><button className="button button-primary" disabled={pending || !mainCount || blocked.length > 0} onClick={() => save(plan)}>{pending ? "Saving\u2026" : "Use this day"}</button><p className="caption">Saves your choices. Food is logged separately.</p></div>}
        <p className="day-save-message" role="status" aria-live="polite">{message}</p>
        {date > today && <p className="caption">You can log these meals once this day arrives.</p>}
      </>}
      <details className="day-shopping"><summary>Shopping list · {groceries.length} ingredients</summary><p className="caption">For the meals shown on this date.{blocked.length > 0 ? " Meals awaiting review are excluded." : ""} Check what you already have.</p><ul className="day-shopping-items">{groceries.map((id) => <li key={id}>{foods[id]?.name || id}</li>)}</ul><button className="text-button" disabled={!groceries.length} onClick={copyGroceries}>Copy shopping list</button><p role="status" className="caption">{copied}</p>{copyFallback && <textarea readOnly aria-label="Shopping list to copy" value={copyFallback} rows={6} />}</details>
      <details className="day-method"><summary>How these meals are chosen</summary><p>Suggestions prefer main meals with an iron-rich food, an energy-rich food and vegetables or fruit. Choices also consider variety and meat, fish or egg across the day, while respecting recorded food restrictions.</p><p>These are practical recipes built from the selected WHO, BLISS, LEAP and Nordic research. The app uses ingredients, not measured nutrient totals. Choosing a meal does not mean it was eaten.</p><button className="text-button" onClick={onProfile}>Read the research in Profile</button></details>
      {slotId && <Dialog title={`Choose ${DAY_SLOTS.find((slot) => slot.id === slotId)?.label.toLowerCase()}`} onClose={() => {
    if (!pending) setSlotId(null);
  }}>
        <div className="modal-body day-picker-body"><div className="field"><label htmlFor={searchId}>Search recipes or ingredients</label><input id={searchId} autoFocus type="search" value={query} disabled={pending} onChange={(event) => {
    setQuery(event.target.value);
    setLimit(6);
  }} placeholder="Try chicken, lentils or avocado" /></div><p className="caption">Matched to this day and your food settings. Choosing a recipe saves this day.</p>{saveError && <p role="alert" className="notice notice-error">{saveError}</p>}
          <div className="day-candidates">{filtered.slice(0, limit).map((recipe) => <article className="day-candidate" key={recipe.id}><div><h3>{recipe.title}</h3><p className="caption">{foodNames(recipe.foods, foods)}</p><div className="day-reasons">{recipe.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>{recipe.isCustom && <span className="caption">Your saved recipe</span>}</div><button className="button button-secondary" disabled={pending} aria-label={`Choose ${recipe.title}`} onClick={() => choose(recipe)}>Choose</button></article>)}</div>
          {!filtered.length && <p className="notice">No matching recipes for these settings. Try a different ingredient or review your restrictions in Profile.</p>}
          {filtered.length > limit && <button className="text-button" onClick={() => setLimit((n) => n + 6)}>Show more recipes</button>}
        </div>
      </Dialog>}
    </section>;
}
export {
  DayPlanner as default
};
