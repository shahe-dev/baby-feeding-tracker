# Baby Feeding Tracker

A local feeding diary for infants and toddlers, with editable history, family meal ideas, food and reaction records, growth measurements, and offline support.

## What changed in version 2

- Completed age is calculated from the birthday saved in the profile, including the day of the month.
- Suggested stages cover 6–23 months, with a dedicated 12–24-month family meal plan. Below 6 months or from the second birthday, the diary remains available without automatically prescribing a plan.
- Foods offered, eaten, refused and not recorded are separate. Allergen counts reflect confirmed eating occasions in the last seven local calendar days; there is no universal weekly target or allergy-prevention score.
- Recorded reactions suspend relevant food suggestions until their status is reviewed. These flags describe observations, not diagnoses.
- History supports date filters, editing, backdating and displayed amounts. Custom foods and saved family recipes retain their ingredient and allergen metadata.
- Profile and measurement forms preserve unsaved input. Controls have accessible labels and save/error announcements.
- Validated backups, previous-save recovery and storage error handling protect existing records. Older data is migrated without deleting the original keys.
- JavaScript and CSS are built locally. The app no longer downloads React, Babel, Tailwind or chart libraries at runtime.

## Using the app

1. Open the deployed app in Safari, then use Share → Add to Home Screen if desired.
2. In Profile, check the saved birthday, feeding texture, dairy-free preference and food restrictions. The birthday remains on this device; it is not hardcoded into the app.
3. Select a suggested or saved meal to prefill the diary. Confirm the ingredients and what was actually eaten before saving.
4. Use History to review or correct previous records and Profile to export backups.

The earlier app used dairy-free meal plans. Version 2 preserves that default during migration. Do not remove a medically required restriction just because a child enters a new age stage. Suggested recipes are examples; check packaged ingredients and adapt preparation to the child's skills.

## Existing records and backups

The app reads the original `babyProfile` and `feedingLog` keys. It keeps them intact and writes future saves as one versioned record. Existing meals retain their amounts, notes and dates. Because older records did not reliably distinguish food offered from food eaten, their intake is labelled **Not recorded**. Original notes, including any refusal observations, remain unchanged. Edit intake in History to include an old meal in confirmed allergen counts.

Export a backup regularly and before clearing website data, changing devices, changing the app's domain, or reinstalling. Browser storage can be removed by the browser or device owner; installation is not a backup and does not provide device-to-device sync. Exported JSON contains personal records: keep it somewhere private.

Import validates the version, profile, dates, food references and record structure before showing a replacement preview. A confirmed replacement retains the previous saved record. On damaged data, the app opens a recovery screen without overwriting the originals. A raw recovery export preserves records for repair; it is intentionally not a normal backup file.

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

Food preparation and meal guidance link to NHS, CDC and other primary sources in the app. [Source notes](docs/revised-evidence-based-feeding-schedule.md) explain the scope. The recipes themselves are examples, not clinically validated treatment plans. The diary does not diagnose food allergies, measure nutrient adequacy, or interpret growth percentiles. It does not replace a child's individual feeding or allergy plan.

Data stays in browser storage; no account, analytics or cloud API is used. Opening an external reference visits that provider's website.
