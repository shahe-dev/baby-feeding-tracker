import React, {
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FOOD_DATABASE,
  FOOD_CATEGORIES,
  ALLERGENS,
  SOURCES,
} from "./catalog.js";
import { MEAL_PLANS, getRecommendedPlanKey } from "./plans.js";
import { getEvidenceSource, RESEARCH_REVIEW_DATE } from "./evidence.js";
import {
  getCompletedMonths,
  getAgeLabel,
  localDateKey,
  toLocalInputValue,
  fromLocalInputValue,
  getAllergenStats,
  getAllergenStatuses,
  getFoodStatuses,
  getStreak,
  getTodayFeeds,
  makeId,
  getSafeMealOptions,
} from "./domain.js";
import {
  loadData,
  persistData,
  parseBackup,
  createBackup,
  exportRawRecovery,
  readPreviousBackup,
} from "./storage.js";
import "./styles.css";

const SavingContext = React.createContext(false);

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  drink: "Milk / drink",
  breastfeed: "Breastfeed",
};
const MEAL_TYPES = Object.keys(MEAL_LABELS);
const mealLabel = (value) => MEAL_LABELS[value] || value || "Meal";
function mealTypeFromLabel(value = "") {
  const text = value.toLowerCase();
  if (MEAL_TYPES.includes(text)) return text;
  if (text.includes("snack")) return "snack";
  if (text.includes("breast")) return "breastfeed";
  if (text.includes("drink") || text.includes("milk")) return "drink";
  if (text.includes("morning") || text.includes("breakfast"))
    return "breakfast";
  if (text.includes("dinner") || text.includes("evening")) return "dinner";
  if (text.includes("afternoon") || text.includes("lunch")) return "lunch";
  const hour = new Date().getHours();
  return hour < 11 ? "breakfast" : hour < 16 ? "lunch" : "dinner";
}
const REACTIONS = [
  "None observed",
  "Rash",
  "Hives",
  "Swelling",
  "Vomiting",
  "Diarrhea",
  "Fussiness",
];
const STATUS_LABELS = {
  unknown: "Not recorded",
  tolerated: "Tolerated / reviewed",
  suspected: "Suspected reaction",
  avoid: "Medically avoided",
};
const CONSUMPTION_LABELS = {
  eaten: "Eaten / drunk",
  offered: "Offered, intake not confirmed",
  refused: "Refused",
  unknown: "Not recorded",
};
const NAV = [
  { id: "home", label: "Today", icon: "home" },
  { id: "diary", label: "Diary", icon: "book" },
  { id: "meals", label: "Meals", icon: "plate" },
  { id: "foods", label: "Foods", icon: "apple" },
  { id: "profile", label: "Profile", icon: "baby" },
];

function Icon({ name, size = 22 }) {
  const paths = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    book: "M12 5v16m0-16C9 3 5 3 2 4v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1Z",
    plate: "M7 2v7m-3-7v5c0 4 6 4 6 0V2M7 10v12M18 2c-5 4-5 11 1 11V2v20",
    apple:
      "M12 7c-9-5-12 4-7 12 2 4 5 1 7 1s5 3 7-1c5-8 2-17-7-12Zm0 0c0-4 2-5 4-5",
    baby: "M9 12h.01M15 12h.01M9 16c2 2 4 2 6 0M12 3c3 0 5 1 5 3s-4 3-4 0M20 8a9 9 0 1 1-4-4",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    check: "m5 12 4 4L19 6",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    calendar: "M5 5h14v16H5ZM8 2v6m8-6v6M5 11h14",
    leaf: "M4 20C-2 8 8 2 21 3c1 13-5 20-17 17Zm0 0L16 8",
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name] || paths.plate} />
    </svg>
  );
}

