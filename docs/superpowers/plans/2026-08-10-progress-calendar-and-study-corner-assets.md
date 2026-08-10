# Progress Calendar and Study Corner Assets Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Build a local-first Progress page with a real focus-history calendar and a coherent layered Study Corner driven by verified Pomodoro work.

**Architecture:** Pure aggregation in src/web/progress-history.ts derives calendar cells and totals from FocusHistory.sessions. React components render the calendar and a reusable transparent-asset scene; App.tsx adds a lean Focus/Progress/Friends route state with no social backend.

**Tech Stack:** React 19, TypeScript, Zustand, Vitest, React Testing Library, browser localStorage, CSS, Stitch layout reference, ImageGen original transparent PNG assets.

## Global Constraints

- Calendar history begins at the first local session; it never requires registration or an account.
- Recorded minutes include completed and confirmed partial sessions. Only outcome completed creates a flame and focus star.
- A flame marks a completed Pomodoro on that date, not a breakable streak. Empty days receive no negative styling or copy.
- Unlocks are deterministic: lamp at 3 stars, books at 5, plant at 8, window at 15.
- Assets are original, transparent, and visually consistent with the existing blue-maned large-head/tiny-body lion.
- Focus must not display calendar, ranking, or progression clutter.
- Friends stays a quiet future placeholder; do not implement accounts, cloud sync, or leaderboards.

---

## File structure

~~~
src/web/
  progress-history.ts
  progress-unlocks.ts
  components/FocusCalendar.tsx
  components/StudyCornerScene.tsx
  components/ProgressPage.tsx
  assets/study-corner/{room,lamp,books,plant,window}.png
tests/web/
  progress-history.test.ts
  FocusCalendar.test.tsx
  StudyCornerScene.test.tsx
  ProgressPage.test.tsx
~~~

### Task 1: Derive calendar data from session history

**Files:**
- Create: src/web/progress-history.ts
- Create: tests/web/progress-history.test.ts

**Interfaces:**
- Produces CalendarDay, CalendarMonth, buildCalendarMonth(sessions, year, month, now), firstHistoryMonth(sessions), and shiftMonth(month, offset).
- CalendarDay is { dateKey; day; isFuture; recordedMinutes; completedPomodoros; hasFlame }.

- [ ] **Step 1: Write the failing tests**

~~~ts
it('keeps partial minutes but creates a flame only for completed focus', () => {
  const month = buildCalendarMonth([
    session('partial', '2026-08-03T09:00:00.000Z', 18 * 60),
    session('completed', '2026-08-04T09:00:00.000Z', 25 * 60),
  ], 2026, 7, new Date('2026-08-31T12:00:00.000Z'))

  expect(day(month, '2026-08-03')).toMatchObject({ recordedMinutes: 18, completedPomodoros: 0, hasFlame: false })
  expect(day(month, '2026-08-04')).toMatchObject({ recordedMinutes: 25, completedPomodoros: 1, hasFlame: true })
})

it('uses the first non-discarded session as the earliest month', () => {
  expect(firstHistoryMonth([session('partial', '2026-06-15T09:00:00.000Z', 60)])).toEqual({ year: 2026, month: 5 })
})
~~~

- [ ] **Step 2: Run the failing test**

Run: npm run test:web -- tests/web/progress-history.test.ts

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement pure aggregation**

~~~ts
export function buildCalendarMonth(sessions: SessionRecord[], year: number, month: number, now: Date): CalendarMonth {
  const byDate = new Map<string, SessionRecord[]>()
  for (const session of sessions) {
    if (session.outcome === 'discarded') continue
    const key = localDateKey(session.startedAt)
    byDate.set(key, [...(byDate.get(key) ?? []), session])
  }
  const days = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) =>
    makeDay(year, month, index + 1, byDate, now))
  return { year, month, days }
}
~~~

makeDay sums Math.floor(elapsedSeconds / 60), counts only completed sessions, and sets hasFlame from that count. firstHistoryMonth returns null for no usable session.

- [ ] **Step 4: Verify**

Run: npm run test:web -- tests/web/progress-history.test.ts; npm run typecheck:web

Expected: PASS.

- [ ] **Step 5: Commit**

~~~powershell
git add src/web/progress-history.ts tests/web/progress-history.test.ts
git commit -m "feat: derive progress calendar from focus history"
~~~

### Task 2: Render an accessible real-month calendar

