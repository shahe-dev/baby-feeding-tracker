# Baby Feeding Tracker

A local meal planner and feeding diary for infants and toddlers, with editable history, family recipes, food and reaction records, growth measurements, and offline support.

## What changed in version 2

- Completed age is calculated from the birthday saved in the profile, including the day of the month.
- Suggested stages cover 6–23 months. At 12–23 completed months, Today and Meals open with a daily planner for breakfast, lunch and dinner, with optional snacks. Below 6 months or from the second birthday, the diary remains available without automatic meal suggestions.
- Daily choices are saved for the selected date separately from food intake. Searchable swaps include eligible saved family recipes, and the shopping list includes only eligible meals shown for that day.
- Foods offered, eaten, refused and not recorded are separate. Allergen counts reflect confirmed eating occasions in the last seven local calendar days; there is no universal weekly target or allergy-prevention score.
- Recorded reactions suspend relevant food suggestions until their status is reviewed. These flags describe observations, not diagnoses.
- History supports date filters, editing, backdating and displayed amounts. Custom foods and saved family recipes retain their ingredient and allergen metadata.
- Profile and measurement forms preserve unsaved input. Controls have accessible labels and save/error announcements.
- Validated backups, previous-save recovery and storage error handling protect existing records. Older data is migrated without deleting the original keys.
- JavaScript and CSS are built locally. The app no longer downloads React, Babel, Tailwind or chart libraries at runtime.

## Research and meal plans

The research basis is restricted to WHO 2023 and its commissioned evidence reports, LEAP and its follow-ups, Scandinavian/Nordic primary research and official recommendations, and New Zealand BLISS. The [12–23-month evidence review](docs/feeding-research-12-23-months.md) explains which findings apply during toddlerhood and how they inform the meal ideas. NNR2023, OTIS and PreventADALL are further research within the permitted Nordic family; they are not represented as documents confirmed to have been selected for the original app.

The [original research synthesis](docs/revised-evidence-based-feeding-schedule.md) is preserved unchanged for reference. It contains claims that the newer review corrects, including a universal three-times-weekly allergen target and the assertion that BLISS prevented iron deficiency. Read it with the [research index and archive notice](docs/README.md).

The meal plans are authored adaptations. They retain nutrient-dense ingredients, iron and energy components, fruit and vegetable variety, and appropriate preparation. Daily animal-source foods and the specific LEAP peanut regimen have source context; they do not imply meat at every meal or the same exposure quota for every allergen. Food notes describe ingredients and their role in a meal without claiming that a recipe guarantees a health outcome or nutritional adequacy.

## Using the app

1. Open the deployed app in Safari, then use Share → Add to Home Screen if desired.
2. In Profile, check the saved birthday, feeding texture, dairy-free preference and food restrictions. The birthday remains on this device; it is not hardcoded into the app.
3. At 12–23 months, review the three suggested main meals on Today and choose **Use this day** to save the choices. In Meals, choose Today, Tomorrow or another date to plan ahead.
4. Use **Swap** to search recipes or ingredients and choose a replacement. Choosing a recipe saves that day's choices. Add snacks if wanted. Open **Recipe & ingredients** for preparation steps and the shopping list for that day's ingredients.
5. Use a meal's **Log** button to prefill the diary when the day arrives. Confirm ingredients and what was actually eaten before saving; saving a plan does not record consumption.
6. Use History to review or correct previous records and Profile to export backups.

The earlier app used dairy-free meal plans. Version 2 preserves that default during migration. Do not remove a medically required restriction just because a child enters a new age stage. Suggested recipes are examples; check packaged ingredients and adapt preparation to the child's skills.

## How the daily planner works

Suggestions use the child's age on the selected date, recorded restrictions, known ingredient roles and recent confirmed intake to offer variety. Main meals with an iron-rich component, an energy-rich component and vegetables or fruit are preferred. The planner also considers meat, fish or egg across the day. It does not calculate nutrient quantities or establish that the child's needs have been met. The three meal slots and optional snacks are planning conveniences, not a prescribed feeding frequency.

Eligible saved family recipes appear in the chooser. Roles are identified only for known ingredients; the planner does not invent nutrient information for custom foods. **Why this meal?** is collapsed within recipe details and shows ingredient roles and research links when available. The archived original synthesis and current review remain accessible from the research section.

Saved days retain snapshots of the chosen meals, including their ingredients and preparation steps. Changing a recipe or getting new suggestions does not silently replace saved choices. If age or food settings make a saved meal unsuitable, it remains visible with a review flag and is excluded from the shopping list. Swap it before serving. Peanut recipes are suggested only when peanut has been reviewed as tolerated in Profile; other allergens may still require a tolerance check.

The shopping list combines ingredients from the eligible meals shown for the selected date. It excludes other swap candidates and meals awaiting review, and it does not estimate purchase quantities. Copy it and check what is already available at home.

## Existing records and backups

The app reads the original `babyProfile` and `feedingLog` keys. It keeps them intact and writes future saves as one versioned record. Existing meals retain their amounts, notes and dates. Because older records did not reliably distinguish food offered from food eaten, their intake is labelled **Not recorded**. Original notes, including any refusal observations, remain unchanged. Edit intake in History to include an old meal in confirmed allergen counts.

Saved days live in `dailyPlans` within the same version 2 storage record and are included in exported backups. They remain separate from `feedingLog`: planned ingredients do not count as eaten foods or allergen exposures. Older version 2 records and backups without `dailyPlans` open with no saved days.

Export a backup regularly and before clearing website data, changing devices, changing the app's domain, or reinstalling. Browser storage can be removed by the browser or device owner; installation is not a backup and does not provide device-to-device sync. Exported JSON contains personal records: keep it somewhere private.

Import validates the version, profile, dates, food references, planned meals and record structure before showing a replacement preview. The preview and confirmation include the number of planned days as well as diary entries. A confirmed replacement retains the previous saved record. On damaged data, the app opens a recovery screen without overwriting the originals. A raw recovery export preserves records for repair; it is intentionally not a normal backup file.

## Development

Requires Node.js 22 or later.

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080
```

Open `http://localhost:8080`. Service workers require HTTPS in production (localhost is allowed for development).

Source files live in `src/`. Run the build after changing source, templates or the manifest and commit the generated `index.html`, `service-worker.js`, `assets/` and `icons/` files. The checked-in static output keeps an existing GitHub Pages deployment from the repository root working. GitHub Actions runs the regression tests and checks that the committed output matches the source. See [deployment instructions](DEPLOYMENT.md).

## Feeding guidance and limitations

The app links feeding claims to the selected research families, with a [separate review of scope and limitations](docs/feeding-research-12-23-months.md). A study protocol, a guideline recommendation and an authored recipe are different kinds of information. In particular, LEAP studied peanut consumption after introduction in infancy; it does not provide a first-introduction or missed-dose protocol for a toddler with suspected allergy.

Recipes are examples, not clinically validated treatment plans. The selected evidence does not choose an appropriate milk replacement for cow's-milk protein allergy. Dairy-free settings therefore remain in place until changed in the profile, and a new age stage does not change an individual feeding or allergy plan. The diary does not diagnose food allergies, measure nutrient adequacy, or interpret growth percentiles.

Data stays in browser storage; no account, analytics or cloud API is used. Opening an external reference visits that provider's website.
