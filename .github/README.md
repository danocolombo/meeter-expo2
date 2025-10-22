# Repository-level analysis config

This folder holds repository-level files used by GitHub Apps and automated analysis tools.

What this README covers

-   Purpose of `.github/.githubignore`
-   How to update it safely
-   Tool-specific guidance and examples

## Purpose

`.github/.githubignore` lists paths that should be excluded by code-analysis tools, bots, and other automated readers that support repository-level ignore files. The goal is to reduce noise and analysis time by skipping generated outputs, caches, binaries, and files that commonly contain secrets.

## Safe edits

-   Keep source code directories (for example `app/`, `components/`, `features/`) included so tools continue to scan your application code.
-   Use negative patterns (starting with `!`) only when you want to explicitly allow a path that would otherwise be ignored by a broader rule.
-   Avoid adding one-off ignores for files that should be committed and reviewed by others.

## Tool-specific guidance

-   CodeQL / GitHub Advanced Security: Prefer `codeql` config and the `.codeql` directory for tuning analysis. Use `.github/.githubignore` to remove noisy files that make queries slow, but keep source files visible.
-   Dependabot / Renovate: Use their native configuration files (for example `dependabot.yml`) to tune what dependencies are scanned. Do not rely on `.githubignore` to hide dependency manifests.
-   Static analyzers (ESLint, TypeScript, Flow): Use their own ignore/config files (`.eslintignore`, `tsconfig.json`, `.flowconfig`) for lint/type exclusions — `.github/.githubignore` is only a repository-level convenience for tools that support it.

## Examples

-   To stop analysis of an entire build folder:

    build/

-   To keep your `app/` folder included while ignoring other `build/` folders:

    build/
    !app/build/

## Maintainers

If you change `.github/.githubignore`, please add a short commit message explaining why the new pattern was added and what tool or performance issue it addresses. If the change could affect security scanning (e.g., ignoring a folder that contains secrets), discuss it with the team first.

## Contact

If you need help tuning this file for a specific tool (CodeQL, Snyk, Dependabot, etc.), open an issue describing the tool and the problem and someone from the team will help.

---

Generated and added to explain the `.github/.githubignore` usage.

## Note about `core-files`

The directory `.github/core-files/` contains files and example prompts from a GitHub Copilot Prompt Engineering course that were added for reference. These are intentionally excluded from automated repository analysis to reduce noise and prevent course materials from affecting scan results. If you'd like these scanned, remove the `.github/core-files/` entry from `.github/.githubignore` or create a targeted exception.
