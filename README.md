# nitishprasad-website

This repository contains the static portfolio site for `nitishprasad.com`, including the recruiter-facing homepage and the detailed case study pages for the supporting projects in this workspace.

## What This Project Demonstrates

- product storytelling translated into a fast static site
- project writeups that explain scope, tradeoffs, and outcomes
- a crawler-friendly static homepage that does not require JavaScript for the main content
- clean separation between flagship case studies, supporting systems work, and legal pages
- sitemap, robots, canonical, Open Graph, and structured-data metadata for search and AI retrieval tools

## Current Scope

- static homepage content in `index.html`
- case study pages such as `project-sproutroute.html`, `project-sproutmath.html`, and `ai-eval-control-tower.html`
- shared styling in `portfolio-refresh.css`
- crawler discovery files: `robots.txt`, `sitemap.xml`, and `llms.txt`
- supporting assets, diagrams, blogs, and legal pages

## Tech Stack

- static HTML
- CSS
- small inline JavaScript only for mobile menu toggles and optional page interactions

## Run

Preview with any local static file server, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Demo evidence contract

Every public demo declares one proof mode:

- `local_execution` — arbitrary input runs deterministic application logic in the browser.
- `artifact_replay` — controls inspect a completed, versioned source artifact.
- `workflow_walkthrough` — inputs select an authored state and make no execution claim.

Each surface exposes `/demos/{id}/artifacts/manifest.json` with the source repository and commit, generator command, timestamps, SHA-256 hashes, provider metadata, supported claims, and limitations. Eval and AI Safety keep route-local aliases, but their canonical manifests remain under `/demos/`.

The source repositories remain canonical. To refresh the website snapshots, place the referenced repositories beside this directory at the commits declared in `evidence/sources.mjs`, generate their artifacts with the recorded commands, and run:

```bash
npm run sync:evidence
npm test
```

`sync:evidence` refuses to use a source checkout that does not contain the declared commit. `npm test` verifies every published hash and claim pointer, checks the GraphRAG evidence contract, and rejects the retired fixed-result rendering patterns.

Provider-backed benchmark runs are intentionally separate from secret-free pull-request checks. A clean website clone can validate every committed public artifact with:

```bash
npm test
```

The Gateway, RAG, AI Safety, trace-import, eval-import, and CSV-import interactions are browser-local. Uploaded files are size-limited, validated, and never sent to a server.

## Current State

The site is portfolio-first and recruiter-facing. It contains live case-study pages, demo links, supporting writeups, and the public narrative layer for the broader workspace.

The homepage intentionally renders its core text and links as plain HTML so search engines, ATS tools, corporate AI assistants, and no-JavaScript scrapers can process the portfolio without waiting for client-side React.
