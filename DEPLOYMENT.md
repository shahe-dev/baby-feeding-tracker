# Deployment

## Build and check

Use Node.js 22 or later:

```sh
npm ci
npm test
npm run build
```

Commit source, package lock, generated `index.html`, `service-worker.js`, `assets/` and `icons/` together. Do not edit generated bundles directly. CI rebuilds and fails when the committed files are out of date.

## Existing GitHub Pages site

The build writes static files to the repository root, so an existing Pages configuration serving the root of `master` can stay as it is. A pull request does not change that deployed branch. Publish by merging the reviewed changes into the branch configured in Pages.

All asset paths, the manifest scope and service-worker registration are relative, supporting a project path such as `/baby-feeding-tracker/`. Serve the complete build atomically through an HTTPS static host. No application server or runtime CDN dependencies are required.

## Offline and updates

Open the app online once and let installation complete before relying on offline use. The worker precaches the matching HTML, compiled JavaScript, CSS, manifest and icons. Installation fails if a required file is unavailable or belongs to a different build; the previous worker remains available.

Updates wait for the Update button or for all old tabs to close. Save any draft first. The refresh follows activation of the new worker. Only caches belonging to this app are cleaned up; personal records live separately in localStorage.

Before release, verify on the intended iPhone:

1. Export a backup from the existing app.
2. Open the new build on the same origin and verify profile, history, amounts and growth records.
3. Confirm a backdated meal, edit it and reload to verify persistence.
4. Install to Home Screen, close and reopen, then test the app in airplane mode.
5. Test an update while the app is open; saved records should persist and the update should wait for the user's action.
6. Check VoiceOver labels, larger text, keyboard visibility and safe-area spacing.

Automated tests exercise date calculations, imports, React forms and service-worker failure behavior. They do not replace a real iOS installation and offline test.

## Data recovery

Export before clearing Safari website data, changing the deployment origin, or reinstalling. Those actions may make local records unavailable. Never promise that reinstalling preserves records.

If the app reports a save failure, keep it open and export available records before troubleshooting. If loading fails, use the recovery export and restore a known-good normal backup. The raw recovery file preserves exact storage values for repair and cannot be imported directly as a normal backup.
