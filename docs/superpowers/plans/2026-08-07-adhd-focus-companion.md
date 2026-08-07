# ADHD Focus Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Windows-first Electron desktop application that helps users choose one task, complete Pomodoro sessions with ambient sound and a lion companion, and return through gentle local rewards.

**Architecture:** Electron owns native windows, tray behavior, local persistence, timer recovery, and the only network boundary. A React/TypeScript renderer renders the main dashboard and a small overlay through a narrow, typed preload API. Pure TypeScript domain modules implement timer, task selection, rewards, and recovery rules so they can be fully tested without Electron.

**Tech Stack:** Electron, electron-vite, React, TypeScript, Zustand, Vitest, React Testing Library, Playwright, Zod, Electron safeStorage, Web Audio/HTMLAudioElement, electron-builder.

## Global Constraints

- Ship Windows first; closing the main window hides it to the system tray and only an explicit tray Quit exits.
- Use 25-minute focus, 5-minute short break, and a 15-minute long break after four fully completed focus sessions.
- Record an early-ended session's actual elapsed minutes, but never award it stars, a completed Pomodoro, cycle progress, or milestones.
- Store all tasks, sessions, rewards, settings, and unlocks locally by default; no sign-in or telemetry in v1.
- Never inspect files, screen, calendar, browser activity, keyboard, microphone, or camera.
- AI is opt-in, user-triggered, and may only receive task text and user-supplied metadata for that request.
- Use a single focus-star currency; no randomized rewards, purchases, time limits, loss mechanics, shame copy, or punitive streaks.
- Do not use NUS marks, source artwork, names, or a derivative mascot. Create an original cream/gold lion with a blue mane.

---

## File structure

```
src/
  main/
    index.ts                 # Electron lifecycle, IPC registration, native windows
    tray.ts                  # Hide/show/quit tray menu
    windows.ts               # Main and focus-overlay BrowserWindow lifecycle
    persistence.ts           # Versioned atomic JSON storage in app userData
    recovery.ts              # Resolve an active session from persisted timestamps
    ai.ts                    # Opt-in OpenAI Responses API adapter; no autonomous actions
  preload/
    index.ts                 # Narrow, typed contextBridge API
  shared/
    domain.ts                # Branded IDs, entities, persisted AppState, Zod schemas
    timer.ts                 # Pure transition and elapsed-time functions
    tasks.ts                 # Today capacity, local recommendation, rescue choice rules
    rewards.ts               # Stars, unlocks, weekly-return and milestone rules
    ipc.ts                   # Request/response/event contracts shared by all processes
  renderer/
    main.tsx                 # Main React entry point
    App.tsx                  # Main-view routing and hydration gate
    store.ts                 # Renderer state and IPC subscriptions
    styles.css               # Tokens, reduced-motion behavior, global layout
    components/
      StartPanel.tsx         # One-action start surface and quick capture
      TodayBoard.tsx         # Three-task Today board, Inbox movement, task edits
      ChooseHelp.tsx         # Local/AI recommendation cards and rescue choices
      TimerPanel.tsx         # Focus/break timer controls and early-end confirmation
      Companion.tsx          # Original lion states and controlled animation variants
      StudyCorner.tsx        # Decoration unlock display and milestone feedback
      SoundPicker.tsx        # Four built-in sounds and volume control
      SettingsDialog.tsx     # Overlay mode, motion, AI consent/key, audio preferences
    overlay.tsx              # Separate overlay renderer entry point
    OverlayApp.tsx           # Draggable compact timer/companion surface
  assets/
    lion/                   # Original source/exported lion state assets
    audio/                   # Audited loopable rain/cafe/forest/white-noise assets
tests/
  unit/                      # Vitest tests for shared and main-process modules
  renderer/                  # React Testing Library component tests
  e2e/                       # Playwright smoke tests for renderer behavior
```

## Task 1: Create the Electron/React foundation and secure process boundary

**Files:**
- Create: `package.json`, `electron.vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`
- Create: `src/main/index.ts`, `src/preload/index.ts`, `src/shared/ipc.ts`, `src/renderer/main.tsx`, `src/renderer/App.tsx`, `src/renderer/styles.css`
- Create: `tests/unit/ipc.test.ts`, `tests/renderer/App.test.tsx`
- Create: `.gitignore`, `README.md`

