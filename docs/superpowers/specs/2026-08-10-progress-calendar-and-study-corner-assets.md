# Progress Calendar and Study Corner Assets

## Purpose

Upgrade the Progress experience from a compact summary into a calm, trustworthy history of returning to focus. The page should let a user see their real focus days over time while the Study Corner visibly grows through deterministic, earned decorations.

This is not a productivity leaderboard, a shop, or a streak-pressure screen. It is an optional reflection space outside the active timer.

## User outcomes

- A user can see which calendar days they actually returned and focused.
- A missed day stays visually neutral; it is never framed as failure.
- A user can distinguish recorded effort from a fully completed Pomodoro.
- A user can see their Study Corner become more lived-in from completed focus stars.
- Every unlocked decoration looks coherent with the blue-maned lion and can be reused across the app.

## Calendar

### Scope and navigation

- Default to the current local calendar month.
- Support moving backward through prior months, down to the first locally recorded focus session. Future dates are disabled/quiet.
- The calendar's first available month is derived from persisted session history, not registration or account data.
- A compact summary near the calendar states the all-time return count: `You have come back on N days since <first month>.`

### Day semantics

- A day with one or more recorded focus minutes receives a calm filled day marker.
- A day with at least one fully completed 25-minute Pomodoro additionally receives a small flame marker.
- The flame means `a completed focus session happened on this date`; it is not a consecutive-streak counter and does not disappear as a punishment after a missed day.
- Hover/focus details show the date, recorded focus minutes, and number of completed Pomodoros.
- Empty historical dates, future dates, and days without sessions stay neutral. There is no overdue, broken-streak, or loss copy.

### Data integrity

- Recorded minutes include confirmed early endings and recovered partial sessions.
- Completed-Pomodoro count includes only verified timer completions. A partial session never creates a flame or a focus star.
- Calendar aggregation is local-first and derives from the existing `FocusHistory` session records.

## Progress page hierarchy

The Progress page is a calm reflection page, not a dense dashboard.

1. One welcoming heading and return summary.
2. The real month calendar as the dominant history component.
3. Three brief, text-forward totals: verified/recorded focus minutes, completed Pomodoros, and days returned.
4. One continuous Study Corner vignette with earned decoration layers.
5. Sparse milestone acknowledgements and a single `Start another 25 minutes` path back to Focus.
6. A future-oriented Friends link only; no ranking, notification, or comparison data appears in this page.

Avoid bento grids, charts, heatmaps, progress bars, inventory slots, stores, random reward UI, and repeated cards.

## Study Corner asset system

### Composition

Render one shared scene with layered, original transparent PNG assets:

- Base room/desk background.
- Blue-maned chibi lion state asset.
- Decoration layers: desk lamp, book stack, plant, window scene, and later finite environment additions.

The base scene and all decorations share an illustration bible: large head/small body character proportions, navy outlines, warm lion body, fluffy blue mane, quiet daylight lighting, and no text or logos embedded in imagery.

### Unlock rules

- One verified completed 25-minute focus session grants one focus star.
- Partial sessions retain real minutes but grant zero stars and unlock nothing.
- Decorations unlock in a fixed, explainable sequence; they are not individually purchasable or randomly awarded.
- The UI renders only the layers earned at the user's star count. Future layers are referenced with one quiet next-unlock sentence, not blank slots or placeholder icons.

Initial thresholds: lamp at 3 stars, books at 5, plant at 8, window scene at 15. The exact thresholds remain constants in one configuration module.

### Assets and production

- Generate an original, internally consistent transparent asset pack before composing the page.
- Use the same asset identifiers in Focus, Progress, completion feedback, and the optional future desktop overlay.
- Stitch is responsible for layout direction; it is not the source of truth for reusable decoration art because its per-screen images are not reliably composable or persistent.

## Screens and states

- **Progress, current month:** calendar, totals, current Study Corner layers, and a return-to-focus action.
- **Progress, earlier month:** same visual structure with prior month aggregation; no artificial streak loss.
- **Calendar day detail:** native tooltip/popover only, no modal needed.
- **Study Corner:** one scene at every star level, with only earned layers present.
- **Empty history:** explain that the first completed or partial focus session will appear here, then offer one calm start action.

## Future social boundary

Friends, accounts, cloud sync, and rankings remain out of scope for this implementation. The navigation affordance may stay as a non-interruptive future placeholder. Later, it must be opt-in and based on recorded minutes and completed Pomodoros, never on unverified claims or rewards for raw timer time.

## Acceptance criteria

- Calendar data reconstructs correctly from local session history across reloads and month navigation.
- A partial session shows its minutes on the calendar but never a flame or star.
- A verified completed focus appears with a flame and contributes exactly one star.
- A missed day has no negative state or copy.
- The Study Corner is a single coherent scene, never a set of overlapping bars, placeholders, or unlabelled reward slots.
- All unlocked objects are original, transparent, reusable assets in one consistent art style.
- Focus remains free of calendar, social comparison, and progression clutter.
