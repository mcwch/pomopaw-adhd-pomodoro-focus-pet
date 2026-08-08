# Reliable timer manual QA

Run these checks in a packaged Windows build before release. The expected behavior is intentionally conservative: only a verified full 25-minute focus earns a star.

1. Start a focus session, close the main window, wait one minute, reopen it from the tray, and confirm the remaining time has decreased.
2. Pause focus, close and reopen the main window, and confirm the paused remaining time is unchanged.
3. Finish one full focus interval and confirm exactly one star plus a 5-minute short break.
4. Complete four full focus intervals and confirm the fourth starts a 15-minute long break.
5. End at roughly 18 minutes and confirm focused minutes are recorded without a star or cycle increment.
6. Force-close during a running focus before expiry, relaunch, and confirm timestamp-derived remaining time resumes.
7. Force-close during focus, relaunch after expiry, and confirm only **Record elapsed time only** and **Discard this session** are available.
8. Start focus with the companion enabled, hide the main window, and confirm the tray and companion remain synchronized.
9. Use **Hide companion** from the tray and confirm it hides without pausing or ending the timer.
