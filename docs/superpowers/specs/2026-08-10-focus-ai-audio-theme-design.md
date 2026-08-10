# Focus AI helper, sound off state, and dark mode

## Goal

Extend the Stitch-aligned web Focus screen without adding pressure or visual clutter:

1. Give users an optional, local-first way to turn an unclear task into one concrete first step.
2. Make ambient sound explicitly reversible with a `None` option.
3. Add a calm, persistent dark theme that applies to navigation, Focus, Progress, and companion panels.

The Pomodoro timer remains the primary action. AI never starts a session, edits a task, or awards a reward without an explicit user click.

## Approved interaction

### AI first-step helper

The left Today rail keeps the Stitch copy `Help me shrink this into a first step.` as a quiet secondary button below the task input. Clicking it expands an inline card in the rail rather than opening a modal.

The card contains:

- a compact task field, prefilled from the current draft or selected Today task when available;
- `Ask local AI` as the explicit submit action;
- a loading state (`Thinking locally…`);
- a result card labelled `Try this`;
- `Use this step`, which only prefills the main Focus task field;
- a quiet status message if Ollama/Qwen is unavailable.

The user still presses `Start 25 minutes` separately. The helper sends only the task text to the local model. No telemetry, device context, timer state, or task history is sent.

### Local model boundary and fallback

The existing Electron preload API (`window.focusApp.ollamaFirstStep`) remains the preferred provider and calls the existing Ollama `qwen3:4b` adapter. The web build uses the same local Ollama endpoint when the browser permits it, and otherwise shows a non-blocking unavailable state with a deterministic suggestion based on the task text. The fallback must never pretend it came from the model.

### Sound

Extend the current sound choices with `None`. Selecting `None` immediately calls `stopAmbientSound()` and marks the option active. Starting, resuming, or changing to an audible option starts the generated ambient loop; pausing or ending stops it. `None` is persisted only for the current web session for now, matching the existing sound state scope.

### Dark mode

Add a compact theme toggle in the existing top-right settings position. It toggles `light`/`dark`, persists the choice in `localStorage`, and applies a `data-theme` attribute to the document root before the first paint when possible. Dark mode changes surfaces, borders, text, focus rings, timer ring, controls, calendar cells, and study-corner panels while preserving the existing teal/gold accent contrast. It does not change layout or content. The default follows the saved choice, then the OS preference.

## Component and data boundaries

- `TodayRail` owns only the inline helper open/close state and draft task text.
- A small `local-ai-first-step` adapter owns provider selection, loading, errors, and the `suggestion` result. It exposes `ask(task)` and returns `{ source: 'ollama' | 'fallback', suggestion }`.
- `StudyDesk` owns the `prefillTitle` hand-off from `Use this step` to `FocusCanvas`.
- `FocusCanvas` remains the timer display and receives the prefill as a prop; it does not call AI.
- `SoundControls` adds the `none` option but keeps audio lifecycle in `ambient-sound.ts`.
- Theme state is isolated in a `useTheme` hook or equivalent small module; timer and reward stores remain unchanged.

## Error and accessibility behavior

- AI failures are recoverable inline messages; the task input and timer remain usable.
- The AI card uses a labelled input, `aria-live="polite"` for loading/result text, and keyboard-accessible buttons.
- Sound buttons expose their selected state with `aria-pressed`; `None` has the accessible label `Sound off`.
- Theme toggle exposes `aria-label="Switch to dark mode"` or `aria-label="Switch to light mode"`.
- Reduced-motion preferences continue to disable companion/theme transitions.

## Verification

Add component tests for:

- opening the AI card, loading, displaying a local result, applying it without starting the timer, and showing fallback/unavailable state;
- selecting `None` stopping audio and exposing the selected state;
- toggling and restoring dark mode.

Run the existing web test suite, web typecheck, production build, and a browser smoke test covering AI entry, sound off, theme toggle, Focus start/pause/end, and Progress navigation.
