# PomoPaw architecture

## Runtime boundaries

PomoPaw has one domain model shared by two presentation targets:

- **Web:** Vite serves the React app and browser-local persistence. It is the easiest way to preview the product and is deployed to Vercel.
- **Desktop:** Electron owns the application window, tray lifecycle, native notifications, and the typed preload bridge. The renderer reuses the focus UI and domain-facing store patterns.
- **Server:** the Mistral proxy accepts a small validated task payload and keeps the API key away from the browser. It is intentionally narrow: one first-step suggestion, no user history, and no account data.

The source of truth for session state is the study store. UI components render state and dispatch actions; they do not directly mutate timer counters or reward totals.

## Timer invariants

1. A focus session is configured for 25 minutes by default.
2. Short breaks are 5 minutes and long breaks are 15 minutes.
3. Elapsed seconds are computed from timestamps, so a suspended tab or sleeping computer cannot silently award extra progress.
4. A full focus transition is the only path that awards a focus star.
5. Ending early records the verified elapsed minutes but deliberately awards no star.
6. Reload/restart recovery surfaces the unfinished session and asks whether to record the partial time or discard it.

This separation keeps the competitive surface honest while still respecting partial effort.

## State and persistence

The store contains the active snapshot, focus history, stars, tasks, recovery state, and hydration status. Browser storage is used for the web build; Electron persistence is routed through the main/preload boundary. The domain records enough information to reconstruct a session after a refresh and to derive monthly calendar markers, streaks, and milestone progress.

There is no remote database in the current release. This is deliberate: a user can start, pause, recover, and complete a Pomodoro without an account or network connection. Friends uses mock/preview data and does not persist social profiles.

Tasks are intentionally capped at three active items. This is a product constraint, not a rendering limitation: a short rail reduces choice overload for the initial ADHD-focused flow.

## Pet state machine

`FloatingCompanion` maps domain state to a visual action:

| Domain condition | Pet action |
| --- | --- |
| Ready/idle | idle or occasional blink/stretch |
| Focus running | study |
| Short/long break | rest |
| Pointer drag | walk |
| Verified focus/task completion | celebrate |

The pet is a floating layer so it can stay visible without taking space away from the timer, calendar, or task rail. Artwork is imported from the curated `src/web/assets` set; the raw Stitch exports remain outside the public source surface unless their rights are cleared.

## Rewards and progress

The progress page derives:

- focus stars from verified full Pomodoros;
- daily minutes from recorded sessions, including partial sessions;
- flame markers from days containing a completed full focus block;
- study-corner unlock progress from the star count;
- milestone labels from completed sessions, return days, and stars.

Friends currently uses clearly labelled preview data for the leaderboard cards. The real implementation should replace this adapter with authenticated, opt-in data and a server-side aggregation boundary; the UI should not need to change its privacy copy or layout.

## AI request path

```text
Task input -> web client -> POST /api/ai/first-step
           -> validate method, size, and task length
           -> Mistral chat completion (server-side key)
           -> one short first action -> UI suggestion
```

Failures are non-blocking. A missing key, quota error, network error, or malformed response returns an unavailable result and leaves the timer fully usable.

## Deployment topology

The repository builds a static Vite output into `dist-web`. Vercel serves that output using `vercel.json`. The Electron application remains a separately packaged desktop artifact. A future production AI endpoint can be implemented as a Vercel Function or another server-side route; it must preserve the same validation and no-secret-in-client guarantees.

## Future scaling boundary

Accounts, cloud sync, friends, and leaderboards should be added behind explicit services rather than coupling network calls to the timer loop:

```text
client session -> event outbox -> authenticated API -> durable store
                                             \\-> weekly leaderboard projection
```

The durable store could be a Postgres-compatible service once the provider decision is made. The timer remains useful offline, and sync can reconcile recorded session events later. Do not make a live network connection a prerequisite for starting or completing a Pomodoro.
