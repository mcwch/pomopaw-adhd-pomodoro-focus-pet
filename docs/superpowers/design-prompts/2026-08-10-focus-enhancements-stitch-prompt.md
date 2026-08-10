# Stitch prompt: Focus Companion enhancements

Use the existing Focus Companion Focus / Study Desk screen as the source layout and preserve its three-column desktop composition. This is an ADHD-friendly Pomodoro tool; the timer and the user's next action must remain the visual priority.

## Platform

Desktop-first web screen, responsive down to a narrow laptop window. Create a light-mode and dark-mode variant of the same screen. Keep the existing blue-maned chibi lion studying at a desk in the right Study Corner; do not replace the character with a different style.

## Required structure

1. **Top navigation**
   - Keep Focus, Progress, Friends navigation and the weekly return indicator.
   - Keep a compact theme toggle in the existing settings position.
   - The toggle must visibly switch between light and dark variants without changing layout.

2. **Left Today rail**
   - Keep the headline “Choose one small thing.”, up to three small tasks, add-task field, square task checkboxes, and the helper copy.
   - Keep the quiet secondary action: “Help me shrink this into a first step.”
   - When activated, expand an inline helper card directly below the task field. Do not use a modal.
   - The helper card must contain:
     - a compact input for the unclear task;
     - an explicit button “Ask local AI”;
     - a calm loading state “Thinking locally…”;
     - a result area labelled “Try this”;
     - a secondary action “Use this step”;
     - an unobtrusive unavailable state explaining that local AI is optional.
   - The card should feel like a small assistive prompt, not a chatbot or a large dashboard panel.

3. **Center Focus canvas**
   - Preserve the existing idle and active Pomodoro states.
   - Preserve the large circular timer, task title, 25-minute start action, pause/resume, and early-end action.
   - When “Use this step” is selected, show the suggestion in the main task field but do not start the timer automatically.
   - Keep sound controls below the timer actions with the choices White noise, Rain, Café, Forest, and None.
   - None must be visually equivalent to “sound off” and easy to discover without overpowering the timer.

4. **Right Study Corner**
   - Preserve the Stitch lion and the quiet companion message.
   - In dark mode, the scene remains readable and the lion remains the focal character; do not turn it into a high-contrast game HUD.

## Interaction states to design

- Idle Focus with helper collapsed.
- Idle Focus with AI helper expanded and empty input.
- AI helper loading.
- AI helper with a short first-step result and “Use this step”.
- Active focus session with White noise selected.
- Active focus session with None selected and sound visibly off.
- Full dark-mode Focus screen.

## UX constraints

- The AI is optional, local-first, and user-triggered. It receives only the task text.
- AI never starts a timer, changes rewards, or edits a task without a separate user click.
- Keep copy kind, concrete, and non-judgmental; do not frame missed days as failure.
- Keep controls keyboard-accessible with clear focus states.
- Use the current Focus Companion Stitch design system and existing visual language. Do not introduce a new illustration family, leaderboard, shop, or extra gamification on this screen.

## Deliverable

Return an updated Focus screen design plus the light/dark and AI helper states. Keep the structure easy to translate into React components: TodayRail, LocalAiFirstStep, FocusCanvas, SoundControls, StudyCorner, and ThemeToggle.