**Interfaces:**
- Produces `window.focusApp: FocusAppApi`, the sole renderer-to-main interface.
- Produces `AppState` hydration event and `app:ready` IPC contract for all later tasks.

- [ ] **Step 1: Scaffold the project with Electron + React + TypeScript and install the exact development tools**

  Run:

  ```powershell
  npm create electron-vite@latest . -- --template react-ts --force
  npm install zod zustand
  npm install -D vitest @testing-library/react @testing-library/user-event jsdom @playwright/test electron-builder
  npx playwright install chromium
  ```

- [ ] **Step 2: Write failing IPC and rendering tests**

  ```ts
  // tests/unit/ipc.test.ts
  import { appReadyRequestSchema } from '../../src/shared/ipc'

  it('accepts an empty app-ready request and rejects extra renderer data', () => {
    expect(appReadyRequestSchema.safeParse({}).success).toBe(true)
    expect(appReadyRequestSchema.safeParse({ unexpected: true }).success).toBe(false)
  })
  ```

  ```tsx
  // tests/renderer/App.test.tsx
  import { render, screen } from '@testing-library/react'
  import App from '../../src/renderer/App'

  it('shows a loading gate before local state hydrates', () => {
    render(<App />)
    expect(screen.getByText('Preparing your study corner…')).toBeInTheDocument()
  })
  ```

- [ ] **Step 3: Run the focused tests and confirm they fail before implementation**

  Run: `npm run test -- --run tests/unit/ipc.test.ts tests/renderer/App.test.tsx`

  Expected: FAIL because the shared IPC module and App do not exist.

- [ ] **Step 4: Implement the minimal typed preload contract and hydration shell**

  ```ts
  // src/shared/ipc.ts
  import { z } from 'zod'
  export const appReadyRequestSchema = z.object({}).strict()
  export type FocusAppApi = { appReady(): Promise<unknown> }
  ```

  ```ts
  // src/preload/index.ts
  contextBridge.exposeInMainWorld('focusApp', {
    appReady: () => ipcRenderer.invoke('app:ready', {})
  } satisfies FocusAppApi)
  ```

  Configure BrowserWindow with `contextIsolation: true`, `nodeIntegration: false`, and the preload path. Register `app:ready` after validating with Zod. Add `src/renderer/global.d.ts` with `interface Window { focusApp: FocusAppApi }`.

- [ ] **Step 5: Make the loading gate pass and add strict TypeScript declarations for `window.focusApp`**

  ```tsx
  export default function App() {
    return <main aria-busy="true">Preparing your study corner…</main>
  }
  ```

- [ ] **Step 6: Run quality gates**

  Run: `npm run test -- --run tests/unit/ipc.test.ts tests/renderer/App.test.tsx; npm run typecheck; npm run build`

  Expected: all commands exit 0.

- [ ] **Step 7: Commit the foundation**

  ```powershell
  git add package.json package-lock.json electron.vite.config.ts tsconfig.json vitest.config.ts playwright.config.ts src tests .gitignore README.md
  git commit -m "chore: scaffold Electron focus companion"
  ```

## Task 2: Implement the pure Pomodoro domain and reward-safe session accounting

**Files:**
- Create: `src/shared/domain.ts`, `src/shared/timer.ts`, `src/shared/rewards.ts`
- Create: `tests/unit/timer.test.ts`, `tests/unit/rewards.test.ts`

**Interfaces:**
- Produces `Session`, `TimerSnapshot`, `transitionTimer(snapshot, action, now)`, `endFocusEarly(snapshot, now)`, and `applySessionOutcome(state, session)`.
- Consumes no Electron or browser API.

- [ ] **Step 1: Write failing timer tests for complete and partial sessions**

  ```ts
  it('records 18 elapsed minutes without completing a Pomodoro', () => {
    const ended = endFocusEarly(focusAt('2026-08-07T09:00:00Z'), date('2026-08-07T09:18:00Z'))
    expect(ended.session).toMatchObject({ elapsedSeconds: 1080, outcome: 'partial' })
    expect(ended.completedFocusCount).toBe(0)
  })

  it('awards a completion only after the full focus duration', () => {
    const ended = transitionTimer(focusAt('2026-08-07T09:00:00Z'), { type: 'TICK' }, date('2026-08-07T09:25:00Z'))
    expect(ended.session?.outcome).toBe('completed')
    expect(ended.nextPhase).toBe('short_break')
  })
  ```

