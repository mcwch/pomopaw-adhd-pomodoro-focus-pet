# Focus AI, sound off, and dark mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an inline local-first AI first-step helper, an explicit sound-off option, and a persisted dark theme to the Stitch-aligned web app.

**Architecture:** Keep timer/reward truth in the existing web store and keep AI outside the timer domain. TodayRail owns the inline helper UI, a small adapter selects Electron Ollama, browser Ollama, or a clearly labelled deterministic fallback, and StudyDesk passes an approved suggestion into FocusCanvas as a prefill only. Sound lifecycle stays in `ambient-sound.ts`; a small theme hook owns the root `data-theme` attribute and localStorage preference.

**Tech Stack:** React 19, TypeScript, Zustand, Vitest, Testing Library, Vite, Web Audio API, existing Electron preload Ollama API.

## Global Constraints

- The Pomodoro timer remains the primary action; AI never starts a session or changes rewards automatically.
- AI receives only the user-entered task text and is explicitly user-triggered.
- The existing Stitch Focus layout, blue-maned lion, copy style, and three-column desktop structure remain the visual source of truth.
- `None` stops ambient audio immediately and is exposed as a selected sound state.
- Dark mode changes theme tokens without changing layout or content and persists in `localStorage`.
- Friends, accounts, cloud sync, and rankings remain unavailable placeholders.

---

### Task 1: Local AI provider adapter

**Files:**
- Create: `src/web/local-ai.ts`
- Create: `tests/web/local-ai.test.ts`
- Modify: `src/preload/index.d.ts` only if the web type boundary needs an optional `focusApp` declaration.

**Interfaces:**
- Produces `type LocalAiResult = { source: 'ollama' | 'fallback'; suggestion: string }` and `askForFirstStep(task: string): Promise<LocalAiResult>`.
- Uses `window.focusApp.ollamaFirstStep` when available, then browser fetch to `http://127.0.0.1:11434/api/generate`, then a clearly labelled deterministic fallback.

- [ ] **Step 1: Write failing provider tests**

```ts
it('uses the Electron Ollama bridge when present', async () => {
  const result = await askForFirstStep('write my report introduction', { bridge: { ollamaFirstStep: async () => ({ suggestion: 'Open the report and write one rough heading.' }) } })
  expect(result).toEqual({ source: 'ollama', suggestion: 'Open the report and write one rough heading.' })
})

it('labels the deterministic result as fallback when providers fail', async () => {
  const result = await askForFirstStep('clean my desk', { fetchLike: async () => { throw new Error('offline') } })
  expect(result.source).toBe('fallback')
  expect(result.suggestion).toMatch(/clean|desk/i)
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run tests/web/local-ai.test.ts`
Expected: FAIL because `src/web/local-ai.ts` does not exist.

- [ ] **Step 3: Implement provider selection and safe fallback**

Validate non-empty task text, strip `<think>…</think>` blocks from model output, cap the displayed suggestion to one short sentence, and never expose raw fetch errors to the UI. The fallback must return a sentence such as `Open the task and do the smallest visible first action.` with `source: 'fallback'`.

- [ ] **Step 4: Run the focused test and typecheck**

Run: `npx vitest run tests/web/local-ai.test.ts && npm run typecheck:web`
Expected: PASS and exit code 0.

- [ ] **Step 5: Commit the provider boundary**

```bash
git add src/web/local-ai.ts tests/web/local-ai.test.ts src/preload/index.d.ts
git commit -m "feat: add local first-step provider boundary"
```

### Task 2: Inline AI helper and Focus prefill

**Files:**
- Create: `src/web/components/LocalAiFirstStep.tsx`
- Create: `tests/web/LocalAiFirstStep.test.tsx`
- Modify: `src/web/components/TodayRail.tsx`
- Modify: `src/web/components/StudyDesk.tsx`
- Modify: `src/web/components/FocusCanvas.tsx`

**Interfaces:**
- `LocalAiFirstStep` accepts `{ initialTask?: string; onUseStep(step: string): void }`.
- `TodayRail` accepts `onUseStep(step: string)` and renders the collapsed Stitch helper action.
- `FocusCanvas` accepts `prefillTitle?: string` and synchronizes it into its idle task input without starting the timer.

- [ ] **Step 1: Write failing component tests**

```tsx
it('shows the helper inline and applies a suggestion without starting the timer', async () => {
  render(<LocalAiFirstStep onUseStep={onUseStep} initialTask="outline report" />)
  await userEvent.click(screen.getByRole('button', { name: /help me shrink/i }))
  await userEvent.click(screen.getByRole('button', { name: /ask local ai/i }))
  expect(await screen.findByText(/Try this/i)).toBeVisible()
  await userEvent.click(screen.getByRole('button', { name: /use this step/i }))
  expect(onUseStep).toHaveBeenCalledWith(expect.any(String))
  expect(screen.queryByRole('button', { name: /pause timer/i })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run tests/web/LocalAiFirstStep.test.tsx`
Expected: FAIL because the helper component and callback wiring do not exist.

- [ ] **Step 3: Implement the inline helper**

Use a compact expandable section below the task input. Keep loading and result text in `aria-live="polite"`, show `Local model` only for `source: 'ollama'`, and show `Optional local fallback` for deterministic output. `Use this step` calls the parent callback only.

- [ ] **Step 4: Wire the prefill through StudyDesk**

Store `prefillTitle` in StudyDesk, pass it to FocusCanvas, and clear it after FocusCanvas consumes it. Keep existing Today task add/toggle/choose behavior unchanged.

