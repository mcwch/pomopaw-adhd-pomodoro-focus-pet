# Mistral Cloud AI Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Replace the task helper's dependency on a running local Ollama instance with a secure Mistral cloud request while preserving a local fallback in both the web app and Electron desktop app.

**Architecture:** The browser calls a same-origin `/api/ai/first-step` endpoint. A Vite development middleware reads `ADHD_APP_MISTRAL_API_KEY` only in the local server process and forwards a short, non-streaming chat request to Mistral. The Electron main process uses the same request boundary through a validated IPC method. The UI tries Mistral first and falls back to Ollama only when the cloud endpoint is unavailable; no API key is bundled into browser code.

**Tech Stack:** Vite middleware, native `fetch`, Mistral OpenAI-compatible Chat Completions API, React, Vitest.

## Global Constraints

- Never expose `ADHD_APP_MISTRAL_API_KEY` through `import.meta.env`, browser JavaScript, logs, or error responses.
- Keep the task payload trimmed and limited to the existing 500-character IPC contract.
- Keep Ollama fallback available for offline/private use.
- Use `stream: false`, a concise system instruction, and a bounded output length.

---

### Task 1: Add a testable Mistral request boundary

**Files:**
- Create: `src/server/mistral.ts`
- Test: `tests/unit/mistral.test.ts`

- [ ] **Step 1: Write the failing tests** for a successful OpenAI-compatible response, missing key, non-OK response, and trimming the task.
- [ ] **Step 2: Run `npm test -- --run tests/unit/mistral.test.ts` and confirm the missing-module failure.**
- [ ] **Step 3: Implement `requestMistralFirstStep(task, apiKey, fetchLike)` with the Mistral endpoint, bounded prompt, and `{ suggestion, available }` result.
- [ ] **Step 4: Run the focused test and confirm it passes.**
- [x] **Step 5: Commit the boundary and tests.**

### Task 2: Add a same-origin Vite proxy endpoint

**Files:**
- Create: `src/server/mistral-proxy.ts`
- Modify: `vite.web.config.ts`
- Test: `tests/unit/mistral-proxy.test.ts`

- [ ] **Step 1: Write the failing tests** for POST body parsing, successful JSON response, missing environment key returning 503, and rejecting non-POST requests.
- [ ] **Step 2: Run the focused proxy test and confirm it fails before the middleware exists.**
- [ ] **Step 3: Implement a Vite middleware that reads `process.env.ADHD_APP_MISTRAL_API_KEY`, caps the body at 500 characters, calls the boundary, and never returns the key.
- [ ] **Step 4: Register the middleware plugin in `vite.web.config.ts`.**
- [x] **Step 5: Run focused proxy tests and verify the dev endpoint returns JSON.**

### Task 3: Switch the UI helper to cloud-first behavior

**Files:**
- Modify: `src/web/local-ai.ts`
- Modify: `tests/web/local-ai.test.ts`
- Modify: `src/renderer/src/components/LocalAiFirstStep.tsx`
- Modify: `src/main/index.ts`
- Modify: `src/preload/index.ts`
- Modify: `src/shared/ipc.ts`

- [ ] **Step 1: Add a failing test** that the web helper requests `/api/ai/first-step` first and falls back to Ollama only after a cloud failure.
- [ ] **Step 2: Run the focused test and verify it fails with the current Ollama-only endpoint list.**
- [ ] **Step 3: Implement cloud-first request handling and keep the existing local fallback and user-facing unavailable message.**
- [x] **Step 4: Run all local AI tests.**

### Task 4: Verify the integration and document local setup

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`

- [ ] **Step 1: Add `.env.local` to ignored files and document setting `ADHD_APP_MISTRAL_API_KEY` without exposing it to Vite client code.**
- [ ] **Step 2: Run `npm run typecheck`, `npm test -- --run`, `npm run build:web`, and `git diff --check`.**
- [x] **Step 3: Start/refresh the web app and verify `POST /api/ai/first-step` returns a suggestion with HTTP 200 while the key is not present in the response.**
- [ ] **Step 4: Commit the complete integration.**