- [ ] **Step 2: Run the timer test before implementation**

  Run: `npm run test -- --run tests/unit/timer.test.ts`

  Expected: FAIL because timer exports are absent.

- [ ] **Step 3: Define validated domain entities and pure timing transitions**

  ```ts
  export const FOCUS_SECONDS = 25 * 60
  export const SHORT_BREAK_SECONDS = 5 * 60
  export const LONG_BREAK_SECONDS = 15 * 60
  export type SessionOutcome = 'completed' | 'partial' | 'cancelled'
  export type TimerPhase = 'idle' | 'focus' | 'short_break' | 'long_break' | 'paused'
  ```

  Store timestamps as ISO strings and calculate elapsed seconds from `now - startedAt - accumulatedPausedSeconds`; never increment a mutable in-memory counter as the source of truth.

- [ ] **Step 4: Write failing reward-rule tests**

  ```ts
  it('gives one focus star only for a completed focus session', () => {
    expect(applySessionOutcome(baseState(), completedFocus()).stars).toBe(1)
    expect(applySessionOutcome(baseState(), partialFocus(1080)).stars).toBe(0)
  })
  ```

- [ ] **Step 5: Implement stars, milestones, and forgiving weekly return count**

  Implement `applySessionOutcome` so completed focus earns one star, user-marked task completion earns the configured small bonus, and a partial session only accumulates minutes. Compute `weeklyReturnDays` from unique local calendar dates in the current week; do not store/reset a streak.

- [ ] **Step 6: Run tests and type checking**

  Run: `npm run test -- --run tests/unit/timer.test.ts tests/unit/rewards.test.ts; npm run typecheck`

  Expected: PASS.

- [ ] **Step 7: Commit the domain layer**

  ```powershell
  git add src/shared/domain.ts src/shared/timer.ts src/shared/rewards.ts tests/unit/timer.test.ts tests/unit/rewards.test.ts
  git commit -m "feat: add Pomodoro timing and reward rules"
  ```

## Task 3: Add local tasks, Today limits, recommendation, and rescue actions

**Files:**
- Create: `src/shared/tasks.ts`, `tests/unit/tasks.test.ts`
- Modify: `src/shared/domain.ts`

**Interfaces:**
- Produces `addToToday`, `moveToInbox`, `recommendNextTask`, `recordTaskDecline`, and `rescueOptions`.
- Consumes `Task`, `TaskStatus`, and a caller-provided `now` so sorting is deterministic.

- [ ] **Step 1: Write failing capacity and recommendation tests**

  ```ts
  it('refuses a fourth Today task without losing the Inbox task', () => {
    const result = addToToday(threeTodayTasks(), inboxTask())
    expect(result.ok).toBe(false)
    expect(result.reason).toBe('today_limit')
  })

  it('prefers an approaching, unstarted task that matches current energy', () => {
    const chosen = recommendNextTask(tasks(), { energy: 'low', now: date('2026-08-07T09:00:00Z') })
    expect(chosen?.id).toBe('tax-form')
  })
  ```

- [ ] **Step 2: Run the task test before implementation**

  Run: `npm run test -- --run tests/unit/tasks.test.ts`

  Expected: FAIL because task operations do not exist.

- [ ] **Step 3: Implement task operations with explicit outcomes**

  `addToToday` must return `{ ok: true, task }` or `{ ok: false, reason: 'today_limit' }`. `recommendNextTask` must sort by deadline urgency, absence of progress today, estimated one-to-two-Pomodoro approachability, and energy match in that order. Keep the scoring function private; return only the recommended task and a human-readable reason.

- [ ] **Step 4: Test non-judgmental rescue behavior**

  ```ts
  it('offers shrink, lower-energy, and inbox options after a second decline', () => {
    const task = recordTaskDecline(recordTaskDecline(todayTask()))
    expect(rescueOptions(task).map(({ kind }) => kind)).toEqual(['shrink', 'lower_energy', 'move_to_inbox'])
  })
  ```

- [ ] **Step 5: Implement rescue-state persistence and run the tests**

  Run: `npm run test -- --run tests/unit/tasks.test.ts; npm run typecheck`

  Expected: PASS.

- [ ] **Step 6: Commit task selection logic**

  ```powershell
  git add src/shared/domain.ts src/shared/tasks.ts tests/unit/tasks.test.ts
  git commit -m "feat: add ADHD-friendly task selection"
  ```

