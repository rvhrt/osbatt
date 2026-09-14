# OSBATT

A teaching workspace for slides, theory answers and C programming exercises.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Monaco assets are served locally; the editor does not require a third-party CDN.

## This first slice

- Reusable projects with editable explanation, theory and coding sections.
- Project rehearsal with a C-only Monaco editor and theory answers.
- Browser-local drafts, project persistence and dark/light preferences.
- History entries snapshot the project and answers when a rehearsal finishes.
- Responsive layouts, keyboard focus states and a native project dialog.

This is a local interface preview, not a live classroom service. There is no authentication, PDF upload, shared session, real terminal execution or server-side storage yet. Rehearsals are labelled as such. Do not enter student information into the prototype. Browser data is device-local and can be lost when browser storage is cleared. The terminal pane is visibly disconnected; it does not simulate command output. Rehearsal navigation is for the tutor to preview the flow, not the eventual student navigation model.

## Checks

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm test
npm run format:check
```

Browser tests cover project creation, persistence, immutable history snapshots, theme switching, editor loading, responsive width and preservation of corrupt storage.

## Next slices

1. PDF page import, ordering and per-page activities with starter files.
2. Tutor authentication and PostgreSQL persistence with project ownership.
3. Host-controlled sessions, join codes and reconnect identities; students receive only revealed content.
4. Isolated execution service with real shell, GCC, filesystem/editor sync and resource limits.
5. Server-side submission snapshots and history for multiple concurrent sessions.
6. Transparent review flags, group workflows and JSON themes.

Target 30 students per session and 100 across sessions. These targets have not been load-tested. Website hosting and execution infrastructure remain undecided. Student commands must never run in the web application's host environment.

Use feature branches and focused PRs. Keep comments sparse and concise; prefer clear naming.
