<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## OSBATT conventions

- Keep comments minimal: short block descriptions only where needed.
- Use feature branches and focused pull requests. Do not merge without approval.
- Default to dark mode; use shared colour tokens for both themes.
- Distinguish local rehearsals from live sessions in UI and data.
- Never execute student code or shell commands on the application host.

- Preserve the original README.md unchanged; keep setup notes in docs/development.md.