function Field({ label, hint, children }) {
  const id = useId();
  const pending = useContext(SavingContext);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {React.cloneElement(children, {
        id,
        disabled: pending || children.props.disabled,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}

function Notice({ children, kind = "info", title }) {
  return (
    <div
      className={`notice notice-${kind}`}
      role={kind === "error" ? "alert" : undefined}
    >
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </div>
  );
}

function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="leaf" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

function SectionTitle({ title, eyebrow, children }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function foodNames(ids, foods) {
  return ids.map((id) => foods[id]?.name || `${id} (saved food)`).join(", ");
}

function formatDate(date, withTime = false) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00`)
    : new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
      });
}

function getFoodMap(customFoods) {
  return {
    ...FOOD_DATABASE,
    ...Object.fromEntries(customFoods.map((food) => [food.id, food])),
  };
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function Sources({ sources = SOURCES, detailed = false }) {
  const values = Array.isArray(sources) ? sources : Object.values(sources);
  return (
    <ul className="source-list">
      {values.map((source, index) =>
        typeof source === "object" && source.url ? (
          <li key={source.url || index}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.label || source.title || source.url}
              <span aria-hidden="true"> ↗</span>
            </a>
            {detailed && (
              <div className="source-context">
                <p className="caption">{source.type} · {source.ageRange}</p>
                <p>{source.finding}</p>
                <p className="caption">{source.limitations}</p>
                <p className="caption">{source.provenance}</p>
              </div>
            )}
          </li>
        ) : null,
      )}
    </ul>
  );
}

const FOOD_ROLES = [
  { id: "iron", label: "Iron-rich component" },
  { id: "energy", label: "Energy-rich component" },
  { id: "produce", label: "Vegetables or fruit" },
];

function MealComponents({ ids, foods }) {
  return (
    <dl className="meal-components">
      {FOOD_ROLES.map(({ id, label }) => {
        const matches = ids.filter((foodId) => foods[foodId]?.roles?.includes(id));
        return (
          <div key={id}>
            <dt>{label}</dt>
            <dd>{matches.length ? foodNames(matches, foods) : "Choose a suitable addition"}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function PeanutResearch() {
  return (
    <details className="research-note">
      <summary>What the peanut research means</summary>
      <p>
        LEAP studied children who started peanut between 4 and under 11 months
        and continued to age five. Its regimen was 6 g of peanut protein per
        week across at least three meals. That is peanut protein, not the
        weight of peanut butter.
      </p>
      <p>
        This gives context for continued use of already tolerated peanut under
        your child’s existing plan. It does not establish first introduction at
        this age, a minimum effective dose, or missed-dose and catch-up rules.
        Suspected or avoided foods need individual advice. The other allergens
        do not inherit the peanut regimen.
      </p>
      <p className="caption">
        Eating-occasion counts and the menu rotation do not measure the trial
        dose. Record the product and actual amount in the diary when known.
      </p>
      <Sources sources={[getEvidenceSource("leap"), getEvidenceSource("leapOn"), getEvidenceSource("leapSpecificity")]} />
    </details>
  );
}

function DailyFoodPattern({ today, foods }) {
  const eaten = new Set(today.filter((feed) => feed.consumption === "eaten").flatMap((feed) => feed.foods));
  const offered = new Set(today.filter((feed) => ["offered", "refused"].includes(feed.consumption)).flatMap((feed) => feed.foods));
  const roles = [...FOOD_ROLES, { id: "animal", label: "Meat, fish or egg across the day" }];
  return (
    <section className="card">
      <SectionTitle title="Today’s food pattern" eyebrow="From your diary" />
      <dl className="meal-components daily-pattern">
        {roles.map(({ id, label }) => {
          const confirmed = [...eaten].filter((key) => foods[key]?.roles?.includes(id));
          const onlyOffered = [...offered].filter((key) => !eaten.has(key) && foods[key]?.roles?.includes(id));
          return (
            <div key={id}>
              <dt>{label}</dt>
              <dd>
                {confirmed.length ? `Eaten: ${foodNames(confirmed, foods)}` : "No confirmed intake recorded"}
                {onlyOffered.length > 0 && <span className="caption">Offered only: {foodNames(onlyOffered, foods)}</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="caption">
        BLISS informs the iron, energy and produce prompts; WHO informs the
        daily meat, fish or egg prompt. These show recorded foods, not nutrient
        quantities or targets to make your child finish. Custom foods may have
        no assigned role.
      </p>
      <Sources sources={[getEvidenceSource("blissProtocol"), getEvidenceSource("who2023")]} />
    </section>
  );
}

function ResearchGuide({ months }) {
  return (
    <section className="card stack">
      <SectionTitle title="Feeding research" eyebrow={`Reviewed ${RESEARCH_REVIEW_DATE}`} />
      <p>
        WHO 2023, LEAP, Scandinavian/Nordic research and NZ BLISS are the
        research basis. The meal combinations and portions are practical
        adaptations. Each source below explains what was studied and its limits.
      </p>
      {months >= 12 && months < 24 && (
        <details>
          <summary>Reference values for 12–23 months</summary>
          <p>
            Nordic guidance gives protein 10–15%, fat 30–40% and carbohydrate
            45–60% of total dietary energy, including milk feeds. These concern
            the whole diet, not the proportions of each plate.
          </p>
          <p>
            Its single-year “1 y” table gives iron 7 mg, vitamin D 10 micrograms,
            calcium 400 mg and zinc 4.0 mg per day. These are usual intake
            references, not supplement doses. The diary does not calculate
            nutrient adequacy.
          </p>
          <Sources sources={[getEvidenceSource("nordic2023"), getEvidenceSource("nordicIntakes")]} />
        </details>
      )}
      <PeanutResearch />
      <details>
        <summary>Studies, findings and limits</summary>
        <Sources detailed />
      </details>
      <p className="caption">
        NNR2023, OTIS and PreventADALL were identified during the further
        Nordic review. The original selected PDFs were not available to match
        every reference exactly.
      </p>
      <p>
        <a href="https://github.com/shahe-dev/baby-feeding-tracker/blob/master/docs/feeding-research-12-23-months.md" target="_blank" rel="noreferrer">Full toddler evidence review</a>
        {" · "}
        <a href="https://github.com/shahe-dev/baby-feeding-tracker/blob/master/docs/revised-evidence-based-feeding-schedule.md" target="_blank" rel="noreferrer">Original research summary (archive)</a>
      </p>
      <p className="caption">The archive preserves the original wording; the current review identifies claims that need correcting.</p>
    </section>
  );
}

function SafetyNote() {
  return (
    <p className="safety-note">
      Keep your child seated and supervised. Prepare food for their chewing and
      swallowing skills; soften hard foods, remove bones and thin or spread nut
      butters. Follow their hunger and fullness cues.
    </p>
  );
}

function FeedItem({ feed, foods, onEdit, onDelete }) {
  const reaction = feed.reaction && feed.reaction !== "None observed";
  return (
    <article className="feed-item">
      <div className="feed-top">
        <div>
          <h3>{mealLabel(feed.mealType)}</h3>
          <time dateTime={feed.date}>{formatDate(feed.date, true)}</time>
        </div>
        <span
          className={`badge ${feed.consumption === "eaten" ? "badge-blue" : "badge-neutral"}`}
        >
          {CONSUMPTION_LABELS[feed.consumption] || "Not recorded"}
        </span>
      </div>
      <p className="food-names">
        {foodNames(feed.foods, foods) || "No ingredients recorded"}
      </p>
      {feed.description && <p className="muted">{feed.description}</p>}
      {feed.amount && (
        <p>
          <span className="detail-label">Amount</span> {feed.amount}
        </p>
      )}
      {feed.notes && (
        <p>
          <span className="detail-label">Notes</span> {feed.notes}
        </p>
      )}
      {reaction && (
        <p className="reaction-line">
          <span className="status-dot" />
          {feed.reaction}
          {feed.reactionSeverity ? ` · ${feed.reactionSeverity}` : ""}
          <span className="muted"> — recorded observation</span>
        </p>
      )}
      {(onEdit || onDelete) && (
        <div className="item-actions">
          {onEdit && (
            <button
              className="text-button"
              onClick={() => onEdit(feed)}
              aria-label={`Edit ${feed.mealType || "meal"} on ${formatDate(feed.date, true)}`}
            >
              Edit entry
            </button>
          )}
          {onDelete && (
            <button
              className="text-button danger"
              onClick={() => onDelete(feed)}
              aria-label={`Delete ${feed.mealType || "meal"} on ${formatDate(feed.date, true)}`}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function AllergenSummary({ data, foods, now, compact = false, onProfile }) {
  const stats = getAllergenStats(data.feedingLog, foods, now);
  const statuses = getAllergenStatuses(
    data.babyProfile,
    data.feedingLog,
    foods,
  );
  const needsReview = ALLERGENS.filter(
    (allergen) => statuses[allergen.id] === "suspected",
  );
  const foodStatuses = getFoodStatuses(
    data.babyProfile,
    data.feedingLog,
    foods,
  );
  const suspectFoods = Object.keys(foodStatuses).filter(
    (id) => foodStatuses[id] === "suspected",
  );
  return (
    <section className="card">
      <SectionTitle
        title="Food reactions & allergens"
        eyebrow="Your observations"
      >
        {onProfile && (
          <button className="text-button" onClick={onProfile}>
            Manage
          </button>
        )}
      </SectionTitle>
      {needsReview.length > 0 && (
        <Notice kind="warning">
          Meal suggestions containing{" "}
          {needsReview.map((a) => a.label.toLowerCase()).join(", ")} are paused
          because a reaction was recorded. Ask your child’s clinician before
          offering a suspected food again. A symptom record does not confirm an
          allergy.
        </Notice>
      )}
      {suspectFoods.length > 0 && (
        <Notice kind="warning">
          Foods awaiting review: {foodNames(suspectFoods, foods)}. A symptom
          recorded after a mixed meal does not identify which ingredient caused
          it; these foods are paused in suggestions until reviewed.
        </Notice>
      )}
      <p className="muted">
        Counts show eating occasions in the last 7 local days. Each allergen is
        counted once per entry with confirmed intake.
      </p>
      <div className={`allergen-grid ${compact ? "compact" : ""}`}>
        {ALLERGENS.map((allergen) => {
          const status = statuses[allergen.id] || "unknown";
          const excluded =
            status === "avoid" ||
            (data.babyProfile.dairyFree && allergen.id === "milk");
          return (
            <div key={allergen.id} className={`allergen-cell status-${status}`}>
              <div>
                <strong>{allergen.label}</strong>
                <span className={`status-text ${excluded ? "excluded" : ""}`}>
                  {excluded
                    ? status === "avoid"
                      ? "Medically avoided"
                      : "Dairy-free setting"
                    : STATUS_LABELS[status]}
                </span>
              </div>
              <span
                className="allergen-count"
                aria-label={`${stats[allergen.id] || 0} eating occasions`}
              >
                {stats[allergen.id] || 0}
                <small>occasions</small>
              </span>
            </div>
          );
        })}
      </div>
      <p className="caption">
        This is a record, not an allergy test or a target to complete. Check
        packaging and record every ingredient; the food list cannot detect
        undeclared allergens.
      </p>
      <PeanutResearch />
    </section>
  );
}

function Dashboard({ data, foods, now, onLog, onEdit, onNavigate }) {
  const today = [...getTodayFeeds(data.feedingLog, now)].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const months = getCompletedMonths(data.babyProfile.birthDate, now);
  const key = getRecommendedPlanKey(data.babyProfile, now);
  const plan = MEAL_PLANS[key];
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekFoods = new Set(
    data.feedingLog
      .filter(
        (feed) =>
          feed.consumption === "eaten" &&
          new Date(feed.date) >= weekStart &&
          new Date(feed.date) <= now,
      )
      .flatMap((feed) => feed.foods),
  );
  const dayPlan = plan?.days[((now.getDay() + 6) % 7) % plan.days.length];
  const firstMeal = dayPlan?.meals.find(
    (meal) =>
      getSafeMealOptions(meal, data.babyProfile, data.feedingLog, foods)
        .length > 0,
  );
  const firstOption =
    firstMeal &&
    getSafeMealOptions(firstMeal, data.babyProfile, data.feedingLog, foods)[0];
  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">
            {now.toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1>
            {data.babyProfile.name
              ? `${data.babyProfile.name}’s day`
              : "One meal at a time"}
          </h1>
          <p className="hero-subtitle">
            {data.babyProfile.birthDate
              ? getAgeLabel(data.babyProfile.birthDate, now)
              : "A feeding diary that grows with your child."}
          </p>
          {plan && <span className="hero-stage">{plan.name}</span>}
        </div>
        <span className="hero-illustration" aria-hidden="true">
          <Icon name="apple" size={70} />
        </span>
        <button
          className="button button-white hero-action"
          onClick={() => onLog()}
        >
          <Icon name="plus" />
          Log food or drink
        </button>
      </section>
      {!data.babyProfile.birthDate && (
        <Notice title="Set a birthday for useful meal guidance">
          Add your child’s birth date in their profile. Plans update by
          completed age while keeping your food restrictions.
          <button className="text-button" onClick={() => onNavigate("profile")}>
            Set birthday <Icon name="arrow" size={16} />
          </button>
        </Notice>
      )}
      <div className="stat-grid">
        <div className="stat">
          <strong>{today.length}</strong>
          <span>entries today</span>
        </div>
        <div className="stat">
          <strong>{weekFoods.size}</strong>
          <span>foods eaten this week</span>
        </div>
        <div className="stat">
          <strong>{getStreak(data.feedingLog, now)}</strong>
          <span>days logged in a row</span>
        </div>
      </div>
      {months >= 12 && months < 24 && (
        <section className="card routine-card">
          <div className="section-icon">
            <Icon name="plate" />
          </div>
          <div>
            <h2>Room for family meals</h2>
            <p>
              Build meals around an iron-rich food, an energy-rich food and
              vegetables or fruit. Our menu uses three meals and two optional
              snacks as a flexible routine. Record drinks too, and follow appetite.
            </p>
            <button className="text-button" onClick={() => onNavigate("meals")}>
              See meal ideas <Icon name="arrow" size={16} />
            </button>
          </div>
        </section>
      )}
      {months >= 6 && months < 24 && <DailyFoodPattern today={today} foods={foods} />}
      {firstOption && (
        <section className="card meal-pick">
          <SectionTitle title="An idea for today" eyebrow={plan.name} />
          <p className="meal-description">{firstOption.description}</p>
          <p className="muted">{foodNames(firstOption.foods, foods)}</p>
          {months >= 12 && months < 24 && !firstMeal.optional && <MealComponents ids={firstOption.foods} foods={foods} />}
          <div className="button-row">
            <button
              className="button button-secondary"
              onClick={() =>
                onLog({ ...firstOption, mealType: firstMeal.time })
              }
            >
              Use in a log
            </button>
            <button className="text-button" onClick={() => onNavigate("meals")}>
              More ideas <Icon name="arrow" size={16} />
            </button>
          </div>
          <p className="caption">
            Confirm what was actually offered or eaten before saving.
          </p>
        </section>
      )}
      <section className="card">
        <SectionTitle title="Today’s diary">
          <button className="text-button" onClick={() => onNavigate("diary")}>
            Full history <Icon name="arrow" size={16} />
          </button>
        </SectionTitle>
        {today.length ? (
          <div className="feed-list">
            {today.map((feed) => (
              <FeedItem
                key={feed.id}
                feed={feed}
                foods={foods}
                onEdit={onEdit}
              />
            ))}
          </div>
        ) : (
          <Empty title="A fresh page for today">
            Log a meal, a snack or a drink. You can add earlier dates in the
            diary.
          </Empty>
        )}
      </section>
      <AllergenSummary
        data={data}
        foods={foods}
        now={now}
        compact
        onProfile={() => onNavigate("profile")}
      />
    </div>
  );
}

function Diary({ data, foods, onLog, onEdit, onDelete }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("");
  const [reactionOnly, setReactionOnly] = useState(false);
  const [visible, setVisible] = useState(30);
  const filtered = [...data.feedingLog]
    .filter((feed) => {
      const key = localDateKey(new Date(feed.date));
      const text =
        `${foodNames(feed.foods, foods)} ${feed.description || ""} ${feed.notes || ""}`.toLowerCase();
      return (
        (!from || key >= from) &&
        (!to || key <= to) &&
        (!mealType || feed.mealType === mealType) &&
        (!reactionOnly ||
          (feed.reaction && feed.reaction !== "None observed")) &&
        (!search || text.includes(search.toLowerCase()))
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="page">
      <SectionTitle title="Feeding diary" eyebrow="Every day, in one place">
        <button className="button button-primary" onClick={() => onLog()}>
          <Icon name="plus" />
          Add entry
        </button>
      </SectionTitle>
      <section className="card">
        <Field label="Search food or notes">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisible(30);
            }}
            placeholder="e.g. pasta, loved it"
          />
        </Field>
        <div className="form-grid">
          <Field label="From date">
            <input
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setVisible(30);
              }}
            />
          </Field>
          <Field label="To date">
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => {
                setTo(event.target.value);
                setVisible(30);
              }}
            />
          </Field>
          <Field label="Meal or drink">
            <select
              value={mealType}
              onChange={(event) => {
                setMealType(event.target.value);
                setVisible(30);
              }}
            >
              <option value="">All entries</option>
              {[
                ...new Set([
                  ...MEAL_TYPES,
                  ...data.feedingLog
                    .map((feed) => feed.mealType)
                    .filter(Boolean),
                ]),
              ].map((type) => (
                <option key={type} value={type}>
                  {mealLabel(type)}
                </option>
              ))}
            </select>
          </Field>
          <label className="check-row filter-check">
            <input
              type="checkbox"
              checked={reactionOnly}
              onChange={(event) => {
                setReactionOnly(event.target.checked);
                setVisible(30);
              }}
            />
            With recorded symptoms
          </label>
        </div>
        {(from || to || search || mealType || reactionOnly) && (
          <button
            className="text-button"
            onClick={() => {
              setFrom("");
              setTo("");
              setSearch("");
              setMealType("");
              setReactionOnly(false);
            }}
          >
            Clear filters
          </button>
        )}
      </section>
      {data.feedingLog.some((feed) => feed.consumption === "unknown") && (
        <Notice>
          Some entries have no confirmed intake, including records from the
          original app. They stay in your history but do not count as allergen
          eating occasions. Edit an entry if you know what was eaten.
        </Notice>
      )}
      <section className="card">
        <div className="section-heading">
          <h2>
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </h2>
          <span className="caption">Newest first · local time</span>
        </div>
        {filtered.length ? (
          <>
            <div className="feed-list">
              {filtered.slice(0, visible).map((feed) => (
                <FeedItem
                  key={feed.id}
                  feed={feed}
                  foods={foods}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
            {visible < filtered.length && (
              <button
                className="button button-secondary wide"
                onClick={() => setVisible((count) => count + 30)}
              >
                Show more entries
              </button>
            )}
          </>
        ) : (
          <Empty
            title={
              data.feedingLog.length
                ? "No matching entries"
                : "Your diary starts here"
            }
          >
            {data.feedingLog.length
              ? "Try a wider date range or clear the filters."
              : "Record what your child ate or drank, including amounts and any symptoms."}
          </Empty>
        )}
      </section>
    </div>
  );
}

function FoodPicker({
  foods,
  selected,
  onChange,
  profile,
  feeds,
  disabled = false,
}) {
  const pending = useContext(SavingContext);
  disabled ||= pending;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const statuses = getAllergenStatuses(profile, feeds, foods);
  const foodStatuses = getFoodStatuses(profile, feeds, foods);
  const categories = [
    ...new Set([
      ...Object.keys(FOOD_CATEGORIES),
      ...Object.values(foods).map((food) => food.category || "Other"),
    ]),
  ];
  const matches = Object.entries(foods).filter(
    ([id, food]) =>
      (!search || food.name.toLowerCase().includes(search.toLowerCase())) &&
      (!category || (food.category || "Other") === category),
  );
  const toggle = (id) =>
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  return (
    <div className="food-picker">
      <div className="selected-foods" aria-label="Selected foods">
        {selected.length ? (
          selected.map((id) => (
            <button
              type="button"
              key={id}
              className="selected-chip"
              onClick={() => toggle(id)}
              disabled={disabled}
              aria-label={`Remove ${foods[id]?.name || id}`}
            >
              {foods[id]?.name || id}
              <Icon name="close" size={14} />
            </button>
          ))
        ) : (
          <p className="caption">
            Choose every ingredient, including sauces, spreads and drinks.
          </p>
        )}
      </div>
      <div className="form-grid">
        <Field label="Search foods">
          <input
            type="search"
            placeholder="Search all foods"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>
        <Field label="Food category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="food-options">
        {matches.map(([id, food]) => {
          const warning =
            ["suspected", "avoid"].includes(foodStatuses[id]) ||
            (food.allergens || []).some(
              (allergen) =>
                ["suspected", "avoid"].includes(statuses[allergen]) ||
                (profile.dairyFree && allergen === "milk"),
            );
          return (
            <button
              type="button"
              key={id}
              className={`food-option ${selected.includes(id) ? "is-selected" : ""}`}
              aria-pressed={selected.includes(id)}
              onClick={() => toggle(id)}
              disabled={disabled}
            >
              <span className="food-check">
                {selected.includes(id) && <Icon name="check" size={15} />}
              </span>
              <span>
                {food.name}
                {warning && (
                  <small className="danger">
                    Restricted or needs review · recording only
                  </small>
                )}
              </span>
            </button>
          );
        })}
        {!matches.length && (
          <p className="muted">
            No matches. Add missing foods in the Foods tab before logging.
          </p>
        )}
      </div>
      <p className="caption">
        Restricted foods remain available here so accidental intake can be
        recorded. They are excluded from meal suggestions.
      </p>
    </div>
  );
}

function Modal({ title, children, onClose, className = "" }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-heading">
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function FeedEditor({ entry, seed, data, foods, onSave, onClose, saveError }) {
  const pending = useContext(SavingContext);
  const initial = useRef({
    date: toLocalInputValue(entry?.date ? new Date(entry.date) : new Date()),
    mealType: entry?.mealType || mealTypeFromLabel(seed?.mealType),
    foods: entry?.foods || seed?.foods || [],
    amount: entry?.amount || "",
    notes: entry?.notes || "",
    description: entry?.description || seed?.description || "",
    consumption: entry?.consumption || "",
    reaction: entry?.reaction || "None observed",
    reactionSeverity: entry?.reactionSeverity || "",
  });
  const [form, setForm] = useState(initial.current);
  const [error, setError] = useState("");
  const changed = JSON.stringify(form) !== JSON.stringify(initial.current);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const close = () => {
    if (pending) return;
    if (!changed || window.confirm("Discard your unsaved feeding entry?"))
      onClose();
  };
  const save = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.foods.length && form.mealType !== "breastfeed")
      return setError(
        "Select the foods or drink in this entry. Add a missing food in the Foods tab first.",
      );
    if (!form.consumption)
      return setError("Choose whether food was eaten, offered or refused.");
    let date;
    try {
      date = fromLocalInputValue(form.date);
      if (date instanceof Date) date = date.toISOString();
    } catch {
      return setError("Enter a valid date and time.");
    }
    if (!date || Number.isNaN(new Date(date).getTime()))
      return setError("Enter a valid date and time.");
    if (new Date(date).getTime() > Date.now() + 60_000)
      return setError("Choose a time that has already happened.");
    if (form.reaction !== "None observed" && !form.reactionSeverity)
      return setError("Choose the severity of the recorded symptom.");
    const changedReaction =
      reaction &&
      (!entry ||
        entry.reaction !== form.reaction ||
        entry.reactionSeverity !== form.reactionSeverity ||
        JSON.stringify([...entry.foods].sort()) !==
          JSON.stringify([...form.foods].sort()));
    const next = {
      ...form,
      ...(reaction
        ? {
            reactionRecordedAt: changedReaction
              ? new Date().toISOString()
              : entry?.reactionRecordedAt ||
                entry?.date ||
                new Date().toISOString(),
          }
        : {}),
      id: entry?.id || makeId(),
      date: new Date(date).toISOString(),
      foods: [...new Set(form.foods)],
      amount: form.amount.trim(),
      notes: form.notes.trim(),
      description: form.description.trim(),
      reactionSeverity:
        form.reaction === "None observed" ? "" : form.reactionSeverity,
    };
    if (await onSave(next)) onClose();
  };
  const reaction = form.reaction !== "None observed";
  return (
    <Modal
      title={entry ? "Edit diary entry" : "Log food or drink"}
      onClose={close}
    >
      <form onSubmit={save} className="modal-body stack">
        {seed && (
          <Notice>
            Meal ingredients are prefilled. Remove anything you did not serve
            and confirm actual intake below.
          </Notice>
        )}
        <div className="form-grid">
          <Field
            label="Date and time"
            hint="Shown and entered in your device’s local time."
          >
            <input
              type="datetime-local"
              value={form.date}
              max={toLocalInputValue(new Date())}
              onChange={(event) => update("date", event.target.value)}
              required
            />
          </Field>
          <Field label="Meal or drink">
            <select
              value={form.mealType}
              onChange={(event) => update("mealType", event.target.value)}
            >
              {[...new Set([...MEAL_TYPES, form.mealType])].map((type) => (
                <option key={type} value={type}>
                  {mealLabel(type)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {data.recipes.length > 0 && (
          <Field label="Use a saved recipe">
            <select
              value=""
              onChange={(event) => {
                const recipe = data.recipes.find(
                  (item) => item.id === event.target.value,
                );
                if (recipe)
                  setForm((current) => ({
                    ...current,
                    foods: [...new Set([...current.foods, ...recipe.foods])],
                    description:
                      recipe.name +
                      (recipe.description ? ` — ${recipe.description}` : ""),
                  }));
              }}
            >
              <option value="">Choose a recipe to add its ingredients</option>
              {data.recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <fieldset>
          <legend>Foods & ingredients</legend>
          <FoodPicker
            foods={foods}
            selected={form.foods}
            onChange={(value) => update("foods", value)}
            profile={data.babyProfile}
            feeds={data.feedingLog}
          />
        </fieldset>
        <Field
          label="What happened?"
          hint="Only confirmed eating or drinking counts in allergen totals."
        >
          <select
            value={form.consumption}
            required
            onChange={(event) => update("consumption", event.target.value)}
          >
            <option value="" disabled>
              Confirm actual intake
            </option>
            {Object.entries(CONSUMPTION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Amount (optional)"
          hint="Use the unit that helps you: a few bites, 2 tbsp, half a banana or 120 ml."
        >
          <input
            value={form.amount}
            maxLength={200}
            onChange={(event) => update("amount", event.target.value)}
            placeholder="e.g. a few bites"
          />
        </Field>
        <Field label="Meal description (optional)">
          <input
            value={form.description}
            maxLength={500}
            onChange={(event) => update("description", event.target.value)}
            placeholder="e.g. family pasta with soft vegetables"
          />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            value={form.notes}
            maxLength={3000}
            rows={3}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Appetite, texture, preparation or anything useful"
          />
        </Field>
        <div className="form-grid">
          <Field label="Observed symptom">
            <select
              value={form.reaction}
              onChange={(event) => update("reaction", event.target.value)}
            >
              {REACTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </Field>
          {reaction && (
            <Field label="Observed severity">
              <select
                value={form.reactionSeverity}
                required
                onChange={(event) =>
                  update("reactionSeverity", event.target.value)
                }
              >
                <option value="">Choose severity</option>
                {["Mild", "Moderate", "Severe"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
        {reaction && (
          <Notice kind="warning" title="Record the observation and seek advice">
            The app cannot identify the cause. Ingredients containing allergens
            will be marked for review and paused in suggestions. Note when
            symptoms began and contact your child’s clinician before offering a
            suspected food again.
          </Notice>
        )}
        {reaction && (
          <Notice kind="error" title="Urgent symptoms">
            For breathing difficulty, swelling of the tongue or throat,
            collapse, or a child becoming floppy or unresponsive, call your
            local emergency number immediately. Follow any prescribed allergy
            emergency plan.
          </Notice>
        )}
        {(error || saveError) && (
          <Notice kind="error">{error || saveError}</Notice>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="button button-primary"
            type="submit"
            disabled={pending}
          >
            {pending ? "Saving…" : entry ? "Save changes" : "Save entry"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MealPlanner({ data, foods, now, browseKey, onBrowse, onLog }) {
  const recommended = getRecommendedPlanKey(data.babyProfile, now);
  const key = browseKey || recommended;
  const age = getCompletedMonths(data.babyProfile.birthDate, now);
  const servingKey =
    age === null || age >= 24
      ? null
      : age < 8
        ? "6-7mo"
        : age < 10
          ? "8-9mo"
          : age < 12
            ? "10-12mo"
            : "12-24mo";
  const plan = MEAL_PLANS[key];
  const [dayIndex, setDayIndex] = useState(0);
  const [checked, setChecked] = useState({});
  const [copyMessage, setCopyMessage] = useState("");
  const [copyFallback, setCopyFallback] = useState("");
  useEffect(() => {
    setDayIndex(0);
    setChecked({});
  }, [key]);
  const day = plan?.days[Math.min(dayIndex, plan.days.length - 1)];
  const groceryIds = [
    ...new Set(
      (plan?.days || []).flatMap((item) =>
        item.meals.flatMap((meal) =>
          getSafeMealOptions(
            meal,
            data.babyProfile,
            data.feedingLog,
            foods,
          ).flatMap((option) => option.foods),
        ),
      ),
    ),
  ].sort((a, b) => (foods[a]?.name || a).localeCompare(foods[b]?.name || b));
  const copyGroceries = async () => {
    const text = `${plan.name} — grocery checklist\n${groceryIds.map((id) => `${checked[id] ? "[x]" : "[ ]"} ${foods[id]?.name || id}`).join("\n")}`;
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard is unavailable.");
      await navigator.clipboard.writeText(text);
      setCopyMessage("Grocery list copied.");
      setCopyFallback("");
    } catch {
      setCopyMessage(
        "Automatic copy is unavailable. Select the text below to copy it.",
      );
      setCopyFallback(text);
    }
  };
  const statuses = getAllergenStatuses(
    data.babyProfile,
    data.feedingLog,
    foods,
  );
  const restricted = ALLERGENS.filter(
    (item) =>
      ["avoid", "suspected"].includes(statuses[item.id]) ||
      (data.babyProfile.dairyFree && item.id === "milk"),
  );
  if (!plan)
    return (
      <div className="page">
        <SectionTitle title="Meal ideas" eyebrow="A flexible place to start" />
        <section className="card stack">
          <Empty
            title={
              age === null
                ? "Add a birthday first"
                : age < 6
                  ? "Milk feeds come first"
                  : "Keep building your family routine"
            }
          >
            {age === null
              ? "Set your child’s birth date in Profile to see the appropriate stage."
              : age < 6
                ? "No solids plan is selected before 6 months. Discuss readiness and feeding with your child’s clinician."
                : "The built-in plans cover 6–23 months. Your diary, drinks, recipes and food restrictions still work as your child grows."}
          </Empty>
          <Field
            label="Browse a stage manually"
            hint="Browsing is optional; use preparation suited to your child’s abilities."
          >
            <select value="" onChange={(event) => onBrowse(event.target.value)}>
              <option value="">Choose a plan to browse</option>
              {Object.entries(MEAL_PLANS).map(([id, value]) => (
                <option value={id} key={id}>
                  {value.name}
                </option>
              ))}
            </select>
          </Field>
        </section>
      </div>
    );
  return (
    <div className="page">
      <SectionTitle title="Meal ideas" eyebrow="A flexible place to start" />
      <section className="card stack">
        <Field label="Feeding stage">
          <select
            value={key}
            onChange={(event) => onBrowse(event.target.value)}
          >
            {Object.entries(MEAL_PLANS).map(([id, value]) => (
              <option value={id} key={id}>
                {value.name}
                {id === recommended ? " · recommended by age" : ""}
              </option>
            ))}
          </select>
        </Field>
        {browseKey && (
          <button
            className="text-button align-start"
            onClick={() => onBrowse(null)}
          >
            Use age-based stage
          </button>
        )}
        {!recommended && (
          <Notice>
            {age === null
              ? "A birth date has not been set. This is a manually selected plan."
              : age < 6
                ? "This is a manually selected solids plan. Before 6 months, discuss readiness and feeding with your child’s clinician."
                : "This is a manually selected plan from the 6–23-month collection."}
          </Notice>
        )}
        {browseKey && browseKey !== recommended && (
          <Notice>
            You are browsing another stage. Use foods and preparation
            appropriate to your child’s development and medical advice.
          </Notice>
        )}
        <div>
          <h2>{plan.name}</h2>
          <p className="muted">{plan.ageRange}</p>
          {plan.evidenceNote && <p className="caption">{plan.evidenceNote}</p>}
        </div>
        {data.babyProfile.feedingNotes && (
          <details className="personal-instructions">
            <summary>Your feeding instructions</summary>
            <p>{data.babyProfile.feedingNotes}</p>
            <p className="caption">Saved in Profile. Check these instructions when choosing a meal; they are not interpreted automatically.</p>
          </details>
        )}
        {plan.guidance?.length > 0 && (
          <ul className="guidance-list">
            {plan.guidance.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <p className="caption">
          Preparation in profile:{" "}
          {data.babyProfile.texture === "puree"
            ? "smooth purées"
            : data.babyProfile.texture === "mashed"
              ? "mashed foods"
              : data.babyProfile.texture === "finger"
                ? "soft finger foods"
                : "adapted family textures"}
          . An age stage does not assess chewing or swallowing skills.
        </p>
        <SafetyNote />
        {restricted.length > 0 && (
          <Notice>
            Options containing{" "}
            {restricted.map((item) => item.label.toLowerCase()).join(", ")} are
            hidden by your restrictions or symptom history. Choose a suitable
            alternative with your clinician where needed.
          </Notice>
        )}
      </section>
      <div className="day-picker" role="group" aria-label="Plan day">
        {plan.days.map((item, index) => (
          <button
            key={index}
            className={dayIndex === index ? "is-active" : ""}
            aria-pressed={dayIndex === index}
            onClick={() => setDayIndex(index)}
          >
            <span>Day</span>
            <strong>{item.day || index + 1}</strong>
          </button>
        ))}
      </div>
      <div className="meal-grid">
        {day.meals.map((meal, index) => {
          const options = getSafeMealOptions(
            meal,
            data.babyProfile,
            data.feedingLog,
            foods,
          );
          return (
            <section className="card" key={`${key}-${dayIndex}-${index}`}>
              <SectionTitle title={meal.time}>
                {meal.optional && (
                  <span className="badge badge-neutral">Optional</span>
                )}
              </SectionTitle>
              {options.length ? (
                options.map((option, optionIndex) => (
                  <div className="meal-option" key={optionIndex}>
                    <h3>{option.description}</h3>
                    <p className="muted">{foodNames(option.foods, foods)}</p>
                    {key === "toddler12-24" && !meal.optional && <MealComponents ids={option.foods} foods={foods} />}
                    <details>
                      <summary>Preparation & ingredients</summary>
                      <ul className="preparation-list">
                        {option.foods.map((id) => (
                          <li key={id}>
                            <strong>{foods[id]?.name || id}</strong>
                            {foods[id]?.preparation && (
                              <span>{foods[id].preparation}</span>
                            )}
                            {servingKey &&
                              foods[id]?.servingSize?.[servingKey] && (
                                <span className="portion-guide">
                                  Serving guide for current age:{" "}
                                  {foods[id].servingSize[servingKey]}. Follow
                                  appetite; this is not a required amount.
                                </span>
                              )}
                          </li>
                        ))}
                      </ul>
                    </details>
                    <button
                      className="button button-secondary wide"
                      onClick={() => onLog({ ...option, mealType: meal.time })}
                    >
                      <Icon name="plus" size={18} />
                      Use in a log
                    </button>
                  </div>
                ))
              ) : (
                <p className="muted">
                  These options are hidden by your food restrictions. Use a
                  saved recipe or log an appropriate meal of your own.
                </p>
              )}
            </section>
          );
        })}
      </div>
      <section className="card">
        <SectionTitle
          title="Grocery checklist"
          eyebrow="Ingredients for this stage"
        >
          <button className="text-button" onClick={copyGroceries}>
            Copy list
          </button>
        </SectionTitle>
        <p className="muted">
          Includes all visible meal alternatives, including optional snacks.
          Choose the meals you plan to make; quantities depend on your family.
          Check product labels for allergens. Checkmarks last while this screen
          is open.
        </p>
        <div className="grocery-grid">
          {groceryIds.map((id) => (
            <label
              key={id}
              className={`check-row ${checked[id] ? "is-checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={!!checked[id]}
                onChange={(event) =>
                  setChecked((current) => ({
                    ...current,
                    [id]: event.target.checked,
                  }))
                }
              />
              <span>{foods[id]?.name || id}</span>
            </label>
          ))}
        </div>
        {copyMessage && (
          <p role="status" className="caption">
            {copyMessage}
          </p>
        )}
        {copyFallback && (
          <Field label="Grocery list to copy">
            <textarea
              value={copyFallback}
              readOnly
              rows={8}
              onFocus={(event) => event.target.select()}
            />
          </Field>
        )}
      </section>
      <section className="card">
        <h2>Guidance behind these ideas</h2>
        <p className="caption">These sources support feeding principles. The exact recipes, portions and timing are practical adaptations; ingredient lists do not establish nutrient adequacy.</p>
        <Sources sources={plan.sources || SOURCES} />
      </section>
    </div>
  );
}

