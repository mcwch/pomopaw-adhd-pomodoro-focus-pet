# ADHD Focus Companion — Design

## Product intent

Build a Windows-first desktop focus companion for people with ADHD and anyone who benefits from low-friction task initiation. The product helps a person decide what to do now, begin a focused 25-minute interval, and return over time through gentle companionship rather than pressure.

The companion is an original small lion with a warm cream/gold body and fluffy blue mane. It is a co-studying peer, not a coach, supervisor, or medical treatment.

## Product principles

- Reduce choices at the moment of starting; show one primary action at a time.
- Reward completed focus without invalidating partial effort.
- Never use overdue styling, guilt, loss of progress, or punitive streaks.
- Keep task data local by default and make AI explicitly opt-in.
- Use game elements to support real focus behavior, not to maximize time-on-app or encourage grinding.

## Release scope

### Included in v1

- Windows desktop application with a closable main window and system-tray presence.
- Standard Pomodoro cycle: 25-minute focus, 5-minute short break, and 15-minute long break after four completed focus sessions.
- A low-friction start prompt: choose a task or type what to work on now.
- A small Today board, inbox, lightweight task metadata, and completed-task state.
- Local task recommendation and optional AI task breakdown/recommendation.
- Four built-in looping ambient sounds: rain, cafe, forest, and white noise.
- A movable/minimizable focus overlay with optional companion.
- Lion state animations, focus stars, study-corner decoration unlocks, weekly return count, and milestone celebrations.
- Local persistence, restart recovery, and core behavioral tests.

### Explicitly deferred

- User accounts, cloud synchronization, custom audio imports, and mobile apps.
- Social graph, public leaderboards, seasons, friend quests, or shared goals.
- Multiple currencies, loot boxes, shops, timed events, random rewards, or punitive streak mechanics.
- Automatic access to calendar, files, browser activity, screen content, camera, keyboard, or microphone.
- Medical claims, diagnosis, or treatment recommendations.

## Core user journey

1. Opening the app presents the resting lion, a calm study corner, `What do you want to move forward right now?`, and one start action.
2. The person selects one of at most three Today tasks or types a new short task. A new task can also be captured to the Inbox.
3. If stuck, they choose `Help me choose one`. The app offers a local recommendation; if the user opted into AI, AI may offer up to three alternatives and a 25-minute first step.
4. Starting focus enters a 25-minute session. The overlay shows task name, remaining time, and ambient-sound controls. The lion quietly studies.
5. Completing the focus interval earns one focus star, updates the task's completed-Pomodoro count, and starts a five-minute break. The lion rests or stretches.
6. After the break, the user chooses to continue, mark the task complete, switch tasks, or stop. After four completed focus sessions, a 15-minute break occurs.
7. Stars progress the study corner automatically; only occasional milestones interrupt the flow.

## Pomodoro state model

States are `idle`, `focus`, `short_break`, `long_break`, and `paused` (which preserves the prior active state).

- A focus session is complete only when its 25 minutes elapse. Completion grants one focus star and increments completed Pomodoros.
- Ending a focus session early opens a neutral confirmation, for example: `You focused for 18 minutes. Record and end?`.
- Confirmed early endings store their actual elapsed focus minutes but do not count as a completed Pomodoro, earn stars, advance the four-session cycle, or satisfy milestone requirements.
- Pauses may be resumed manually. The app does not attempt to verify attention through surveillance or activity tracking.
- A session's visible elapsed minutes are a personal record of time; a completion is a separate, higher-integrity achievement record.
- On app restart or wake, the app resolves the current timer from timestamps and tells the user whether it expired while unavailable. It must never silently award a completion.

## Task model and selection support

Tasks contain a title and optional deadline, estimated number of Pomodoros, and energy fit (`low`, `medium`, or `high`). They also retain total focused minutes, completed Pomodoros, status, and creation/update timestamps.

