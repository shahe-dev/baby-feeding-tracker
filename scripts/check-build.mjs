import { execFileSync } from "node:child_process";
const generatedPaths = ["index.html", "service-worker.js", "assets", "icons"];
execFileSync("git", ["diff", "--exit-code", "--", ...generatedPaths], {
  stdio: "inherit",
});
const untracked = execFileSync(
  "git",
  ["ls-files", "--others", "--exclude-standard", "--", ...generatedPaths],
  { encoding: "utf8" },
);
if (untracked.trim()) {
  console.error("Generated files need to be committed:\n" + untracked.trim());
  process.exitCode = 1;
}