- [ ] **Step 5: Run the focused test and web suite**

Run: `npx vitest run tests/web/LocalAiFirstStep.test.tsx tests/web/StudyDesk.test.tsx`
Expected: PASS with no timer state transitions caused by the AI helper.

- [ ] **Step 6: Commit the AI UI**

```bash
git add src/web/components/LocalAiFirstStep.tsx src/web/components/TodayRail.tsx src/web/components/StudyDesk.tsx src/web/components/FocusCanvas.tsx tests/web/LocalAiFirstStep.test.tsx
git commit -m "feat: add inline local ai first-step helper"
```

### Task 3: Sound off option

**Files:**
- Modify: `src/web/components/SoundControls.tsx`
- Modify: `src/web/components/FocusCanvas.tsx`
- Modify: `src/web/ambient-sound.ts` only if an explicit stop guard is needed.
- Modify: `tests/web/SoundControls.test.tsx`

**Interfaces:**
- Extend `SoundId` with `'none'`.
- `SoundControls` renders a `Sound off` option with `aria-pressed` and calls `onChange('none')`.

- [ ] **Step 1: Add failing sound-off assertions**

```tsx
it('exposes Sound off and marks it selected', async () => {
  render(<SoundControls value="none" onChange={vi.fn()} />)
  expect(screen.getByRole('button', { name: 'Sound off' })).toHaveAttribute('aria-pressed', 'true')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run tests/web/SoundControls.test.tsx`
Expected: FAIL because `none` is not a valid sound option.

- [ ] **Step 3: Implement the option and lifecycle**

Add `None` to the controls. In FocusCanvas, selecting it calls `stopAmbientSound()` immediately; begin/resume only call `startAmbientSound` for audible choices. Preserve current pause/end cleanup.

- [ ] **Step 4: Run sound tests and typecheck**

Run: `npx vitest run tests/web/SoundControls.test.tsx && npm run typecheck:web`
Expected: PASS.

- [ ] **Step 5: Commit sound-off behavior**

```bash
git add src/web/components/SoundControls.tsx src/web/components/FocusCanvas.tsx src/web/ambient-sound.ts tests/web/SoundControls.test.tsx
git commit -m "feat: add explicit sound off option"
```

### Task 4: Persisted dark mode

**Files:**
- Create: `src/web/theme.ts`
- Create: `src/web/components/ThemeToggle.tsx`
- Create: `tests/web/theme.test.ts`
- Modify: `src/web/App.tsx`
- Modify: `src/web/styles/study-desk.css`

**Interfaces:**
- `Theme = 'light' | 'dark'`.
- `readInitialTheme(): Theme` checks saved preference, then `prefers-color-scheme`, then light.
- `ThemeToggle` accepts `{ theme: Theme; onToggle(): void }` and exposes the correct switch label.

- [ ] **Step 1: Write failing theme tests**

```ts
it('restores a saved dark theme', () => {
  localStorage.setItem('focus-companion-theme', 'dark')
  expect(readInitialTheme()).toBe('dark')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `npx vitest run tests/web/theme.test.ts`
Expected: FAIL because the theme module does not exist.

- [ ] **Step 3: Implement root theme state and toggle**

Set `document.documentElement.dataset.theme` on initialization and toggle, save to `localStorage`, and render the toggle in the existing top-right settings slot. Do not modify timer or reward state.

- [ ] **Step 4: Add dark tokens to the Stitch CSS**

Define `[data-theme='dark']` variables and targeted overrides for nav, Today rail, Focus canvas, timer ring, sound controls, calendar, Study Corner, buttons, borders, and focus rings. Keep teal/gold accents readable and retain the existing reduced-motion rule.

- [ ] **Step 5: Run theme tests, typecheck, and build**

Run: `npx vitest run tests/web/theme.test.ts && npm run typecheck:web && npm run build:web`
Expected: PASS and a successful Vite build.

- [ ] **Step 6: Commit dark mode**

```bash
git add src/web/theme.ts src/web/components/ThemeToggle.tsx tests/web/theme.test.ts src/web/App.tsx src/web/styles/study-desk.css
git commit -m "feat: add persisted dark mode"
```

### Task 5: Browser smoke verification and final integration

**Files:**
- Create: `tests/web/focus-enhancements-smoke.md`
- Modify: `docs/superpowers/specs/2026-08-10-focus-ai-audio-theme-design.md` only if implementation behavior differs from the approved spec.

- [ ] **Step 1: Run all web tests, typecheck, and build**

Run: `npm run test:web; npm run typecheck:web; npm run build:web`
Expected: all web tests pass, typecheck exits 0, and Vite produces `dist-web`.

- [ ] **Step 2: Run browser smoke checks against `http://127.0.0.1:4175`**

Verify: helper opens inline; a local/fallback result appears; Use this step fills the center field without starting; None is selected and audio stops; theme toggle changes `data-theme` and survives reload; Start/Pause/Resume/End early still work; Progress navigation still opens the calendar; no console errors occur.

- [ ] **Step 3: Inspect the rendered light and dark screenshots**

Confirm that the AI card remains subordinate to the timer, the dark theme has readable text and borders, and the Stitch lion remains visible in both themes.

- [ ] **Step 4: Record the smoke procedure**

Write the exact browser checks and expected labels in `tests/web/focus-enhancements-smoke.md` for repeatable manual QA.

- [ ] **Step 5: Commit verification notes**

```bash
git add tests/web/focus-enhancements-smoke.md docs/superpowers/specs/2026-08-10-focus-ai-audio-theme-design.md
git commit -m "test: verify focus enhancement flows"
```