function CustomFoodForm({ onSave }) {
  const pending = useContext(SavingContext);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [preparation, setPreparation] = useState("");
  const [allergens, setAllergens] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setError("Enter a food name.");
    if (!confirmed)
      return setError(
        "Check the ingredients and confirm the allergen information.",
      );
    if (
      await onSave({
        id: `custom-${makeId()}`,
        name: name.trim(),
        category,
        preparation: preparation.trim(),
        allergens,
      })
    ) {
      setName("");
      setPreparation("");
      setAllergens([]);
      setConfirmed(false);
      setError("");
    }
  };
  return (
    <form className="stack" onSubmit={save}>
      <div className="form-grid">
        <Field label="Food name">
          <input
            required
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. homemade oat pancake"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {[...new Set([...Object.keys(FOOD_CATEGORIES), "Other"])].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </Field>
      </div>
      <Field label="Preparation or ingredients">
        <textarea
          value={preparation}
          maxLength={1000}
          onChange={(event) => setPreparation(event.target.value)}
          rows={2}
          placeholder="Ingredients, brand details and how you prepare it"
        />
      </Field>
      <fieldset>
        <legend>Contains these allergens</legend>
        <div className="checkbox-grid">
          {ALLERGENS.map((item) => (
            <label key={item.id} className="check-row">
              <input
                type="checkbox"
                checked={allergens.includes(item.id)}
                onChange={(event) =>
                  setAllergens((current) =>
                    event.target.checked
                      ? [...current, item.id]
                      : current.filter((id) => id !== item.id),
                  )
                }
              />
              {item.label}
            </label>
          ))}
        </div>
        <p className="caption">
          Check the actual ingredient list. Record additional allergens or “may
          contain” advice in preparation notes; unchecked boxes are not a safety
          guarantee.
        </p>
      </fieldset>
      <label className="check-row">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          required
        />
        I have checked the ingredients and allergen information.
      </label>
      {error && <Notice kind="error">{error}</Notice>}
      <button
        className="button button-primary align-start"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save custom food"}
      </button>
    </form>
  );
}