## Task 4: Persist local state and recover safely across restart, sleep, and wake

**Files:**
- Create: `src/main/persistence.ts`, `src/main/recovery.ts`
- Create: `tests/unit/persistence.test.ts`, `tests/unit/recovery.test.ts`
- Modify: `src/shared/domain.ts`, `src/main/index.ts`, `src/shared/ipc.ts`, `src/preload/index.ts`

**Interfaces:**
- Produces `StateRepository.load(): AppState`, `StateRepository.save(state): Promise<void>`, and `recoverTimer(state, now): RecoveryResult`.
- Consumes validated `AppStateSchema` and writes only under Electron `app.getPath('userData')`.

- [ ] **Step 1: Write failing atomic-storage and restart-recovery tests**

  ```ts
  it('falls back to a fresh state when persisted JSON fails schema validation', async () => {
    await fs.writeFile(file, '{"version":"wrong"}')
    expect(await repository.load()).toEqual(freshAppState())
  })

  it('does not silently award focus completion after the app was closed', () => {
    const result = recoverTimer(activeFocusAt('2026-08-07T09:00:00Z'), date('2026-08-07T10:00:00Z'))
    expect(result).toMatchObject({ requiresUserAcknowledgement: true, awardedCompletion: false })
  })
  ```

- [ ] **Step 2: Run the persistence tests before implementation**

  Run: `npm run test -- --run tests/unit/persistence.test.ts tests/unit/recovery.test.ts`

  Expected: FAIL because repository and recovery modules are absent.

- [ ] **Step 3: Implement versioned, atomic JSON persistence**

  Write to `focus-state.json.tmp`, `fsync` if supported, then rename to `focus-state.json`. Parse with Zod on every load. On invalid/missing state, return a fresh state and preserve the invalid file as `focus-state.invalid-<timestamp>.json` for recovery rather than deleting it.

- [ ] **Step 4: Implement conservative active-session recovery**

  If a persisted active session's target elapsed while unavailable, create a pending recovery notice requiring explicit user acknowledgement. The user may record elapsed time as partial or discard it; the recovery code never creates a completed focus event or star by itself.

- [ ] **Step 5: Run tests and verify no state can leave the main process unvalidated**

  Run: `npm run test -- --run tests/unit/persistence.test.ts tests/unit/recovery.test.ts; npm run typecheck`

  Expected: PASS.

- [ ] **Step 6: Commit persistence and recovery**

  ```powershell
  git add src/main/persistence.ts src/main/recovery.ts src/main/index.ts src/shared src/preload tests/unit
  git commit -m "feat: persist focus data and recover timers safely"
  ```

## Task 5: Build native tray, main-window, and overlay lifecycle

**Files:**
- Create: `src/main/tray.ts`, `src/main/windows.ts`
- Create: `tests/unit/tray.test.ts`, `tests/unit/windows.test.ts`
- Modify: `src/main/index.ts`, `src/shared/ipc.ts`, `src/preload/index.ts`

**Interfaces:**
- Produces `createMainWindow`, `createOverlayWindow`, `setOverlayMode`, and `createTrayController`.
- Consumes overlay preferences (`companion`, `timer_only`, `hidden`) and exposes validated IPC `window:setOverlayMode` and `window:moveOverlay`.

- [ ] **Step 1: Write failing lifecycle tests using injected Electron fakes**

  ```ts
  it('hides the main window when it receives close and quits only from tray Quit', () => {
    const { controller, window, app } = makeTrayHarness()
    controller.bind(window)
    window.emitClose()
    expect(window.hide).toHaveBeenCalled()
    controller.quit()
    expect(app.quit).toHaveBeenCalledOnce()
  })
  ```

- [ ] **Step 2: Run lifecycle tests before implementation**

  Run: `npm run test -- --run tests/unit/tray.test.ts tests/unit/windows.test.ts`

  Expected: FAIL because native controllers do not exist.

- [ ] **Step 3: Implement main and overlay windows with safe defaults**

  Create the overlay as a frameless, transparent, `alwaysOnTop` BrowserWindow with `resizable: false`, `skipTaskbar: true`, and its own preload entry. Validate all renderer requests before moving it. Persist only user-initiated position changes and clamp restored bounds to a visible display work area.

