# Deployment

## Build and check

Use Node.js 22 or later:

```sh
npm ci
npm run build
npm test
```

Commit source, package lock, generated `index.html`, `service-worker.js`, `assets/` and `icons/` together. Do not edit generated bundles directly. CI rebuilds and fails when the committed files are out of date.

## Existing GitHub Pages site

The build writes static files to the repository root, so an existing Pages configuration serving the root of `master` can stay as it is. A pull request does not change that deployed branch. Publish by merging the reviewed changes into the branch configured in Pages.

All asset paths, the manifest scope and service-worker registration are relative, supporting a project path such as `/baby-feeding-tracker/`. Serve the complete build atomically through an HTTPS static host. No application server or runtime CDN dependencies are required.

## Offline and updates

Open the app online once and let installation complete before relying on offline use. The worker precaches the matching HTML, compiled JavaScript, CSS, manifest and icons. Installation fails if a required file is unavailable or belongs to a different build; the previous worker remains available.

Updates wait for the Update button or for all old tabs to close. Save any draft first. The refresh follows activation of the new worker. Only caches belonging to this app are cleaned up; personal records live separately in localStorage.

If an older installed app never offers an update, open it online and let the new worker install, then close all tracker tabs in Safari and fully close the installed tracker from the app switcher. Reopen the tracker. Closing every old client lets the waiting worker activate without a banner. Do not clear website data or delete the app to trigger an update.

Before release, verify on the intended iPhone:

1. Export a backup from the existing app.
2. Open the new build on the same origin and verify profile, history, amounts and growth records.
3. With a test profile aged 12–23 months, check the daily planner on Today and Meals. Choose Tomorrow or another eligible date, use **Use this day**, and reload. The choices should remain on that date without adding diary entries or allergen exposures. Confirm that future meals cannot be logged early.
4. Search the **Swap** chooser by recipe and ingredient, select an eligible saved family recipe, and add or remove an optional snack. Verify that each choice saves, recipe preparation steps open, and **Why this meal?** stays collapsed until requested. Unknown custom ingredient roles must not be presented as assessed nutrition.
5. Check that the shopping list contains only ingredients from eligible meals shown for the selected date, with no ingredients added from other swap candidates. Test copying the list, including the manual-copy fallback when clipboard access is unavailable.
6. Change a restriction in the test profile and verify that the saved meal stays visible with a review flag, cannot be logged through the planner, and is excluded from the shopping list. Peanut recipes should only appear as suggestions after peanut is reviewed as tolerated. Swap the affected meal and verify the saved day updates.
7. Log a planned meal on an eligible past or current date, confirm its intake, edit the record and reload. The saved plan and diary entry should remain separate. On a test copy, export and restore a backup containing saved days; check planned-day counts in the restore preview and verify the restored choices. Also check an older backup without `dailyPlans`.
8. Install to Home Screen, close and reopen, then test viewing saved days, swapping eligible recipes and logging food in airplane mode after the build has been cached.
9. Test an update while the app is open; saved plans and diary records should persist and the update should wait for the user's action.
10. Check VoiceOver labels, larger text, keyboard visibility and safe-area spacing, including the date controls, swap dialog and expandable recipe details.

Automated tests cover date calculations, daily plan selection, storage and imports, React forms and service-worker failure behavior. They also install the actual generated worker against the generated HTML and every precached asset, then verify offline responses. These checks do not establish that a physical iPhone installation, update or offline test has been completed. Record those results separately for each release.

## Data recovery

Export before clearing Safari website data, changing the deployment origin, or reinstalling. Those actions may make local records unavailable. Never promise that reinstalling preserves records.

If the app reports a save failure, keep it open and export available records before troubleshooting. If loading fails, use the recovery export and restore a known-good normal backup. The raw recovery file preserves exact storage values for repair and cannot be imported directly as a normal backup.
