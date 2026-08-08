# Digital Study Corner Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-first, local-first Focus Companion that presents the reliable Pomodoro flow as a calm digital study corner.

**Architecture:** Keep the timer transition and reward domain model pure and reusable. Add a browser persistence adapter plus a Web App shell that owns timer scheduling through timestamps, while React renders idle, focus, pause, break, completion, early-end, and recovery states from one store. The desktop wrapper becomes an optional later host rather than the UI authority.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Vitest, React Testing Library, browser localStorage, CSS, ImageGen-created transparent PNG character assets.

## Global Constraints

- Preserve 25/5/15 Pomodoro behavior, four-focus long breaks, and timestamp-derived time.
- Only a verified full 25-minute focus earns one star; partial sessions retain actual minutes and earn zero stars.
- Local-first only: no accounts, servers, analytics, cloud sync, public leaderboards, shops, random rewards, or timed events.
- The focus view remains quiet: active task, time, sound, pause, early end, and companion only.
- Blue-maned lion assets must be original and must not copy NUS branding or commercial mascot art.
- Desktop and narrow browser layouts keep task and timer primary; no breakable streak language.

---

## File structure

```text
src/web/
  main.tsx                         # Browser entry point
  App.tsx                          # Study desk shell and state routing
  storage.ts                        # localStorage adapter for AppState and FocusHistory
  timer-service.ts                  # Browser scheduler and timer command authority
  store.ts                          # Zustand display/command store
  components/
    StudyDesk.tsx                   # Three-region desktop and narrow layout
    TodayRail.tsx                   # Up to three active tasks and first-step entry
    FocusCanvas.tsx                 # Idle/focus/paused/break/completion views
    StudyCorner.tsx                 # Lion scene, unlocks, weekly return copy
    RecoveryNotice.tsx              # Partial/discard-only recovery sheet
  assets/lion/                      # Original transparent lion state PNGs
  styles/study-desk.css             # Tokens, responsive layout, reduced motion
tests/web/
  timer-service.test.ts
  StudyDesk.test.tsx
  FocusCanvas.test.tsx
  RecoveryNotice.test.tsx
```

### Task 1: Extract browser-safe timer service

**Files:**
- Create: `src/web/storage.ts`
- Create: `src/web/timer-service.ts`
- Test: `tests/web/timer-service.test.ts`

**Interfaces:**
- Produces `BrowserStateRepository`, `createTimerService`, and `TimerService`.
- `TimerService` exposes `hydrate(): Promise<{ snapshot: TimerSnapshot; recovery: SessionRecord | null }>`; `start(task)`, `pause()`, `resume()`, `endEarly()`, `recordRecoveredPartial()`, `discardRecoveredSession()`, `tick()`, and `subscribe(listener)`.

- [ ] **Step 1: Write failing timer service tests**

```ts
it('stores and publishes a full focus completion before its short break', async () => {
  const service = createTimerService({ repository, now: () => '2026-08-08T09:25:00.000Z', makeId: () => 'session-1' })
  await service.start({ id: 'report', title: 'Outline report' }, '2026-08-08T09:00:00.000Z')
  await service.tick()
  expect(history.sessions[0]).toMatchObject({ outcome: 'completed', awardedStars: 1 })
  expect((await service.hydrate()).snapshot.phase).toBe('short_break')
})

it('does not persist an expired recovered focus until recordRecoveredPartial is called', async () => {
  const service = createTimerService({ repository: expiredFocusRepository(), now: () => '2026-08-08T10:00:00.000Z', makeId })
  expect((await service.hydrate()).recovery).toMatchObject({ outcome: 'partial', awardedStars: 0 })
  expect(history.sessions).toHaveLength(0)
  await service.recordRecoveredPartial()
  expect(history.sessions[0]).toMatchObject({ outcome: 'partial', awardedStars: 0 })
})
```

- [ ] **Step 2: Run the new service tests**

Run: `npm test -- tests/web/timer-service.test.ts`

Expected: FAIL because the browser service does not exist.

- [ ] **Step 3: Implement validated local storage and service commands**

```ts
export interface TimerService {
  hydrate(): Promise<HydrationResult>
  start(task: { id: string; title: string }, at?: string): Promise<TimerSnapshot>
  pause(): Promise<TimerSnapshot>
  resume(): Promise<TimerSnapshot>
  endEarly(): Promise<TimerSnapshot>
  recordRecoveredPartial(): Promise<TimerSnapshot>
  discardRecoveredSession(): Promise<TimerSnapshot>
  tick(): Promise<TimerSnapshot>
  subscribe(listener: (snapshot: TimerSnapshot) => void): () => void
}
```