function RecipeForm({ data, foods, onSave }) {
  const pending = useContext(SavingContext);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    if (!name.trim() || !selected.length)
      return setError("Name the recipe and choose every ingredient.");
    if (
      await onSave({
        id: `recipe-${makeId()}`,
        name: name.trim(),
        description: description.trim(),
        foods: selected,
      })
    ) {
      setName("");
      setDescription("");
      setSelected([]);
      setError("");
    }
  };
  return (
    <form className="stack" onSubmit={save}>
      <Field label="Recipe name">
        <input
          required
          value={name}
          maxLength={120}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. our vegetable pasta"
        />
      </Field>
      <Field label="Preparation notes">
        <textarea
          value={description}
          maxLength={1000}
          rows={2}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="How you cook or adapt it"
        />
      </Field>
      <fieldset>
        <legend>All recipe ingredients</legend>
        <FoodPicker
          foods={foods}
          selected={selected}
          onChange={setSelected}
          profile={data.babyProfile}
          feeds={data.feedingLog}
        />
      </fieldset>
      {error && <Notice kind="error">{error}</Notice>}
      <button
        className="button button-primary align-start"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save recipe"}
      </button>
    </form>
  );
}

function FoodLibrary({
  data,
  foods,
  onAddFood,
  onAddRecipe,
  onRemoveRecipe,
  onLog,
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("library");
  const matches = Object.entries(foods).filter(
    ([, food]) =>
      food.name.toLowerCase().includes(query.toLowerCase()) &&
      (!category || (food.category || "Other") === category),
  );
  return (
    <div className="page">
      <SectionTitle
        title="Foods & family recipes"
        eyebrow="Make the diary yours"
      />
      <div className="segmented" role="group" aria-label="Food section">
        {[
          ["library", "Food list"],
          ["custom", "Add food"],
          ["recipes", "Recipes"],
        ].map(([id, label]) => (
          <button
            className={mode === id ? "is-active" : ""}
            aria-pressed={mode === id}
            key={id}
            onClick={() => setMode(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "custom" && (
        <section className="card">
          <SectionTitle title="Add a custom food" />
          <p className="muted">
            Use a recipe for meals made from several ingredients. Custom foods
            help with missing ingredients and specific packaged products.
          </p>
          <CustomFoodForm onSave={onAddFood} />
        </section>
      )}
      {mode === "recipes" && (
        <>
          <section className="card">
            <SectionTitle title="Saved recipes" />
            {data.recipes.length ? (
              <div className="recipe-grid">
                {data.recipes.map((recipe) => (
                  <article key={recipe.id} className="recipe-item">
                    <h3>{recipe.name}</h3>
                    <p className="muted">{foodNames(recipe.foods, foods)}</p>
                    {recipe.description && <p>{recipe.description}</p>}
                    <div className="button-row">
                      <button
                        className="button button-secondary"
                        onClick={() =>
                          onLog({
                            foods: recipe.foods,
                            description:
                              recipe.name +
                              (recipe.description
                                ? ` — ${recipe.description}`
                                : ""),
                          })
                        }
                      >
                        Use in a log
                      </button>
                      <button
                        className="text-button danger"
                        onClick={() => onRemoveRecipe(recipe)}
                      >
                        Delete recipe
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Empty title="Keep your family favourites">
                Save complete ingredients once, then adjust them each time you
                log.
              </Empty>
            )}
          </section>
          <section className="card">
            <SectionTitle title="Create a recipe" />
            <RecipeForm data={data} foods={foods} onSave={onAddRecipe} />
          </section>
        </>
      )}
      {mode === "library" && (
        <>
          <section className="card">
            <div className="form-grid">
              <Field label="Search the food list">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search foods and drinks"
                />
              </Field>
              <Field label="Category">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {[...new Set([...Object.keys(FOOD_CATEGORIES), "Other"])].map(
                    (item) => (
                      <option key={item}>{item}</option>
                    ),
                  )}
                </select>
              </Field>
            </div>
            <p className="caption">
              Preparation matters at every age. Package ingredients may differ
              from these examples.
            </p>
          </section>
          <div className="food-library-grid">
            {matches.map(([id, food]) => (
              <article className="card food-card" key={id}>
                <div className="food-card-top">
                  <span className="eyebrow">{food.category || "Other"}</span>
                  {id.startsWith("custom-") && (
                    <span className="badge badge-neutral">Your food</span>
                  )}
                </div>
                <h2>{food.name}</h2>
                <p>
                  {food.preparation ||
                    "Prepare for your child’s current feeding abilities and check ingredients."}
                </p>
                {food.evidenceNote && (
                  <details>
                    <summary>Why this food is included</summary>
                    <p>{food.evidenceNote}</p>
                    <p className="caption">{food.preparationBasis}</p>
                    <Sources sources={food.sources || []} />
                  </details>
                )}
                <p className="caption">
                  <strong>Listed allergens:</strong>{" "}
                  {food.allergens?.length
                    ? food.allergens
                        .map(
                          (key) =>
                            ALLERGENS.find((item) => item.id === key)?.label ||
                            key,
                        )
                        .join(", ")
                    : "None in the base food. Check the actual product."}
                </p>
                <button
                  className="text-button"
                  onClick={() => onLog({ foods: [id] })}
                >
                  <Icon name="plus" size={17} />
                  Use in a log
                </button>
              </article>
            ))}
          </div>
          {!matches.length && (
            <section className="card">
              <Empty
                title="That food is not listed"
                action={
                  <button
                    className="button button-secondary"
                    onClick={() => setMode("custom")}
                  >
                    Add a custom food
                  </button>
                }
              >
                Add it with its ingredients and allergen information.
              </Empty>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function GrowthChart({ entries, unit, label }) {
  const values = [...entries]
    .filter((item) => Number.isFinite(Number(item.value)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (values.length < 2) return null;
  const points = values.slice(-20);
  const numbers = points.map((item) => Number(item.value));
  const minimum = Math.min(...numbers),
    maximum = Math.max(...numbers);
  const range = Math.max(maximum - minimum, 1);
  const firstTime = new Date(points[0].date).getTime(),
    lastTime = new Date(points[points.length - 1].date).getTime();
  const positions = points.map((item, index) => ({
    x:
      lastTime > firstTime
        ? 42 +
          ((new Date(item.date).getTime() - firstTime) /
            (lastTime - firstTime)) *
            430
        : 42 + (index / (points.length - 1)) * 430,
    y: 115 - ((Number(item.value) - minimum) / range) * 76,
  }));
  return (
    <div className="growth-chart">
      <svg
        viewBox="0 0 500 150"
        role="img"
        aria-label={`${label}: ${points[0].value} ${unit} on ${formatDate(points[0].date)} to ${points[points.length - 1].value} ${unit} on ${formatDate(points[points.length - 1].date)}. All values are listed below.`}
      >
        <line x1="42" y1="120" x2="472" y2="120" stroke="#dbe6ed" />
        <text x="4" y="40" fill="#617482" fontSize="11">
          {maximum} {unit}
        </text>
        <text x="4" y="118" fill="#617482" fontSize="11">
          {minimum} {unit}
        </text>
        <polyline
          points={positions.map((point) => `${point.x},${point.y}`).join(" ")}
          stroke="#1683b8"
          strokeWidth="2.5"
          fill="none"
        />
        {positions.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="4" fill="#1683b8" />
        ))}
        <text x="42" y="143" fill="#617482" fontSize="11">
          {formatDate(points[0].date)}
        </text>
        <text x="472" y="143" fill="#617482" fontSize="11" textAnchor="end">
          {formatDate(points[points.length - 1].date)}
        </text>
      </svg>
      <p className="caption">
        Your recorded measurements, not a clinical growth assessment.
      </p>
    </div>
  );
}

function GrowthField({ entries, type, onSave, onDelete, birthDate }) {
  const pending = useContext(SavingContext);
  const [value, setValue] = useState("");
  const [date, setDate] = useState(localDateKey(new Date()));
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");
  const label = type === "weight" ? "Weight" : "Height";
  const unit = type === "weight" ? "kg" : "cm";
  const save = async (event) => {
    event.preventDefault();
    const numeric = Number(value);
    if (
      !Number.isFinite(numeric) ||
      numeric <= 0 ||
      (type === "weight"
        ? numeric < 0.2 || numeric > 100
        : numeric < 10 || numeric > 200)
    )
      return setError(`Enter a valid ${label.toLowerCase()} in ${unit}.`);
    if (
      !date ||
      date > localDateKey(new Date()) ||
      (birthDate && date < birthDate)
    )
      return setError(
        "Choose a date from the child’s birth date through today.",
      );
    if (
      await onSave(
        type,
        {
          id:
            editIndex === null ? makeId() : entries[editIndex]?.id || makeId(),
          date,
          value: numeric,
        },
        editIndex,
      )
    ) {
      setValue("");
      setEditIndex(null);
      setError("");
    }
  };
  return (
    <div className="growth-section">
      <h3>{label}</h3>
      <form className="stack" onSubmit={save}>
        <div className="form-grid">
          <Field label={`${label} (${unit})`}>
            <input
              inputMode="decimal"
              type="number"
              min={type === "weight" ? "0.2" : "10"}
              max={type === "weight" ? "100" : "200"}
              step="0.01"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={type === "weight" ? "e.g. 10.2" : "e.g. 76.5"}
              required
            />
          </Field>
          <Field label="Measurement date">
            <input
              type="date"
              value={date}
              min={birthDate || undefined}
              max={localDateKey(new Date())}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </Field>
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <div className="button-row">
          <button
            type="submit"
            className="button button-secondary"
            disabled={pending}
          >
            {editIndex === null
              ? `Save ${label.toLowerCase()}`
              : `Update ${label.toLowerCase()}`}
          </button>
          {editIndex !== null && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setEditIndex(null);
                setValue("");
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
      <GrowthChart entries={entries} unit={unit} label={label} />
      {entries.length > 0 && (
        <details>
          <summary>
            {entries.length} saved {label.toLowerCase()}{" "}
            {entries.length === 1 ? "measurement" : "measurements"}
          </summary>
          <ul className="measurement-list">
            {entries
              .map((entry, index) => ({ entry, index }))
              .sort((a, b) => new Date(b.entry.date) - new Date(a.entry.date))
              .map(({ entry, index }) => (
                <li key={entry.id || `${entry.date}-${index}`}>
                  <div>
                    <strong>
                      {entry.value} {unit}
                    </strong>
                    <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                  </div>
                  <div className="item-actions">
                    <button
                      className="text-button"
                      onClick={() => {
                        setEditIndex(index);
                        setValue(String(entry.value));
                        setDate(localDateKey(entry.date));
                      }}
                      aria-label={`Edit ${label.toLowerCase()} from ${formatDate(entry.date)}`}
                    >
                      Edit
                    </button>
                    <button
                      className="text-button danger"
                      onClick={async () => {
                        if (await onDelete(type, index)) {
                          if (editIndex === index) {
                            setEditIndex(null);
                            setValue("");
                          } else if (editIndex !== null && index < editIndex)
                            setEditIndex(editIndex - 1);
                        }
                      }}
                      aria-label={`Delete ${label.toLowerCase()} from ${formatDate(entry.date)}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function BackupPanel({ data, onImport, recovery = false, recoveryRaw }) {
  const pending = useContext(SavingContext);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const inputId = useId();
  const [message, setMessage] = useState("");
  const exportBackup = () => {
    try {
      const recoveryCopy = recovery ? JSON.parse(exportRawRecovery()) : null;
      if (recoveryCopy && recoveryRaw) recoveryCopy.loadedRecord = recoveryRaw;
      downloadText(
        recovery ? JSON.stringify(recoveryCopy, null, 2) : createBackup(data),
        `feeding-tracker-${recovery ? "recovery-" : ""}${localDateKey(new Date())}.json`,
      );
      setError("");
      setMessage("Backup download prepared. On iPhone, keep a copy in Files.");
    } catch (cause) {
      setError(cause.message || "The backup could not be exported.");
    }
  };
  const previewPrevious = () => {
    setError("");
    setMessage("");
    try {
      setPreview({
        fileName: "Previous save on this device",
        data: readPreviousBackup(),
      });
    } catch (cause) {
      setError(cause.message);
    }
  };
  const readImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setPreview(null);
    setMessage("");
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Choose a backup smaller than 10 MB.");
      const imported = parseBackup(await file.text());
      setPreview({ fileName: file.name, data: imported });
    } catch (cause) {
      setError(
        cause.message ||
          "This file is not a valid tracker backup. Your saved records have not changed.",
      );
    }
  };
  const confirmImport = async () => {
    if (
      !window.confirm(
        `Replace ${data?.feedingLog?.length || 0} existing diary entries with ${preview.data.feedingLog.length} imported entries? Export a backup first if you need a separate copy.`,
      )
    )
      return;
    if (await onImport(preview.data)) {
      setPreview(null);
      setMessage("Backup restored.");
    }
  };
  return (
    <section className="card stack">
      <SectionTitle
        title={recovery ? "Recover your records" : "Backups & recovery"}
      />
      <p className="muted">
        Records are saved on this device and browser. Export a backup before
        changing devices, reinstalling the app or clearing website data. There
        is no account sync.
      </p>
      <div className="button-row">
        <button className="button button-secondary" onClick={exportBackup}>
          <Icon name="download" size={19} />
          {recovery ? "Download recovery data" : "Export backup"}
        </button>
        <button
          className="button button-secondary"
          onClick={() => fileRef.current?.click()}
        >
          Choose backup to restore
        </button>
        <button
          className="button button-secondary"
          onClick={previewPrevious}
          disabled={pending}
        >
          Preview previous save
        </button>
        <input
          id={inputId}
          ref={fileRef}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          onChange={readImport}
          aria-label="Choose tracker backup JSON"
        />
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {message && (
        <p role="status" className="caption">
          {message}
        </p>
      )}
      {preview && (
        <div className="import-preview">
          <h3>Review before replacing</h3>
          <p className="muted filename">{preview.fileName}</p>
          <dl className="preview-details">
            <div>
              <dt>Profile</dt>
              <dd>{preview.data.babyProfile.name || "Unnamed child"}</dd>
            </div>
            <div>
              <dt>Birth date</dt>
              <dd>
                {preview.data.babyProfile.birthDate
                  ? formatDate(preview.data.babyProfile.birthDate)
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt>Diary entries</dt>
              <dd>{preview.data.feedingLog.length}</dd>
            </div>
            <div>
              <dt>Custom foods / recipes</dt>
              <dd>
                {preview.data.customFoods.length} /{" "}
                {preview.data.recipes.length}
              </dd>
            </div>
          </dl>
          <Notice kind="warning">
            Restoring replaces the current profile, diary, foods and recipes.
            The previous saved snapshot is retained for recovery.
          </Notice>
          <div className="button-row">
            <button
              className="button button-primary"
              onClick={confirmImport}
              disabled={pending}
            >
              {pending ? "Restoring…" : "Replace with this backup"}
            </button>
            <button className="text-button" onClick={() => setPreview(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function getProfileForm(profile, feeds, foods) {
  return {
    name: profile.name || "",
    birthDate: profile.birthDate || "",
    solidStartDate: profile.solidStartDate || "",
    dairyFree: profile.dairyFree !== false,
    texture: profile.texture || "family",
    feedingNotes: profile.feedingNotes || "",
    allergenStatus: getAllergenStatuses(profile, feeds, foods),
    foodStatus: getFoodStatuses(profile, feeds, foods),
  };
}

function Profile({
  data,
  foods,
  now,
  onProfileSave,
  onGrowthSave,
  onGrowthDelete,
  onImport,
}) {
  const pending = useContext(SavingContext);
  const profile = data.babyProfile;
  const [form, setForm] = useState(() =>
    getProfileForm(profile, data.feedingLog, foods),
  );
  const [reviewedAllergens, setReviewedAllergens] = useState([]);
  const [reviewedFoods, setReviewedFoods] = useState([]);
  const reviewedFoodIds = [
    ...new Set([
      ...data.feedingLog
        .filter((feed) => feed.reaction && feed.reaction !== "None observed")
        .flatMap((feed) => feed.foods),
      ...Object.keys(profile.foodStatus || {}).filter(
        (id) => profile.foodStatus[id] !== "unknown",
      ),
    ]),
  ];
  const [error, setError] = useState("");
  const savedProfile = useRef(profile);
  useEffect(() => {
    // Growth saves do not recreate this component or replace its unsaved profile fields.
    if (
      ["name", "birthDate", "solidStartDate", "dairyFree", "texture", "feedingNotes"].some(
        (key) => savedProfile.current[key] !== profile[key],
      ) ||
      JSON.stringify(savedProfile.current.allergenStatus) !==
        JSON.stringify(profile.allergenStatus) ||
      JSON.stringify(savedProfile.current.foodStatus) !==
        JSON.stringify(profile.foodStatus)
    ) {
      setForm(getProfileForm(profile, data.feedingLog, foods));
    }
    savedProfile.current = profile;
  }, [profile, data.feedingLog, foods]);
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    setError("");
    const today = localDateKey(new Date());
    if (
      form.birthDate &&
      (Number.isNaN(new Date(`${form.birthDate}T12:00:00`).getTime()) ||
        form.birthDate > today)
    )
      return setError("Birth date must be a valid date no later than today.");
    if (
      form.solidStartDate &&
      (!form.birthDate ||
        form.solidStartDate < form.birthDate ||
        form.solidStartDate > today)
    )
      return setError(
        "Solids start date must be between the birth date and today.",
      );
    const reviewedAt = { ...profile.allergenReviewedAt };
    reviewedAllergens.forEach((id) => {
      reviewedAt[id] = new Date().toISOString();
    });
    const foodReviewedAt = { ...profile.foodReviewedAt };
    reviewedFoods.forEach((id) => {
      foodReviewedAt[id] = new Date().toISOString();
    });
    if (
      await onProfileSave({
        ...profile,
        ...form,
        name: form.name.trim(),
        allergenReviewedAt: reviewedAt,
        foodReviewedAt,
      })
    ) {
      setReviewedAllergens([]);
      setReviewedFoods([]);
    }
  };
  return (
    <div className="page">
      <SectionTitle
        title="Your child’s profile"
        eyebrow={
          profile.birthDate
            ? getAgeLabel(profile.birthDate, now)
            : "Personalise the tracker"
        }
      />
      <form onSubmit={save} className="card stack">
        <div className="form-grid">
          <Field label="Child’s name">
            <input
              value={form.name}
              maxLength={80}
              onChange={(event) => update("name", event.target.value)}
              autoComplete="off"
              placeholder="Name or nickname"
            />
          </Field>
          <Field
            label="Birth date"
            hint="The recommended stage changes automatically with completed age."
          >
            <input
              type="date"
              value={form.birthDate}
              max={localDateKey(now)}
              onChange={(event) => update("birthDate", event.target.value)}
            />
          </Field>
        </div>
        <div className="form-grid">
          <Field
            label="Started solids (optional)"
            hint="Kept as a milestone; it does not determine your child’s age stage."
          >
            <input
              type="date"
              value={form.solidStartDate}
              min={form.birthDate || undefined}
              max={localDateKey(now)}
              onChange={(event) => update("solidStartDate", event.target.value)}
            />
          </Field>
          <Field
            label="Current preparation"
            hint="Choose according to your child’s actual abilities and clinical advice."
          >
            <select
              value={form.texture}
              onChange={(event) => update("texture", event.target.value)}
            >
              <option value="puree">Smooth purées</option>
              <option value="mashed">Mashed foods</option>
              <option value="finger">Soft finger foods</option>
              <option value="family">Adapted family textures</option>
            </select>
          </Field>
        </div>
        <div className="form-section">
          <h2>Food restrictions</h2>
          <Field label="Your feeding instructions" hint="Keep existing allergy advice, milk/formula details and any agreed food amounts here. Saved on this device; the app does not change menus from these notes automatically.">
            <textarea rows={4} maxLength={4000} value={form.feedingNotes} onChange={(event) => update("feedingNotes", event.target.value)} placeholder="Existing feeding or allergy plan, milk/formula product, instructions and review date" />
          </Field>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.dairyFree}
              onChange={(event) => update("dairyFree", event.target.checked)}
            />
            <span>Keep meal suggestions dairy-free</span>
          </label>
          <p className="caption">
            Dairy-free is preserved from the original app. Keep any medically
            advised milk restriction and feeding plan when your child turns one.
            This switch is a meal filter, not an allergy diagnosis.
          </p>
          <details>
            <summary>Review allergen status</summary>
            <p className="muted">
              Only clear a suspected reaction after appropriate medical advice.
              This app does not diagnose allergies. Saving a changed status
              records a review time; later symptoms can pause suggestions again.
            </p>
            <div className="form-grid">
              {ALLERGENS.map((item) => (
                <Field key={item.id} label={item.label}>
                  <select
                    value={form.allergenStatus[item.id] || "unknown"}
                    onChange={(event) => {
                      const value = event.target.value;
                      setReviewedAllergens((current) => [
                        ...new Set([...current, item.id]),
                      ]);
                      setForm((current) => ({
                        ...current,
                        allergenStatus: {
                          ...current.allergenStatus,
                          [item.id]: value,
                        },
                      }));
                    }}
                  >
                    {Object.entries(STATUS_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </details>
          {reviewedFoodIds.length > 0 && (
            <details>
              <summary>Review foods with recorded symptoms</summary>
              <p className="muted">
                All ingredients in a meal with symptoms are held for review.
                Only mark a food tolerated after appropriate advice. Review any
                related allergen group above as well.
              </p>
              <div className="form-grid">
                {reviewedFoodIds.map((id) => (
                  <Field key={id} label={foods[id]?.name || id}>
                    <select
                      value={form.foodStatus[id] || "unknown"}
                      onChange={(event) => {
                        const value = event.target.value;
                        setReviewedFoods((current) => [
                          ...new Set([...current, id]),
                        ]);
                        setForm((current) => ({
                          ...current,
                          foodStatus: { ...current.foodStatus, [id]: value },
                        }));
                      }}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
            </details>
          )}
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <button
          type="submit"
          className="button button-primary align-start"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>
      <section className="card" id="growth-record" tabIndex={-1}>
        <SectionTitle title="Growth record" eyebrow="Measurements over time" />
        <p className="muted">
          Keep measurements from home or clinic visits. Each measurement is
          saved separately.
        </p>
        <GrowthField
          type="weight"
          entries={profile.weight}
          birthDate={profile.birthDate}
          onSave={onGrowthSave}
          onDelete={onGrowthDelete}
        />
        <GrowthField
          type="height"
          entries={profile.height}
          birthDate={profile.birthDate}
          onSave={onGrowthSave}
          onDelete={onGrowthDelete}
        />
      </section>
      <BackupPanel data={data} onImport={onImport} />
      <ResearchGuide months={getCompletedMonths(profile.birthDate, now)} />
    </div>
  );
}

export default function App() {
  const [loaded] = useState(() => loadData());
  const [data, setData] = useState(loaded.data);
  const [recoveryError, setRecoveryError] = useState(loaded.error || "");
  const [initialView] = useState(
    () => new URLSearchParams(window.location.search).get("view") || "home",
  );
  const [activeTab, setActiveTab] = useState(
    () =>
      ({
        log: "diary",
        history: "diary",
        diary: "diary",
        meals: "meals",
        foods: "foods",
        progress: "profile",
        profile: "profile",
      })[initialView] || "home",
  );
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState(() =>
    initialView === "log" && loaded.data && !loaded.error ? {} : null,
  );
  const [browseKey, setBrowseKey] = useState(null);
  const [importGeneration, setImportGeneration] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const mainRef = useRef(null);
  useEffect(() => {
    if (initialView !== "progress" || recoveryError) return;
    const frame = requestAnimationFrame(() => {
      const growth = document.getElementById("growth-record");
      growth?.scrollIntoView?.({ block: "start" });
      growth?.focus({ preventScroll: true });
    });
    return () => {
      if (typeof cancelAnimationFrame === "function")
        cancelAnimationFrame(frame);
    };
  }, [initialView, recoveryError]);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const refresh = () => setNow(new Date());
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const foods = useMemo(
    () => getFoodMap(data?.customFoods || []),
    [data?.customFoods],
  );
  const commit = async (next, message) => {
    if (pendingRef.current) return false;
    pendingRef.current = true;
    setPending(true);
    try {
      const saved = await persistData(next, {
        expectedRevision: data?.revision ?? 0,
      });
      setData(saved);
      setError("");
      setNotice(message);
      return true;
    } catch (cause) {
      setError(
        cause.message ||
          "Your change could not be saved. Export a backup and check available device storage.",
      );
      return false;
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };
  const navigate = (tab) => {
    if (pendingRef.current) return;
    setActiveTab(tab);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() =>
      mainRef.current?.focus({ preventScroll: true }),
    );
  };
  const saveFeed = (feed) =>
    commit(
      {
        ...data,
        feedingLog: data.feedingLog.some((item) => item.id === feed.id)
          ? data.feedingLog.map((item) => (item.id === feed.id ? feed : item))
          : [...data.feedingLog, feed],
      },
      "Diary entry saved.",
    );
  const removeFeed = (feed) => {
    if (
      window.confirm(
        `Delete this ${feed.mealType || "meal"} entry from ${formatDate(feed.date, true)}?`,
      )
    )
      commit(
        {
          ...data,
          feedingLog: data.feedingLog.filter((item) => item.id !== feed.id),
        },
        "Diary entry deleted.",
      );
  };
  const importData = async (imported) => {
    const ok = await commit(
      { ...imported, revision: data?.revision || 0 },
      "Backup restored.",
    );
    if (ok) {
      setRecoveryError("");
      setBrowseKey(null);
      setEditor(null);
      setImportGeneration((value) => value + 1);
    }
    return ok;
  };
  const saveProfile = async (profile) => {
    const changedBirthDate = profile.birthDate !== data.babyProfile.birthDate;
    const ok = await commit(
      { ...data, babyProfile: profile },
      "Profile saved.",
    );
    if (ok && changedBirthDate) setBrowseKey(null);
    return ok;
  };
  const saveGrowth = (type, entry, editIndex) => {
    const entries =
      editIndex === null
        ? [...data.babyProfile[type], entry]
        : data.babyProfile[type].map((item, index) =>
            index === editIndex ? entry : item,
          );
    return commit(
      { ...data, babyProfile: { ...data.babyProfile, [type]: entries } },
      `${type === "weight" ? "Weight" : "Height"} saved.`,
    );
  };
  const deleteGrowth = (type, index) => {
    if (!window.confirm(`Delete this ${type} measurement?`)) return false;
    return commit(
      {
        ...data,
        babyProfile: {
          ...data.babyProfile,
          [type]: data.babyProfile[type].filter(
            (_, position) => position !== index,
          ),
        },
      },
      "Measurement deleted.",
    );
  };
  if (recoveryError || !data)
    return (
      <SavingContext.Provider value={pending}>
        <div className="recovery-page" aria-busy={pending}>
          <div className="brand">
            <span className="brand-icon">
              <Icon name="plate" />
            </span>
            <span>Feeding tracker</span>
          </div>
          <h1>Your saved records need attention</h1>
          <Notice kind="error">
            {typeof recoveryError === "string"
              ? recoveryError
              : recoveryError.message ||
                "The saved data could not be opened."}{" "}
            Your existing records have not been replaced.
          </Notice>
          {error && <Notice kind="error">{error}</Notice>}
          <BackupPanel
            recovery
            recoveryRaw={loaded.recoveryRaw}
            data={data}
            onImport={importData}
          />
          <p className="caption">
            Download the recovery data before making changes. You can restore a
            valid tracker backup using the preview above.
          </p>
        </div>
      </SavingContext.Provider>
    );
  return (
    <SavingContext.Provider value={pending}>
      <div className="app-shell" aria-busy={pending}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <header className="app-header">
          <div className="header-inner">
            <a
              className="brand"
              href="#main-content"
              onClick={() => navigate("home")}
            >
              <span className="brand-icon">
                <Icon name="plate" />
              </span>
              <span>
                Feeding tracker<small>Meals, drinks and observations</small>
              </span>
            </a>
            <span className="profile-pill">
              <Icon name="baby" size={18} />
              <span>
                {data.babyProfile.name || "Your child"}
                {data.babyProfile.birthDate && (
                  <small>{getAgeLabel(data.babyProfile.birthDate, now)}</small>
                )}
              </span>
            </span>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} ref={mainRef}>
          {error && (
            <div className="global-error">
              <Notice kind="error">
                {error}
                <button className="text-button" onClick={() => setError("")}>
                  Dismiss
                </button>
              </Notice>
            </div>
          )}
          {activeTab === "home" && (
            <Dashboard
              data={data}
              foods={foods}
              now={now}
              onLog={(seed) => setEditor({ seed })}
              onEdit={(entry) => setEditor({ entry })}
              onNavigate={navigate}
            />
          )}
          {activeTab === "diary" && (
            <Diary
              data={data}
              foods={foods}
              onLog={() => setEditor({})}
              onEdit={(entry) => setEditor({ entry })}
              onDelete={removeFeed}
            />
          )}
          {activeTab === "meals" && (
            <MealPlanner
              data={data}
              foods={foods}
              now={now}
              browseKey={browseKey}
              onBrowse={setBrowseKey}
              onLog={(seed) => setEditor({ seed })}
            />
          )}
          {activeTab === "foods" && (
            <FoodLibrary
              data={data}
              foods={foods}
              onAddFood={(food) =>
                commit(
                  { ...data, customFoods: [...data.customFoods, food] },
                  "Custom food saved.",
                )
              }
              onAddRecipe={(recipe) =>
                commit(
                  { ...data, recipes: [...data.recipes, recipe] },
                  "Recipe saved.",
                )
              }
              onRemoveRecipe={(recipe) => {
                if (
                  window.confirm(
                    `Delete the saved recipe “${recipe.name}”? Existing diary entries will remain.`,
                  )
                )
                  commit(
                    {
                      ...data,
                      recipes: data.recipes.filter(
                        (item) => item.id !== recipe.id,
                      ),
                    },
                    "Recipe deleted.",
                  );
              }}
              onLog={(seed) => setEditor({ seed })}
            />
          )}
          {activeTab === "profile" && (
            <Profile
              key={importGeneration}
              data={data}
              foods={foods}
              now={now}
              onProfileSave={saveProfile}
              onGrowthSave={saveGrowth}
              onGrowthDelete={deleteGrowth}
              onImport={importData}
            />
          )}
        </main>
        <nav className="bottom-nav" aria-label="Main navigation">
          <div>
            {NAV.map((item) => (
              <button
                key={item.id}
                className={activeTab === item.id ? "is-active" : ""}
                aria-current={activeTab === item.id ? "page" : undefined}
                onClick={() => navigate(item.id)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="toast-region" role="status" aria-live="polite">
          {notice && (
            <div className="toast">
              <Icon name="check" size={18} />
              {notice}
            </div>
          )}
        </div>
        {editor && (
          <FeedEditor
            saveError={error}
            key={editor.entry?.id || "new"}
            entry={editor.entry}
            seed={editor.seed}
            data={data}
            foods={foods}
            onSave={saveFeed}
            onClose={() => setEditor(null)}
          />
        )}
      </div>
    </SavingContext.Provider>
  );
}
