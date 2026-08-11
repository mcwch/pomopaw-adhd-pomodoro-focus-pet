# PomoPaw Public GitHub Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the public-facing product to PomoPaw, create professional open-source documentation and repository hygiene, and publish the curated project as a public GitHub repository.

**Architecture:** Keep the current Electron desktop app, React/Vite web app, shared timer domain, local-first persistence, and Vercel deployment unchanged. Add documentation and collaboration metadata around those existing boundaries; do not publish local credentials, build output, temporary design responses, or uncurated generated files.

**Tech Stack:** React 19, TypeScript, Vite, Electron, Zustand, Vitest, Playwright, Vercel, GitHub Actions, Mermaid diagrams, GitHub-flavored Markdown.

## Global Constraints

- Product brand: `PomoPaw`.
- Public repository slug: `pomopaw-adhd-pomodoro-focus-pet`.
- Source code license: MIT.
- Visual assets require a separate rights notice and are not automatically covered by the source-code license.
- Friends remains a clearly labelled mock-data preview; account, cloud sync, and real friend relationships remain roadmap items.
- Never publish `.env.local`, API keys, OAuth/deployment tokens, `.vercel/`, `node_modules/`, build output, caches, temporary Stitch API result files, or unrelated worktree artifacts.
- Preserve the current local-first timer behavior and existing verified timer rules.

---

### Task 1: Apply the PomoPaw public-facing naming

**Files:**
- Modify: `src/web/App.tsx`
- Modify: `src/web/components/FloatingCompanion.tsx`
- Modify: `src/web/components/TodayRail.tsx` only if visible companion copy is present there

**Interfaces:**
- Consumes: existing view, floating companion, and pet visibility behavior.
- Produces: visible `PomoPaw` brand text and `Show pet` visibility copy without changing timer or pet state logic.

- [ ] **Step 1: Search public-facing copy**

```powershell
rg -n "Focus Companion|Show companion|show companion|companion" src README.md docs --glob '!docs/superpowers/**'
```

- [ ] **Step 2: Update visible naming**

Use `PomoPaw` for the app navigation brand and `Show pet` for the floating pet recovery control. Keep accessible labels and status messages meaningful, such as `Show pet` and `Hide pet`.

- [ ] **Step 3: Validate naming**

```powershell
npm run typecheck
npm test -- --run tests/web
```

Expected: all web tests pass and timer behavior is unchanged.

- [ ] **Step 4: Commit**

```powershell
git add src/web/App.tsx src/web/components/FloatingCompanion.tsx src/web/components/TodayRail.tsx
git commit -m "refactor: rename product to PomoPaw"
```

---

### Task 2: Capture curated product screenshots

**Files:**
- Create: `docs/screenshots/focus-light.png`
- Create: `docs/screenshots/focus-dark.png`
- Create: `docs/screenshots/progress.png`
- Create: `docs/screenshots/friends.png`
- Create: `docs/screenshots/pet-states.png` when a reliable composite capture is available

**Interfaces:**
- Consumes: verified web server at `http://127.0.0.1:4177/` or the verified production deployment.
- Produces: stable repository-relative images for README and docs.

- [ ] **Step 1: Start the web server**

```powershell
Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev:web','--','--host','127.0.0.1','--port','4177' -WorkingDirectory (Get-Location) -WindowStyle Hidden
```

- [ ] **Step 2: Capture Focus states**

Use Playwright with the installed Chrome executable to capture Focus light mode and dark mode, including navigation, timer, task rail, sound controls, and visible pet.

- [ ] **Step 3: Capture Progress and Friends**

Capture the Progress calendar and Friends preview. Friends must show the `Preview data` label so the screenshot does not imply real cloud rankings.

- [ ] **Step 4: Inspect screenshots**

```powershell
Get-ChildItem docs/screenshots -File | Select-Object Name,Length
```

Open each image once and confirm there are no API keys, local paths, or personal details.

- [ ] **Step 5: Commit screenshots**

```powershell
git add docs/screenshots
git commit -m "docs: add PomoPaw product screenshots"
```

---

### Task 3: Write README and technical documentation

**Files:**
- Modify: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/product-overview.md`
- Create: `docs/ASSETS_LICENSE.md`

**Interfaces:**
- Consumes: the approved design spec, current source tree, screenshots, and Vercel production URL.
- Produces: a searchable project introduction and technically precise developer documentation.

- [ ] **Step 1: Write README hero**

```markdown
# PomoPaw

> An ADHD-friendly Pomodoro focus timer with a virtual pet, task-breakdown AI, ambient sound, streaks, and gentle gamification.
```

Add links to the Vercel demo, setup, architecture, roadmap, and contributing guide. Add badges only for checks that exist.

- [ ] **Step 2: Document product behavior**

Explain reliable focus/break timing, early-end reward rules, small task limits, Mistral task breakdown, sound choices, pet action mapping, Progress calendar, Friends preview, dark mode, and local-first persistence. Explicitly label Friends as mock data and production AI server routing as pending.

- [ ] **Step 3: Add the Mermaid architecture diagram**

Cover React web UI, Electron renderer, shared domain logic, timer service, persistence, rewards, pet state, Vercel, and the future Mistral Function.

- [ ] **Step 4: Add exact setup and validation commands**

Document `npm install`, `npm run dev:web`, `npm run dev`, `npm test -- --run`, `npm run typecheck`, `npm run build:web`, and Windows packaging. Explain that `ADHD_APP_MISTRAL_API_KEY` stays server-side and is never prefixed with `VITE_`.

- [ ] **Step 5: Write detailed docs**

`docs/architecture.md` describes runtime boundaries, timer/session state, persistence, rewards, pet state mapping, web/desktop differences, and deployment topology. `docs/product-overview.md` describes ADHD-friendly principles, user flow, and mock-data boundaries. `docs/ASSETS_LICENSE.md` states that source code is MIT while visual assets require separate permission unless rights are explicitly cleared.

- [ ] **Step 6: Check links and copy**

```powershell
rg -n "docs/screenshots|docs/architecture|docs/product-overview|PomoPaw|Focus Companion|Show companion" README.md docs
git diff --check
```

- [ ] **Step 7: Commit docs**

```powershell
git add README.md docs/architecture.md docs/product-overview.md docs/ASSETS_LICENSE.md
git commit -m "docs: publish PomoPaw project documentation"
```

---

### Task 4: Add open-source collaboration and security metadata

**Files:**
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`
- Create: `.github/ISSUE_TEMPLATE/feature_request.md`
- Create: `.github/pull_request_template.md`