- [ ] **Step 4: Implement system tray commands**

  The menu must expose `Show focus companion`, `Hide overlay`, and `Quit`. `window-all-closed` must not quit the Windows application while the tray is active. Use a bundled original app icon; do not use NUS imagery.

- [ ] **Step 5: Run native-controller unit tests and package a dev build**

  Run: `npm run test -- --run tests/unit/tray.test.ts tests/unit/windows.test.ts; npm run build`

  Expected: PASS.

- [ ] **Step 6: Commit native lifecycle behavior**

  ```powershell
  git add src/main/tray.ts src/main/windows.ts src/main/index.ts src/shared/ipc.ts src/preload tests/unit
  git commit -m "feat: add tray and focus overlay windows"
  ```

## Task 6: Deliver task-start, timer, and sound controls in the renderer

**Files:**
- Create: `src/renderer/store.ts`, `src/renderer/components/StartPanel.tsx`, `src/renderer/components/TodayBoard.tsx`, `src/renderer/components/TimerPanel.tsx`, `src/renderer/components/SoundPicker.tsx`
- Create: `src/renderer/audio.ts`, `tests/renderer/StartPanel.test.tsx`, `tests/renderer/TimerPanel.test.tsx`, `tests/renderer/SoundPicker.test.tsx`
- Modify: `src/renderer/App.tsx`, `src/renderer/styles.css`, `src/shared/ipc.ts`, `src/preload/index.ts`

**Interfaces:**
- Produces renderer actions `startFocus(taskId | null, adHocTitle)`, `endFocusEarly()`, `confirmEarlyEnd()`, `selectAmbientSound(soundId, volume)`, and `setTaskComplete(taskId)`.
- Consumes hydrated `AppState` and main-process timer events; no component owns timer truth.

- [ ] **Step 1: Write failing behavior tests for the low-friction start and partial-end confirmation**

  ```tsx
  it('starts a focus session from a one-line ad-hoc task', async () => {
    render(<StartPanel />)
    await userEvent.type(screen.getByLabelText('What do you want to move forward right now?'), 'Open report and outline headings')
    await userEvent.click(screen.getByRole('button', { name: 'Start 25 minutes' }))
    expect(window.focusApp.startFocus).toHaveBeenCalledWith({ adHocTitle: 'Open report and outline headings' })
  })

  it('asks for confirmation before recording an early end', async () => {
    render(<TimerPanel phase="focus" remainingSeconds={420} />)
    await userEvent.click(screen.getByRole('button', { name: 'End early' }))
    expect(screen.getByText('You focused for 18 minutes. Record and end?')).toBeVisible()
  })
  ```

- [ ] **Step 2: Run renderer tests before implementation**

  Run: `npm run test -- --run tests/renderer/StartPanel.test.tsx tests/renderer/TimerPanel.test.tsx tests/renderer/SoundPicker.test.tsx`

  Expected: FAIL because the components and IPC methods are absent.

- [ ] **Step 3: Implement state hydration, one-primary-action panels, and timer controls**

  Make the idle surface focus the input and selected Today task; do not display a giant backlog or metrics. During focus, display only task title, remaining time, pause/end controls, and optional sound control. Use the main process as the timer authority and subscribe to snapshot events through the preload API.

- [ ] **Step 4: Add supplied audio tracks and isolated failure behavior**

  Add four license-audited, loopable assets (`rain`, `cafe`, `forest`, `white_noise`) to `src/renderer/assets/audio/` with a `THIRD_PARTY_NOTICES.md` entry containing source URL, license, author, and modification status. Use `HTMLAudioElement.loop = true`, save selection/volume, fade via Web Audio gain when available, and show one dismissible sound-only error if loading fails.

- [ ] **Step 5: Add an audio failure test and run focused tests**

  ```ts
  it('reports a sound error without ending the current timer', () => {
    audio.emitError('rain')
    expect(store.getState().timer.phase).toBe('focus')
    expect(store.getState().soundError).toMatch(/Rain could not play/)
  })
  ```

  Run: `npm run test -- --run tests/renderer/StartPanel.test.tsx tests/renderer/TimerPanel.test.tsx tests/renderer/SoundPicker.test.tsx; npm run typecheck`

  Expected: PASS.

- [ ] **Step 6: Commit focus UI and audio**

  ```powershell
  git add src/renderer src/shared/ipc.ts src/preload THIRD_PARTY_NOTICES.md tests/renderer
  git commit -m "feat: add task-start timer and ambient sound controls"
  ```

