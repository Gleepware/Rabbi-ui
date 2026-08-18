<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Rules

- **High priority**: Make the least possible changes needed to achieve the goal.
- Pure JavaScript only — no TypeScript (.ts, .tsx). Use .js and .jsx extensions.
- Use ES6 module syntax (import/export). Do NOT use require().
- React components must use the .jsx extension.
- This is a front-end only application — no server-side code, no API routes, no Node.js APIs.
- React components go in the `src/components` folder.
- This application is built for mobile phone screens. All UI should be mobile-first.
- Avoid reading files for information already in memory.
