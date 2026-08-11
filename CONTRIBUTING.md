# Contributing to PomoPaw

Thanks for helping make focus tools kinder and more dependable.

## Before you start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md).
- For significant product changes, open an issue first so the scope and UX can be discussed.
- Do not commit API keys, `.env` files, private screenshots, raw provider responses, or unlicensed visual assets.

## Development

```bash
npm install
npm run dev:web
npm run typecheck
npm test -- --run
npm run build:web
```

Keep timer behavior in the domain/store/service layer and keep components focused on rendering and user interaction. New rewards must preserve the invariant that only verified full focus sessions award stars.

## Pull requests

- Explain the user problem and the smallest useful change.
- Include tests for timer, persistence, AI validation, or reward behavior changes.
- Include a screenshot or short recording for visual changes.
- Call out accessibility, privacy, and offline behavior.
- Keep commits focused and use a clear imperative subject line.

## Visual assets

Review [docs/ASSETS_LICENSE.md](docs/ASSETS_LICENSE.md) before adding or replacing artwork. A pull request should record the source and permission for any non-code asset.