## Task 7: Add local choice help and consented AI first-step suggestions

**Files:**
- Create: `src/main/ai.ts`, `src/renderer/components/ChooseHelp.tsx`, `src/renderer/components/SettingsDialog.tsx`
- Create: `tests/unit/ai.test.ts`, `tests/renderer/ChooseHelp.test.tsx`, `tests/renderer/SettingsDialog.test.tsx`
- Modify: `src/shared/ipc.ts`, `src/preload/index.ts`, `src/main/index.ts`, `src/renderer/store.ts`, `src/shared/domain.ts`

**Interfaces:**
- Produces `suggestWithAi(input: AiSuggestionInput): Promise<AiSuggestionResponse>` and `recommendLocally(input): Recommendation`.
- Consumes explicit `aiConsent: boolean`; secret API key is stored only with Electron `safeStorage`, never in AppState or renderer state.

- [ ] **Step 1: Write failing AI consent and fallback tests**

  ```ts
  it('refuses an AI request before the user grants consent', async () => {
    await expect(ai.suggest({ consent: false, tasks: [task()] })).rejects.toThrow('AI consent is required')
  })

  it('returns the deterministic local recommendation when the provider fails', async () => {
    const result = await chooseTask({ consent: true, tasks: tasks(), provider: failingProvider })
    expect(result.source).toBe('local_fallback')
  })
  ```

- [ ] **Step 2: Run AI tests before implementation**

  Run: `npm run test -- --run tests/unit/ai.test.ts tests/renderer/ChooseHelp.test.tsx tests/renderer/SettingsDialog.test.tsx`

  Expected: FAIL because AI modules and controls are absent.

- [ ] **Step 3: Implement a constrained OpenAI Responses API adapter behind a provider interface**

  Define `AiProvider.suggest(input): Promise<AiSuggestionResponse>`. The concrete adapter must send only title/deadline/estimate/energy metadata after consent, request strict JSON with at most three `{ taskId, reason, firstStep }` suggestions, and set a request timeout. Store a user-supplied API key with `safeStorage.encryptString`; do not log it. Treat API setup as optional: no key means local recommendation, not an error.

- [ ] **Step 4: Implement the human-control renderer flow**

  `Help me choose one` first displays the local recommendation. AI remains a separate, labeled button only when enabled. Cards expose `Use this`, `Choose another`, and `Not for me`; no action mutates tasks or starts a timer without a separate user click. Show rescue choices after the second decline.

- [ ] **Step 5: Test task-text minimization and UI fallback**

  ```ts
  it('does not include any device or activity fields in an AI request', async () => {
    const body = provider.lastRequestBody()
    expect(JSON.stringify(body)).not.toMatch(/screen|calendar|keyboard|file|browser/i)
  })
  ```

  Run: `npm run test -- --run tests/unit/ai.test.ts tests/renderer/ChooseHelp.test.tsx tests/renderer/SettingsDialog.test.tsx; npm run typecheck`

  Expected: PASS.

- [ ] **Step 6: Commit choice help and optional AI**

  ```powershell
  git add src/main/ai.ts src/renderer/components/ChooseHelp.tsx src/renderer/components/SettingsDialog.tsx src/shared src/preload tests
  git commit -m "feat: add consented task-start suggestions"
  ```

## Task 8: Build the original blue-maned lion, study corner, and gentle progression

**Files:**
- Create: `src/renderer/components/Companion.tsx`, `src/renderer/components/StudyCorner.tsx`
- Create: `src/renderer/assets/lion/`, `src/renderer/assets/decorations/`
- Create: `tests/renderer/Companion.test.tsx`, `tests/renderer/StudyCorner.test.tsx`
- Modify: `src/renderer/App.tsx`, `src/renderer/styles.css`, `src/renderer/store.ts`, `src/shared/rewards.ts`

**Interfaces:**
- Produces `Companion({ state, reducedMotion })` and `StudyCorner({ unlockedDecorationIds, milestone })`.
- Consumes `TimerPhase`, `RewardState`, and `reducedMotion`; never depends on timer interval ownership.

