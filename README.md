# Focus Companion

A local-first Windows focus companion: a reliable 25/5/15 Pomodoro timer, a blue-maned lion desktop companion, optional ambient sound, and gentle game progress that rewards only verified full focus sessions.

## Reliable timer checks

Run the focused reliability suite with `npm run test:reliable-timer`. Before creating a Windows installer, follow [the manual QA checklist](docs/manual-qa-reliable-timer.md).

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Optional cloud task helper

The web task helper uses Mistral first and falls back to local Ollama when the
cloud endpoint is unavailable. Keep the Mistral key in the server environment;
do not prefix it with `VITE_` and do not put it in browser code.

On Windows PowerShell:

```powershell
[Environment]::SetEnvironmentVariable("ADHD_APP_MISTRAL_API_KEY", "your-key", "User")
```

Restart the development server after changing the variable. Mistral Free mode
has usage and rate limits; the app shows a gentle unavailable message when the
quota or network is unavailable. The AI helper is cloud-only by design; it does
not require Ollama or a local Qwen model.

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
