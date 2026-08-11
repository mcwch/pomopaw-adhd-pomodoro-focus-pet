# Security policy

## Supported versions

The `main` branch is the supported development line. Releases will document their support window once signed installers are published.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub private vulnerability reporting when enabled for the repository, or contact the maintainers through the repository owner profile with:

- a concise description and impact;
- affected commit, route, or package;
- reproduction steps or proof of concept;
- a suggested mitigation, if known.

Never include API keys, tokens, private user data, or credentials in a report. We will acknowledge reports and coordinate a fix before public disclosure when practical.

## Security expectations

- `ADHD_APP_MISTRAL_API_KEY` must remain server-side and must never use a `VITE_` prefix.
- The AI proxy validates method, payload size, and task length before calling the provider.
- Local focus history is private by default. Future social features must be opt-in and authenticated.