- The Today board displays no more than three active tasks.
- New capture defaults to Inbox. The user can move tasks to Today; the product does not auto-fill Today with an overwhelming backlog.
- Local recommendation favors approaching deadlines, tasks not yet advanced today, tasks with an approachable first one-or-two-Pomodoro start, and a matching energy fit.
- If a user declines a task twice or says it feels unmanageable, show a non-judgmental rescue choice: shrink the first step, choose a lower-energy task, or return it to Inbox. None incurs a penalty.
- Completed tasks remain visible as a quiet success for the day and then move to history.

## Optional AI

AI is a voluntary assistant, not the primary workflow.

- The user must enable `Allow AI to analyze task text` before task text is sent to a model.
- AI is invoked only by an explicit user action. It can recommend up to three candidate tasks, explain the recommendation briefly, and express a selected task as one concrete first step that fits a 25-minute focus interval.
- The AI never changes tasks, deadlines, settings, or timer state itself. The user can dismiss or replace each suggestion.
- AI receives only task text and user-provided metadata for that action. It has no implicit access to local files, the screen, browser, calendar, or activity data.
- If network access, configuration, or the model fails, `Help me choose one` falls back to local recommendation with an unobtrusive explanation.

## Companion and rewards

The lion has restrained state-specific animations:

- Idle: relaxes in the study corner.
- Focus: reads, writes, or studies quietly.
- Short break: stretches, drinks water, or rests.
- Long break and task completion: a slightly more expressive celebration.

Animation can be reduced or hidden. The focus overlay can show the lion, show only the timer, or be hidden while timing continues.

Rewards use one simple currency, focus stars:

- One star for each fully completed focus interval.
- A small completion bonus for a user-marked task completion.
- No stars for early endings; elapsed minutes remain credited to the personal record.
- Stars unlock a finite, calm set of study-corner decorations such as a lamp, books, plant, and window scene. There are no random drops, purchases, time limits, or loss mechanics.
- Milestones are rare: first, seventh, and thirtieth completed focus intervals, plus first completed task.
- Habit feedback is a forgiving weekly `days you came back` count. It does not reset, decay the room, or shame people after a missed day.

Future social mechanics, if validated, should be opt-in collaborative weekly goals rather than global rankings. They can display both completed Pomodoros and accumulated focus minutes, but must not attach material rewards to raw minutes because desktop timers cannot prove attention.

## Desktop behavior and audio

- Closing the main window sends the app to the system tray; an explicit Quit command stops it.
- During focus, a small draggable overlay can be placed at a screen edge. It supports companion, timer-only, and hidden modes.
- The selected ambient track loops during focus at user-controlled volume. It fades out on session end or break transition.
- Sound failures do not stop timing. The app reports a single dismissible error and retains the user's preference.
- The app remembers overlay mode, location, chosen sound, volume, and reduced-animation preference locally.

## Data, privacy, and boundaries

All v1 data is stored locally without sign-in: tasks, task events, completed/partial sessions, selected sound, preferences, rewards, and study-corner unlocks. A privacy settings page explains the AI consent boundary and allows it to be withdrawn at any time.

The app must describe itself as a focus and planning aid, not as medical care or an ADHD diagnostic/treatment product.

## Reliability and test strategy

The implementation must have automated tests for:

- Exact focus/break transitions and the four-completion long-break cadence.
- Early ending behavior: elapsed minutes persist, no completion/reward/cycle progress is granted.
- Pause/resume and restart/wake recovery, including no silent completion awards.
- Task transitions, Today capacity, Inbox movement, and rescue actions.
- Deterministic local task recommendation ordering.
- AI disabled behavior, approved request construction, and fallback on errors.
- Reward thresholds, non-punitive weekly return counts, and milestone triggers.
- Audio error isolation and preference persistence.

Manual acceptance checks cover tray behavior, overlay drag/hide modes, timer continuity while the main window is closed, animation reduction, and the four supplied sound loops.

## Success criteria

The first successful use requires no account and lets a user type a task and begin a session in a few seconds. At the end of a session, the user understands whether it was a completed Pomodoro or a partial recorded effort. A person who does not know what to start can get a concrete next step without being forced into AI, a complex task system, or a competitive game loop.