Use `StateRepository` semantics adapted to `localStorage`: parse every read with `AppStateSchema` and `FocusHistorySchema`, use fresh state on invalid data, and persist state/history separately. Reuse `startFocus`, `advanceTimer`, `recoverTimer`, and `applySessionOutcome`; do not duplicate timer rules.

- [ ] **Step 4: Run tests and type checks**

Run: `npm test -- tests/web/timer-service.test.ts; npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit browser timer authority**

```powershell
git add src/web/storage.ts src/web/timer-service.ts tests/web/timer-service.test.ts
git commit -m "feat: add browser timer authority"
```

### Task 2: Build the study-desk state store and flow components

**Files:**
- Create: `src/web/store.ts`
- Create: `src/web/components/FocusCanvas.tsx`
- Create: `src/web/components/RecoveryNotice.tsx`
- Test: `tests/web/FocusCanvas.test.tsx`
- Test: `tests/web/RecoveryNotice.test.tsx`

**Interfaces:**
- `useStudyStore` exposes `{ hydrated, snapshot, recovery, rewards, hydrate, start, pause, resume, endEarly, resolveRecovery }`.
- `FocusCanvas` consumes `snapshot`, `onStart`, `onPause`, `onResume`, and `onEndEarly`; it does not own an interval or reward state.
- `RecoveryNotice` exposes only `onRecord` and `onDiscard`.

- [ ] **Step 1: Write failing focus and recovery tests**

```tsx
it('renders a returned focus snapshot without decrementing a renderer counter', async () => {
  render(<FocusCanvas snapshot={focusSnapshot} onStart={vi.fn()} onPause={vi.fn()} onResume={vi.fn()} onEndEarly={vi.fn()} />)
  expect(screen.getByText('25:00')).toBeTruthy()
  expect(screen.getByText('Outline report')).toBeTruthy()
})

it('offers only partial recording or discarding after recovery', async () => {
  render(<RecoveryNotice elapsedSeconds={1500} onRecord={onRecord} onDiscard={onDiscard} />)
  expect(screen.queryByRole('button', { name: /complete|star/i })).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Record elapsed time only' }))
  expect(onRecord).toHaveBeenCalledOnce()
})
```

- [ ] **Step 2: Run renderer tests**

Run: `npm test -- tests/web/FocusCanvas.test.tsx tests/web/RecoveryNotice.test.tsx`

Expected: FAIL because Web components do not exist.

- [ ] **Step 3: Implement store and components**

Create one module-scoped `TimerService`, hydrate it once, subscribe the store to snapshots, and refresh the display once per second only to redraw timestamp-derived remaining time. Never mutate the timer snapshot or settle a session in React.

Render exact recovery copy: `Your timer finished while the app was closed.` with `Record elapsed time only` and `Discard this session` controls.

- [ ] **Step 4: Run tests and type checks**

Run: `npm test -- tests/web/FocusCanvas.test.tsx tests/web/RecoveryNotice.test.tsx; npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit flow components**

```powershell
git add src/web/store.ts src/web/components/FocusCanvas.tsx src/web/components/RecoveryNotice.tsx tests/web/FocusCanvas.test.tsx tests/web/RecoveryNotice.test.tsx
git commit -m "feat: add browser focus flow"
```

### Task 3: Implement the three-region study desk and responsive layout

**Files:**
- Create: `src/web/components/StudyDesk.tsx`
- Create: `src/web/components/TodayRail.tsx`
- Create: `src/web/App.tsx`
- Create: `src/web/main.tsx`
- Create: `src/web/styles/study-desk.css`
- Test: `tests/web/StudyDesk.test.tsx`

**Interfaces:**
- `StudyDesk` composes `TodayRail`, `FocusCanvas`, and `StudyCorner`.
- `TodayRail` accepts no more than three active tasks and `onChooseTask(title)`.

- [ ] **Step 1: Write failing layout tests**

```tsx
it('keeps the task and timer in the focus canvas while rendering at most three Today tasks', () => {
  render(<StudyDesk tasks={fourTasks} snapshot={idleSnapshot} />)
  expect(screen.getByRole('region', { name: 'Today' }).querySelectorAll('li')).toHaveLength(3)
  expect(screen.getByRole('region', { name: 'Focus timer' })).toBeTruthy()
})
```

- [ ] **Step 2: Run the layout test**

Run: `npm test -- tests/web/StudyDesk.test.tsx`

Expected: FAIL because the study desk does not exist.

- [ ] **Step 3: Implement desktop and narrow screen structure**

Use CSS grid at desktop widths: `minmax(190px, .8fr) minmax(420px, 1.6fr) minmax(220px, .9fr)`. At `max-width: 800px`, render the focus canvas first and rails below as native details/summary sections. Use semantic regions named `Today`, `Focus timer`, and `Study corner`.

- [ ] **Step 4: Run layout tests and type checks**

