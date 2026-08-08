# Digital Study Corner Web UI/UX Design

## Goal

Evolve Focus Companion into a browser-first focus app that feels like a calm digital study corner. The product helps a user begin one manageable task, complete a reliable Pomodoro, and return without pressure. Game elements remain a gentle record of real work, not the main activity.

## Product principles

- The active timer is the visual and functional center of the product.
- The blue-maned lion is a quiet study companion, never a large decorative mascot competing with the task.
- A user needs one obvious next action at every state.
- No breakable streaks, loss language, loot boxes, or distracting reward loops.
- The Web App remains local-first. The existing timer authority, session rules, and local storage semantics are preserved during migration.

## Visual direction

The app resembles a daylight study desk rather than a dark dashboard.

- **Background:** paper white and mist blue, with a faint cool window-light texture; avoid generic gradients and excessive cards.
- **Text:** deep navy for readable, calm hierarchy; muted slate for supporting text.
- **Focus accent:** one muted mint green for the active timer and primary focus action.
- **Reward accent:** restrained warm gold, visible only after verified completion or an unlock.
- **Surfaces:** a single open canvas with thin desk-like dividers; no nested rounded panels.
- **Typography:** warm, slightly characterful display type for the current task and time; clear sans-serif UI type for controls and lists.
- **Motion:** only stateful motion: timer ring settling in, lion changing posture, a short star/unlock acknowledgement. All animation respects reduced-motion preferences.

## Information architecture

Desktop is a three-region study desk.

```text
Today rail                 Focus canvas                     Study corner
----------                 ------------                     ------------
Up to 3 active tasks       Current task                     Blue-maned lion
Small-task rescue          Timestamp-driven timer           Unlocked objects
Add / choose task          Sound and pause controls         Weekly return count
                            End-early confirmation           Gentle progress
```

On narrow screens, the focus canvas remains first; Today and Study Corner become expandable rails below it. The timer and active task are never hidden behind tabs.

## Core flows

### 1. Arrive and choose a small task

The idle state asks: **“What would you like to move forward right now?”** A user can type a task, select from Today, or choose **“Help me find the first step”**. The AI action remains optional and user-triggered. Starting a task creates a 25-minute focus session.

### 2. Focus

The focus canvas displays only the active task, a timestamp-derived timer, sound control, pause, and early end. The Today rail becomes quiet. The lion sits at the study desk and writes. No coin, leaderboard, task-board, or reward animation interrupts active focus.

### 3. Pause and resume

Pause freezes the visible duration and changes the lion to an attentive resting pose. Resume is the same prominent control in the same location. The timer authority remains outside the renderer.

### 4. Verified completion

A fully verified 25-minute session leads to a short completion moment. It shows one earned star, focused time, the appropriate 5- or 15-minute break, and—only if applicable—one Study Corner unlock. The user can begin the break or choose the next task; no session starts automatically.

### 5. Early end and recovery

Early end uses a confirmation sheet: **“Record the time you gave this task?”** It records actual elapsed minutes without a star, cycle increment, or failure language. On restart after an expired session, the only actions are **Record elapsed time only** and **Discard this session**.

### 6. Gentle return

The Study Corner shows **“Days you came back this week”**, not a breakable consecutive streak. Empty days do not create warnings or negative mascot states.

## Companion behavior

The original blue-maned lion is redesigned as a small, coherent illustrated character within the Study Corner scene.

- Idle: arranging notes or looking out the window.
- Focus: seated at the desk, reading or writing.
- Paused: resting beside the task, neutral rather than disappointed.
- Break: stretching or drinking water.
- Verified completion: one short, warm celebration; no celebration for partial sessions.

The character art should use a soft editorial illustration style, subtle texture, clear blue mane silhouette, and transparent background assets. It must not copy NUS branding or existing commercial mascot art.

## Game progression

One completed Pomodoro gives one star. Partial sessions retain time but give zero stars. Stars automatically reveal fixed Study Corner objects: lamp, books, plant, window scene, then the lion’s dedicated corner. There is no shop, random reward, event, public leaderboard, or spending loop.

## Implementation scope

The Web migration will:

1. Create a React web shell and preserve the timer domain model behind a browser-compatible local persistence layer.
2. Rebuild the idle, focus, paused, break, completion, early-end, and recovery states as the study desk design.
3. Replace the current mascot image with original, transparent study-corner assets and state variants.
4. Keep local AI optional; browser deployment may expose it only when a local bridge is available.
5. Add browser-based visual and interaction tests for desktop and narrow-screen layouts.

The initial migration excludes accounts, cloud sync, social features, shops, random rewards, timed events, and a public leaderboard.

## Acceptance criteria

- The first screen makes task selection and starting a Pomodoro unmistakable.
- During focus, task and timer dominate; game mechanics do not compete for attention.
- Blue-maned lion posture communicates idle, focus, pause, break, and verified completion without negative feedback.
- Today supports up to three active tasks and a low-friction first-step rescue.
- Early end and restart recovery do not award a star or imply failure.
- Desktop and narrow layouts preserve timer prominence and control reachability.
- All visible state changes originate from the reliable timer authority.