**Files:**
- Create: src/web/components/FocusCalendar.tsx
- Create: tests/web/FocusCalendar.test.tsx

**Interfaces:**
- FocusCalendar({ month, earliestMonth, onPreviousMonth, onNextMonth }: Readonly<FocusCalendarProps>).
- The component receives a CalendarMonth; it does not read storage or mutate history.

- [ ] **Step 1: Write the failing component tests**

~~~tsx
it('labels a completed day with minutes and a completed-focus flame', () => {
  render(<FocusCalendar month={august} earliestMonth={{ year: 2026, month: 5 }} onPreviousMonth={vi.fn()} onNextMonth={vi.fn()} />)
  const completed = screen.getByRole('button', { name: /august 4.*25 recorded minutes.*1 completed pomodoro/i })
  expect(completed.querySelector('[aria-label="Completed focus"]')).toBeTruthy()
  expect(screen.getByRole('button', { name: /august 3.*18 recorded minutes/i }).querySelector('[aria-label="Completed focus"]')).toBeNull()
})

it('disables previous month in the first locally recorded month', () => {
  render(<FocusCalendar month={june} earliestMonth={{ year: 2026, month: 5 }} onPreviousMonth={vi.fn()} onNextMonth={vi.fn()} />)
  expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled()
})
~~~

- [ ] **Step 2: Run the failing test**

Run: npm run test:web -- tests/web/FocusCalendar.test.tsx

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement grid and semantics**

~~~tsx
export interface FocusCalendarProps {
  readonly month: CalendarMonth
  readonly earliestMonth: YearMonth | null
  readonly onPreviousMonth: () => void
  readonly onNextMonth: () => void
}
~~~

Render Monday–Sunday columns, leading blank cells, one date button per day, and native title/ARIA details. Render a decorative child named Completed focus only when hasFlame is true. Future dates are disabled; historical empty dates remain neutral.

- [ ] **Step 4: Verify and commit**

Run: npm run test:web -- tests/web/FocusCalendar.test.tsx; npm run typecheck:web

Expected: PASS.

~~~powershell
git add src/web/components/FocusCalendar.tsx tests/web/FocusCalendar.test.tsx
git commit -m "feat: add focus history calendar"
~~~

### Task 3: Build deterministic reusable Study Corner layers

**Files:**
- Create: src/web/progress-unlocks.ts
- Create: src/web/components/StudyCornerScene.tsx
- Create: src/web/assets/study-corner/room.png, lamp.png, books.png, plant.png, window.png
- Create: tests/web/StudyCornerScene.test.tsx

**Interfaces:**
- unlockedLayers(stars: number): StudyCornerLayer[] returns a fixed sequence.
- StudyCornerScene({ stars, phase }: Readonly<StudyCornerSceneProps>) composes existing lion state art plus earned scene layers.

- [ ] **Step 1: Write the failing unlock test**

~~~tsx
it('renders only the deterministic layers earned at the current star count', () => {
  render(<StudyCornerScene stars={5} phase="idle" />)
  expect(screen.getByAltText('Unlocked desk lamp')).toBeTruthy()
  expect(screen.getByAltText('Unlocked books')).toBeTruthy()
  expect(screen.queryByAltText('Unlocked plant')).toBeNull()
  expect(screen.getByText('Next: plant at 8 stars')).toBeTruthy()
})
~~~

- [ ] **Step 2: Run the failing test**

Run: npm run test:web -- tests/web/StudyCornerScene.test.tsx

Expected: FAIL because the component and configuration do not exist.

- [ ] **Step 3: Generate and inspect original asset pack**

Use one consistent prompt for each transparent PNG: original cozy daylight study-corner decoration for a chibi lion companion app; clean navy outline, soft editorial cel-shading, no text, no logos, isolated transparent background, scale matches a warm-gold lion with a fluffy cobalt-blue mane. Generate room/desk background, lit lamp, three-book stack, leafy plant, and window scene as separate assets. Inspect every output before adding it.

- [ ] **Step 4: Implement layer selection and composition**

~~~ts
export const CORNER_UNLOCKS = [
  { id: 'lamp', stars: 3, nextCopy: 'Next: books at 5 stars' },
  { id: 'books', stars: 5, nextCopy: 'Next: plant at 8 stars' },
  { id: 'plant', stars: 8, nextCopy: 'Next: window scene at 15 stars' },
  { id: 'window', stars: 15, nextCopy: 'Your study corner is glowing.' },
] as const
~~~