**Interfaces:**
- Consumes: package scripts and the source-code/asset licensing decision.
- Produces: repeatable validation and clear contributor/security expectations.

- [ ] **Step 1: Add MIT source license**

Create the standard MIT `LICENSE` naming the project owner and current year. Link to `docs/ASSETS_LICENSE.md` for the separate visual asset policy.

- [ ] **Step 2: Add contribution and security guidance**

Document local setup, formatting, tests, screenshots for UI changes, and the rule that secrets never belong in issues. `SECURITY.md` requests private vulnerability reports.

- [ ] **Step 3: Add issue and pull request templates**

Bug reports request reproduction steps, environment, expected/actual behavior, and sanitized screenshots/logs. Feature requests request user problem, proposed behavior, and ADHD/accessibility impact. Pull requests request scope, validation, UI screenshots, and data/privacy implications.

- [ ] **Step 4: Add GitHub Actions CI**

Run on pushes and pull requests:

```yaml
npm ci
npm run typecheck
npm test -- --run
npm run build:web
```

Use `actions/setup-node` with npm caching and a current Node LTS version.

- [ ] **Step 5: Commit metadata**

```powershell
git add LICENSE CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md .github
git commit -m "chore: add open source project metadata"
```

---

### Task 5: Audit and validate the public tree

**Files:**
- Modify: `.gitignore` only when a secret or build directory is not already ignored.
- Modify: `.vercelignore` only when deployment-only files need excluding.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a safe, reproducible GitHub-ready working tree.

- [ ] **Step 1: Review tracked and untracked files**

```powershell
git status --short
git ls-files
```

Stage only source, curated docs, curated assets, tests, and configuration. Exclude `.env.local`, `.vercel`, `dist-web`, `node_modules`, `.stitch-api-tmp`, raw Stitch result JSON, and unrelated artifacts.

- [ ] **Step 2: Scan for secrets and local paths**

```powershell
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!dist-web/**' "(API_KEY|SECRET|TOKEN|PRIVATE_KEY|password=|C:\\Users\\)" .
```

Review every match and remove credentials or personal paths before staging.

- [ ] **Step 3: Run the release gate**

```powershell
npm test -- --run
npm run typecheck
npm run build:web
git diff --check
```

Expected: tests pass, typechecking passes, web build succeeds, and diff check has no whitespace errors.

- [ ] **Step 4: Commit the curated release state**

```powershell
git add -A
git status --short
git commit -m "release: prepare PomoPaw public repository"
```

Run `git add -A` only after reviewing the staged-file list.

---

### Task 6: Create and publish the GitHub public repository

**Files:**
- Remote: `https://github.com/mcwch/pomopaw-adhd-pomodoro-focus-pet`

**Interfaces:**
- Consumes: the clean release commit and authenticated GitHub CLI session.
- Produces: a public GitHub repository with curated history, metadata, and the default branch pushed.

- [ ] **Step 1: Confirm authentication and repository absence**

```powershell
gh auth status
gh repo view mcwch/pomopaw-adhd-pomodoro-focus-pet
```

The second command should report that the repository does not exist before creation.

- [ ] **Step 2: Create and push the public repository**

```powershell
gh repo create mcwch/pomopaw-adhd-pomodoro-focus-pet --public --description "ADHD-friendly Pomodoro focus timer with a virtual pet, task-breakdown AI, ambient sound, streaks, and gentle gamification." --source . --remote origin --push
```

- [ ] **Step 3: Add searchable topics**

```powershell
gh repo edit mcwch/pomopaw-adhd-pomodoro-focus-pet --add-topic adhd --add-topic pomodoro --add-topic focus-timer --add-topic virtual-pet --add-topic productivity --add-topic react --add-topic typescript --add-topic electron --add-topic vite --add-topic mistral-ai --add-topic white-noise --add-topic gamification --add-topic desktop-app
```

- [ ] **Step 4: Verify the public landing page**

```powershell
gh repo view mcwch/pomopaw-adhd-pomodoro-focus-pet --web
gh repo view mcwch/pomopaw-adhd-pomodoro-focus-pet --json nameWithOwner,isPrivate,description,defaultBranchRef,url,repositoryTopics
```

Confirm `isPrivate` is `false`, README images render, MIT is detected, and no secret-like file appears in the public tree.

- [ ] **Step 5: Report release result**

Report the public repository URL, commit SHA, Vercel demo URL, validation results, and deferred items such as production AI Function routing and real Friends sync.