- [ ] **Step 1: Create original, non-derivative assets before coding the component**

  Use the ImageGen skill to make a consistent small set of original transparent-background assets: cream/gold cub, fluffy blue mane, and state poses `idle`, `studying`, `stretching`, `celebrating`. The prompt must explicitly prohibit NUS marks, NUS mascot reference images, copied logos, and recognizable derivative designs. Store the source prompt and asset provenance in `src/renderer/assets/lion/README.md`.

- [ ] **Step 2: Write failing motion and unlock tests**

  ```tsx
  it('renders the quiet studying state during focus and disables animation when requested', () => {
    render(<Companion state="focus" reducedMotion />)
    expect(screen.getByLabelText('Lion companion studying')).toHaveAttribute('data-animated', 'false')
  })

  it('shows a lamp after the first decoration threshold without a purchase UI', () => {
    render(<StudyCorner unlockedDecorationIds={['lamp']} milestone={null} />)
    expect(screen.getByAltText('Unlocked desk lamp')).toBeVisible()
    expect(screen.queryByText(/buy|shop|coins/i)).not.toBeInTheDocument()
  })
  ```

- [ ] **Step 3: Run companion tests before implementation**

  Run: `npm run test -- --run tests/renderer/Companion.test.tsx tests/renderer/StudyCorner.test.tsx`

  Expected: FAIL because companion components are absent.

- [ ] **Step 4: Implement state-driven companion presentation and threshold unlocks**

  Use CSS transitions keyed by `data-state`; honor `prefers-reduced-motion` and the saved explicit setting. Define decorations as a static ordered list with star thresholds. Render only unlocked assets and use a single brief milestone dialog for completed-focus counts 1, 7, and 30 plus first task completion.

- [ ] **Step 5: Run visual component tests and build**

  Run: `npm run test -- --run tests/renderer/Companion.test.tsx tests/renderer/StudyCorner.test.tsx; npm run build`

  Expected: PASS.

- [ ] **Step 6: Commit companion and progression**

  ```powershell
  git add src/renderer/components/Companion.tsx src/renderer/components/StudyCorner.tsx src/renderer/assets src/renderer/App.tsx src/renderer/styles.css src/shared/rewards.ts tests/renderer
  git commit -m "feat: add blue-maned lion companion and study corner"
  ```

## Task 9: Connect the overlay, recovery notices, and complete the end-to-end experience

**Files:**
- Create: `src/renderer/overlay.tsx`, `src/renderer/OverlayApp.tsx`, `src/renderer/components/RecoveryNotice.tsx`
- Create: `tests/renderer/OverlayApp.test.tsx`, `tests/e2e/focus-flow.spec.ts`
- Modify: `src/main/windows.ts`, `src/main/index.ts`, `src/renderer/App.tsx`, `src/renderer/store.ts`, `src/shared/ipc.ts`, `src/preload/index.ts`

**Interfaces:**
- Produces `OverlayApp`, `RecoveryNotice`, and end-to-end flow from `startFocus` to recorded completion/partial result.
- Consumes window-mode IPC, timer snapshots, persisted overlay position, and `RecoveryResult`.

- [ ] **Step 1: Write failing overlay and recovery component tests**

  ```tsx
  it('can render timer-only overlay mode without the lion', () => {
    render(<OverlayApp mode="timer_only" snapshot={focusSnapshot()} />)
    expect(screen.getByText('24:59')).toBeVisible()
    expect(screen.queryByLabelText(/lion companion/i)).not.toBeInTheDocument()
  })

  it('requires an explicit choice for a recovered expired timer', async () => {
    render(<RecoveryNotice result={expiredWhileClosed()} />)
    expect(screen.getByText(/Your timer finished while the app was closed/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Record elapsed time only' })).toBeVisible()
  })
  ```

- [ ] **Step 2: Run UI tests before implementation**

  Run: `npm run test -- --run tests/renderer/OverlayApp.test.tsx`

  Expected: FAIL because overlay renderer and recovery notice do not exist.

- [ ] **Step 3: Implement overlay modes and drag persistence**

  The overlay must provide `companion`, `timer_only`, and `hidden` modes. On drag end it sends its bounds through validated IPC. It never owns or advances the timer; it renders subscribed snapshots. The hidden mode destroys/hides the overlay but leaves focus timing alive.

- [ ] **Step 4: Implement recovery acknowledgement actions**

  The notice exposes exactly `Record elapsed time only` and `Discard this session`; neither action gives stars. It must not render a completion button for an expired session that was not active in the app.