Stack all earned images in one .study-corner-scene coordinate system. Never render unearned empty slots, object labels, progress bars, or placeholder icons.

- [ ] **Step 5: Verify and commit**

Run: npm run test:web -- tests/web/StudyCornerScene.test.tsx; npm run typecheck:web

Expected: PASS.

~~~powershell
git add src/web/progress-unlocks.ts src/web/components/StudyCornerScene.tsx src/web/assets/study-corner tests/web/StudyCornerScene.test.tsx
git commit -m "feat: add layered study corner unlocks"
~~~

### Task 4: Compose and route the Progress reflection page

**Files:**
- Create: src/web/components/ProgressPage.tsx
- Modify: src/web/store.ts
- Modify: src/web/App.tsx
- Modify: src/web/styles/study-desk.css
- Create: tests/web/ProgressPage.test.tsx

**Interfaces:**
- Store adds history: FocusHistory | null and refreshHistory(): Promise<void>.
- ProgressPage({ history, stars, onStartFocus }: Readonly<ProgressPageProps>) owns displayed-month state.
- Web app owns view: focus | progress | friends; Friends is an unavailable placeholder only.

- [ ] **Step 1: Write the failing Progress test**

~~~tsx
it('shows local calendar history and returns to Focus without comparison UI', async () => {
  const start = vi.fn()
  render(<ProgressPage history={historyWithSessions} stars={5} onStartFocus={start} />)
  expect(screen.getByRole('heading', { name: 'You came back.' })).toBeTruthy()
  expect(screen.getByRole('region', { name: 'Focus history calendar' })).toBeTruthy()
  expect(screen.getByText('You have come back on 2 days since June 2026.')).toBeTruthy()
  expect(screen.queryByText(/leaderboard|rank|coins/i)).toBeNull()
  await userEvent.click(screen.getByRole('button', { name: 'Start another 25 minutes' }))
  expect(start).toHaveBeenCalledOnce()
})
~~~

- [ ] **Step 2: Run the failing test**

Run: npm run test:web -- tests/web/ProgressPage.test.tsx

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement data refresh, page, and route state**

Update store hydration and every session-settlement path to reload history. Use a compact Focus / Progress / Friends header; Friends says Coming later — friends will always be opt-in. The Progress page composes the real calendar, text-forward totals, and StudyCornerScene, then returns to Focus through its only primary action.

- [ ] **Step 4: Apply Stitch as layout reference**

Use the shared Stitch design system only for compact header, open Progress canvas, calendar-first hierarchy, and modest typography. Do not copy its placeholder illustrations, bars, card-heavy markup, or disconnected objects.

- [ ] **Step 5: Verify and commit**

Run: npm run test:web; npm run typecheck; npm run build:web

Expected: PASS.

~~~powershell
git add src/web/store.ts src/web/App.tsx src/web/components/ProgressPage.tsx src/web/styles/study-desk.css tests/web/ProgressPage.test.tsx
git commit -m "feat: add local progress calendar"
~~~

### Task 5: Document and visually validate the finished flow

**Files:**
- Create: docs/manual-qa-progress-calendar.md

- [ ] **Step 1: Document exact manual checks**

Include: a partial 18-minute record shows minutes but no flame/star; a full record shows a flame plus one star; reload preserves history; the first historical month disables Previous month; thresholds 3/5/8/15 reveal only defined asset layers; Focus has no calendar or Friends comparison content.

- [ ] **Step 2: Request approval for browser visual checks**

Ask the user before starting the local development server or automated browser visual tests.

- [ ] **Step 3: After approval, verify the live UI**

Run: npm run dev:web -- --host 127.0.0.1

Capture desktop and narrow screenshots. Inspect real month layout, flame semantics, one coherent scene, no white image blocks, bars, placeholders, rankings, or punitive streak copy.

- [ ] **Step 4: Commit QA documentation**

~~~powershell
git add docs/manual-qa-progress-calendar.md
git commit -m "docs: add progress calendar QA"
~~~

## Plan self-review

- Calendar correctness, partial/completed integrity, first month, and navigation: Tasks 1–2.
- Flame without punitive streak mechanics: Tasks 1–2.
- Original reusable layers and deterministic unlocks: Task 3.
- Progress route, Friends boundary, and Focus isolation: Task 4.
- Visual/manual acceptance checks: Task 5.

