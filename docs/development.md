# OSBATT

A teaching workspace for slides, theory answers and C programming exercises.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Monaco assets are served locally; the editor does not require a third-party CDN.

## Current features

- Reusable projects with editable explanation, theory and coding sections.
- Markdown title/description editors with formatting controls and previews. Titles use inline formatting; descriptions and question content support blocks, lists, tables and links. Raw HTML and remote images are not rendered.
- Local PDF import (50 MB / 200 pages), page previews, reordering and removal.
- Attach theory or C activities to slides; upload one starter .c file as main.c.
- Expand slides for reading small code and diagrams. Original colours are preserved.
- Project rehearsal with a C-only Monaco editor and theory answers.
- Browser-local drafts, project persistence and dark/light preferences.
- History entries snapshot the project and answers when a rehearsal finishes.
- Responsive layouts, keyboard focus states and a native project dialog.

This is a local interface preview, not a live classroom service. There is no authentication, shared session, real terminal execution or server-side storage yet. Rehearsals are labelled as such. Do not enter student information into the prototype. Browser data is device-local and can be lost when browser storage is cleared. The terminal pane is visibly disconnected; it does not simulate command output. Rehearsal navigation is for the tutor to preview the flow, not the eventual student navigation model.

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

2. Tutor authentication and PostgreSQL persistence with project ownership.
3. Host-controlled sessions, join codes and reconnect identities; students receive only revealed content.
4. Isolated execution service with real shell, GCC, filesystem/editor sync and resource limits.
5. Server-side submission snapshots and history for multiple concurrent sessions.
6. Transparent review flags, group workflows and JSON themes.

Target 30 students per session and 100 across sessions. These targets have not been load-tested. Website hosting and execution infrastructure remain undecided. Student commands must never run in the web application's host environment.

Use feature branches and focused PRs. Keep comments sparse and concise; prefer clear naming.

## PDF storage and testing

PDF.js renders pages locally; no PDF is sent to a server or retained as a source file. Rendered page images and thumbnails are stored in IndexedDB, with references in project metadata. Imports append pages, initially as presentations; the tutor explicitly chooses question pages. Failed rendering never adds partial project sections. Cancelling an import leaves the existing project unchanged.

Slide assets are immutable and retained when a section is removed so history snapshots still work. Automatic garbage collection and cross-device storage are not implemented. Clearing browser site data removes both slide assets and saved work. Importing the same PDF again makes an independent copy. Raster slides do not preserve PDF hyperlinks, animations or text selection; extracted text is available separately, and image-only code may have no extractable text.

This remains a tutor-local rehearsal tool. It is not a security boundary for unrevealed solutions; future student routes must authorise each page server-side and never send whole decks or answer keys.

Tests use a synthetic three-page PDF committed under tests/fixtures. To additionally exercise the supplied 115-page reference deck without committing it:

```sh
OSBATT_SAMPLE_PDF="/path/to/COMP2521 - Week 1.pdf" npm test
```