- [ ] **Step 5: Add and run the primary browser-level flow**

  ```ts
  test('records an early end as minutes but not as a reward', async ({ page }) => {
    await page.getByLabel('What do you want to move forward right now?').fill('Draft report headings')
    await page.getByRole('button', { name: 'Start 25 minutes' }).click()
    await page.getByRole('button', { name: 'End early' }).click()
    await page.getByRole('button', { name: 'Record and end' }).click()
    await expect(page.getByText('18 focused minutes recorded')).toBeVisible()
    await expect(page.getByText('0 focus stars earned')).toBeVisible()
  })
  ```

  Run: `npm run test -- --run tests/renderer/OverlayApp.test.tsx; npm run test:e2e -- tests/e2e/focus-flow.spec.ts`

  Expected: PASS.

- [ ] **Step 6: Commit the integrated focus flow**

  ```powershell
  git add src/main src/preload src/shared src/renderer tests
  git commit -m "feat: complete recoverable desktop focus flow"
  ```

## Task 10: Package, verify, and document the Windows release candidate

**Files:**
- Create: `electron-builder.yml`, `docs/manual-qa.md`, `THIRD_PARTY_NOTICES.md`
- Create: `tests/unit/packaging.test.ts`
- Modify: `package.json`, `README.md`
- Test: `tests/e2e/focus-flow.spec.ts`

**Interfaces:**
- Produces an unsigned Windows installer artifact and a repeatable QA checklist.
- Consumes all completed application contracts; introduces no new product behavior.

- [ ] **Step 1: Add failing packaging configuration verification**

  ```ts
  it('declares Windows NSIS packaging and does not package development test files', () => {
    const config = readBuilderConfig()
    expect(config.win.target).toContain('nsis')
    expect(config.files).not.toContain('tests')
  })
  ```

- [ ] **Step 2: Run the packaging configuration test before implementation**

  Run: `npm run test -- --run tests/unit/packaging.test.ts`

  Expected: FAIL because build configuration is absent.

- [ ] **Step 3: Configure Windows installer and release scripts**

  Add `package`, `test`, `test:e2e`, `typecheck`, and `lint` scripts. Configure an NSIS Windows target, include tray/lion/audio assets, and exclude source maps/tests from the packaged application. Do not claim code signing unless a signing certificate has actually been supplied.

- [ ] **Step 4: Write the manual QA checklist with concrete acceptance actions**

  Cover: first launch without account; tray close/show/quit; focus completion; early end at 18 minutes; pause/resume; four-session long break; restart/wake recovery; all sound tracks and a forced audio error; all overlay modes and drag; reduced animation; Today limit and rescue choices; AI disabled, consented, no-key, and provider-failure modes; local data inspection/deletion instructions.

- [ ] **Step 5: Run the full verification suite and build the installer**

  Run: `npm run lint; npm run typecheck; npm run test -- --run; npm run test:e2e; npm run build; npm run package`

  Expected: every command exits 0 and `release/` contains the Windows installer artifact.

- [ ] **Step 6: Commit release configuration and documentation**

  ```powershell
  git add electron-builder.yml package.json package-lock.json README.md docs/manual-qa.md THIRD_PARTY_NOTICES.md tests/unit/packaging.test.ts
  git commit -m "chore: package Windows focus companion"
  ```

## Plan self-review

- **Spec coverage:** Tasks 2 and 9 cover the complete/partial Pomodoro and restart rules. Task 3 covers Today/Inbox/recommendation/rescue. Task 6 covers task start and audio. Task 7 covers local-first, opt-in AI and fallback. Task 8 covers the original lion, rewards, study corner, reduced motion, and non-punitive return feedback. Tasks 4 and 5 cover persistence, tray, overlay, and privacy boundaries. Task 10 covers the required verification and Windows package.
- **Scope:** Social features, custom imported audio, accounts, cloud sync, mobile, and competitive rewards are intentionally excluded. A future social plan must independently solve identity, consent, abuse, and anti-cheating.
- **Consistency:** `completed` means a full 25-minute focus interval throughout. `partial` stores only elapsed minutes. Timer authority remains in the main process; all renderer windows subscribe through the preload API.
- **Completeness check:** Every task specifies files, interfaces, test evidence, implementation detail, verification, and a commit. Asset provenance and OpenAI configuration are concrete implementation requirements.