Run: `npm test -- tests/web/StudyDesk.test.tsx; npm run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit study desk layout**

```powershell
git add src/web/App.tsx src/web/main.tsx src/web/components/StudyDesk.tsx src/web/components/TodayRail.tsx src/web/styles/study-desk.css tests/web/StudyDesk.test.tsx
git commit -m "feat: add digital study desk layout"
```

### Task 4: Create original lion state assets and Study Corner progression

**Files:**
- Create: `src/web/assets/lion/idle.png`
- Create: `src/web/assets/lion/focus.png`
- Create: `src/web/assets/lion/pause.png`
- Create: `src/web/assets/lion/break.png`
- Create: `src/web/assets/lion/celebrate.png`
- Create: `src/web/components/StudyCorner.tsx`
- Test: `tests/web/StudyCorner.test.tsx`

**Interfaces:**
- `StudyCorner({ phase, stars, weeklyReturnDays })` selects an original asset based on `phase` and exposes fixed unlock copy at 3, 8, 15, 30, and 60 stars.

- [ ] **Step 1: Write failing progression tests**

```tsx
it('shows the focus lion during focus and the lamp unlock at three stars', () => {
  render(<StudyCorner phase="focus" stars={3} weeklyReturnDays={2} />)
  expect(screen.getByAltText('Blue-maned lion studying')).toBeTruthy()
  expect(screen.getByText('Desk lamp unlocked')).toBeTruthy()
  expect(screen.getByText('You came back 2 days this week')).toBeTruthy()
})
```

- [ ] **Step 2: Run progression test**

Run: `npm test -- tests/web/StudyCorner.test.tsx`

Expected: FAIL because the new Study Corner does not exist.

- [ ] **Step 3: Generate and install the original asset set**

Generate five transparent PNG assets in one consistent soft editorial illustration style: small friendly lion, clear cobalt-blue mane, writing at a desk, no visible text, no logos, no copied mascot features. Verify each image before adding it under `src/web/assets/lion/`.

- [ ] **Step 4: Implement state mapping and deterministic unlock copy**

Use `focus`, `paused`, `short_break | long_break`, `idle`, and a one-shot `celebrate` prop. Show weekly return language only as `You came back N days this week`; never show a consecutive streak count.

- [ ] **Step 5: Run tests and type checks**

Run: `npm test -- tests/web/StudyCorner.test.tsx; npm run typecheck`

Expected: PASS.

- [ ] **Step 6: Commit study corner**

```powershell
git add src/web/assets/lion src/web/components/StudyCorner.tsx tests/web/StudyCorner.test.tsx
git commit -m "feat: add study corner lion states"
```

### Task 5: Add browser entry, visual QA, and migration documentation

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `README.md`
- Create: `docs/manual-qa-web-study-corner.md`
- Test: `tests/web/StudyDesk.test.tsx`

**Interfaces:**
- Produces `npm run dev:web`, `npm run build:web`, and `npm run test:web` scripts.

- [ ] **Step 1: Write failing script smoke assertion**

```ts
it('renders the browser root with the focus timer region', async () => {
  render(<WebApp />)
  expect(await screen.findByRole('region', { name: 'Focus timer' })).toBeTruthy()
})
```

- [ ] **Step 2: Run the browser root test**

Run: `npm test -- tests/web/StudyDesk.test.tsx`

Expected: FAIL until browser entry and app composition are wired.

- [ ] **Step 3: Configure browser scripts and entry point**

Add `dev:web`, `build:web`, and `test:web` scripts. Configure a Vite web entry that imports `src/web/main.tsx`; retain Electron files untouched so the wrapper can be revisited later.

- [ ] **Step 4: Add manual QA and run all web verification**

Document desktop and 800px-width checks: start, pause/resume, full completion, partial end, recovery, responsive rails, reduced motion, lion state, and local persistence reload.

Run: `npm run test:web; npm run typecheck; npm run build:web`

Expected: PASS.

- [ ] **Step 5: Browser visual fidelity review**

Open the Web App using the Browser plugin, capture desktop and narrow screenshots, and compare them with the accepted design concept. Inspect focus canvas prominence, Today cap, Study Corner posture, typography, white/mist-blue palette, control visibility, and narrow-layout order. Fix all visible mismatches before commit.

- [ ] **Step 6: Commit Web App migration**

```powershell
git add package.json vite.config.ts README.md docs/manual-qa-web-study-corner.md src/web tests/web
git commit -m "feat: add digital study corner web app"
```

## Plan self-review

- Timer safety and recovery: Task 1 and Task 2.
- Three-region, responsive study-desk UX: Task 3.
- Original companion states and restrained, deterministic progression: Task 4.
- Browser-first delivery and visual/manual QA: Task 5.
- Excluded accounts, cloud, social, gambling-like rewards, and leaderboard mechanics are not introduced by any task.
