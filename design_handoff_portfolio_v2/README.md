# Handoff: Portfolio v2 Redesign (nitishprasad.com)

## Overview
A recruiter-focused redesign of the existing portfolio at www.nitishprasad.com. The site's visual theme (warm paper background, Geist type, huge tight-tracked headlines, red/green accents, hairline-ruled grids) is preserved; the changes target the navigation, recruiter conversion path, work-card legibility, page pruning, and the "Ask about Nitish" assistant.

**Target codebase:** the existing static-HTML site (`index.html`, `platform-system.css`, `platform-system.js`, `recruiter-assistant.js/.css`). This handoff is written to be applied as edits to those files — no framework migration is needed or intended.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, not production code to copy directly. They use inline styles and a design-component runtime (`support.js`) that must NOT be shipped. The task is to **recreate the changes in the existing static site**: extend `platform-system.css` with the new nav/card/assistant rules and edit the page HTML files accordingly, following the site's existing class-based conventions.

## Fidelity
**High-fidelity.** Colors, spacing, type sizes, and copy are final. Recreate pixel-perfectly. All values below are exact.

## What Changed vs. the Live Site (summary of the redesign)

### 1. Navigation → floating pill capsule (all pages)
Replaces the current full-width bordered rectangle (`.platform-nav`).
- Container: `position:fixed; top:18px; left:50%; transform:translateX(-50%)`, content-width (not full-width), `display:flex; align-items:center; gap:20px; padding:8px 8px 8px 24px; border:1px solid rgba(23,25,21,.16); border-radius:999px; background:rgba(255,250,240,.94); backdrop-filter:blur(18px); box-shadow:0 14px 44px rgba(28,25,18,.13)`.
- Brand lockup (one line, baseline-aligned, `gap:10px`): **"Nitish Prasad"** (`font-weight:700; font-size:.98rem; letter-spacing:-.01em`) + role tag **"PRINCIPAL / STAFF PM"** (`color:#b93822; font-size:.68rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase`). This replaces the old "Product systems" subtitle — seniority is now in the brand.
- Divider: `1px × 26px`, `rgba(23,25,21,.16)`.
- Links (Work, AI Platform, About, Resume): `min-height:42px; padding:0 15px; border-radius:999px; font-size:.92rem; font-weight:600; white-space:nowrap`. Inactive `color:#5b6058`; hover `background:#171915; color:#f1ede3`. Active page: `color:#171915; background:rgba(23,25,21,.07)` (no hover change).
- CTA pill: **"Get the resume ↓"** → resume page (`background:#b93822; color:#fff; font-weight:700; border-radius:999px; min-height:46px; padding:0 20px; white-space:nowrap`; hover `background:#171915`). On the resume page itself the CTA is **"Email me"** → `mailto:hello@nitishprasad.com` (same styling).
- IMPORTANT: every nav link and CTA carries `white-space:nowrap` so "AI Platform" / "Email me" never wrap.
- Mobile (<760px): keep the existing hamburger/menu-toggle pattern from `platform-system.css`, applied to the pill container.

Two alternate nav treatments were explored and rejected in favor of the pill (kept in `Home v2.dc.html` behind the `navStyle` prop for reference): a full-width "role-forward bar" and a borderless "edge-anchored" bar.

### 2. Hero (homepage)
- Kicker: **"PRINCIPAL / STAFF PRODUCT MANAGER · AI PLATFORMS & SYSTEMS"** (was "Principal product leadership for AI systems").
- Support copy ends with "…Currently open to Principal/Staff PM and AI Product Lead roles."
- Buttons (gap:14px): primary **"Download resume ↓"** (`background:#b93822; border:1px solid #b93822; color:#fff`; hover `background:#171915`), secondary **"Email me"** (outline: `border:1px solid #171915; background:transparent`; hover fills ink), text-link "See product proof ↘". The resume download is now above the fold.
- Everything else in the hero (headline with rotated red "operational" highlight, 3-cell evidence grid, green platform-preview banner) unchanged.

### 3. Selected-work cards
- Scrim lightened: `linear-gradient(180deg, rgba(0,0,0,0) 34%, rgba(0,0,0,.55) 60%, rgba(0,0,0,.9))` (was `rgba(0,0,0,.04) → rgba(0,0,0,.86)` full-height). Images stay legible.
- Card top row: category tag left, **"Read the case →"** right (`font-size:.8rem; font-weight:700; white-space:nowrap`).
- Metrics promoted from tiny italic `<em>` line to a ruled 3-stat row: `display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid rgba(255,255,255,.32)`; each cell `padding:14px 14px 0 0`; number `font-size:1.15rem; font-weight:700(bold); color:#fff; letter-spacing:-.02em`, label `font-size:.74rem; color:rgba(255,255,255,.75)`.
  - Amplify: 89% faster prep · &lt;500ms P95 latency · −99% inference cost
  - SproutRoute: 350+ tests in CI · Gemini + Google Places · MCP agent path
  - Sprout Math: 2,400+ problem templates · 2,500+ audio clips · 0 accounts required
- Card hover: `box-shadow:0 30px 80px rgba(28,25,18,.18)` (in addition to existing image scale).

### 4. Homepage pruning
Removed as redundant for a 30-second recruiter scan: the 3-cell "evidence strip" and the "Decision evidence" carousel. The 4-tile platform-cases grid remains (now 4 columns) and links to the capability pages.

### 5. Contact section (homepage)
- Kicker "HIRING?"; headline **"Hiring a Principal or Staff PM for AI platforms?"**
- Copy: "I'm the fit when the role sits at the intersection of AI systems, platform strategy, marketplace economics, and 0→1 execution — and the product has to earn adoption."
- Buttons: red `hello@nitishprasad.com` mailto + outline "Download resume ↓" + "LinkedIn ↗" text link.

### 6. Sticky resume pill (all pages, optional)
`position:fixed; right:24px; bottom:94px` (sits above the assistant launcher; `bottom:24px` if launcher hidden); `background:#b93822; color:#fff; border-radius:999px; min-height:52px; padding:0 22px; font-weight:700; box-shadow:0 14px 40px rgba(28,25,18,.25)`; hover `background:#171915`. Label "Resume ↓".

### 7. Recruiter assistant changes (`recruiter-assistant.js/.css`)
- Launcher: **contrast fix** — was green `#203c32` (invisible over the green platform banner). Now `background:#171915; border:2px solid #f1ede3; color:#fff; box-shadow:0 12px 34px rgba(16,20,17,.35)`; hover `background:#b93822`. Keep the pulsing dot (`#b9cfad`, `box-shadow:0 0 0 5px rgba(185,207,173,.18)`). Label changed **"Ask about Nitish" → "Recruiter? Ask me anything"**.
- Opening assistant message now leads with the role target: "Nitish is open to Principal/Staff PM and AI Product Lead roles. Ask me about his experience, strengths, AI and platform work, or work preferences — answers use approved portfolio sources."
- Success path: after each assistant answer (not the greeting), append a button **"Sounds like a fit? Share the role →"** (`background:#203c32; color:#fff; padding:10px 14px; font-size:.76rem; font-weight:700`; hover ink) that switches to the Contact tab.
- Panel layout/tabs/contact form unchanged from the live implementation.

### 8. Case-study / project pages
All case pages use one shared shell (see `Project — SproutRoute v2.dc.html` as the canonical example): pill nav → hero (kicker, huge title, summary, two status badges, 4-cell metric line, action buttons, 3-cell decision summary) → ruled sections with sticky left kicker and right body (h2 + optional intro + one of: 2-col evidence panels / 4-col system map / 3-col image grid / text links). Badge one is filled green (`#203c32`, white text), badge two outlined. This matches the live `detail-page` shell — only the nav and the assistant differ.

### 9. Full page inventory (12 pages, all cross-linked)
Home, Resume, AI Platform, Amplify case study, SproutRoute, Sprout Math, LLM Gateway, Agent Observability, GraphRAG, Red-Team Gate, Eval Control Tower, AI Safety Audit, RAG Guardrails, Multi-Agent MCP, Archive. Map each to its existing HTML file (e.g. `Project — GraphRAG v2.dc.html` → `project-graphrag.html`). In the prototypes, external links (GitHub, live apps, demo labs, legal, markdown docs) are stubbed with `#` — keep the real URLs from the live site.

## Interactions & Behavior
- Nav link hover: background `#171915`, text `#f1ede3`; CTA hover `#171915`.
- Buttons: primary hover `translateY(-3px)` where the live site already does this.
- Assistant: launcher opens right-side panel (`width:min(480px, 100vw−24px)`, slide-in, backdrop `rgba(17,21,18,.48)` + blur 4px); Ask/Contact tabs (active tab: 3px `#b93822` bottom border); Enter sends, Shift+Enter newline; suggested-question chips fill and send; contact submit shows status line. All of this already exists in `recruiter-assistant.js` — only the launcher styling/copy, greeting, and fit-CTA are new.
- Sticky cards ("How I operate") and platform-preview rotate(.6deg) hover-straighten: unchanged from live site.

## Design Tokens (unchanged from `platform-system.css`)
- Ink `#171915` · Muted `#5b6058` · Paper `#f1ede3` · Surface `#fffaf0` · Line `rgba(23,25,21,.19)` (nav pill uses `.16`) · Red `#b93822` · Green `#203c32`
- Type: Geist (Google Fonts, 400/500/600/700). Headline letter-spacing −.065em to −.085em, line-height .84–.92.
- Max content width 1440px; section side padding via `width:min(calc(100% - 48px),1440px)`.
- New shadow values: nav pill `0 14px 44px rgba(28,25,18,.13)`; launcher `0 12px 34px rgba(16,20,17,.35)`; card hover `0 30px 80px rgba(28,25,18,.18)`.

## Assets
All copied from the live repo, unchanged: `assets/screenshots/*` (SproutRoute app screens), `assets/mathquest/*` (Sprout Math worlds), `diagrams/*` (architecture SVGs + MCP trace PNG), favicon. No new assets were created.

## Files in this bundle (design references)
- `Home v2.dc.html` — homepage (has `navStyle` variants + `stickyResume`/`showAssistant` flags in its logic)
- `Resume v2.dc.html`, `AI Platform v2.dc.html`, `Case Study — Amplify v2.dc.html`
- `Project — SproutRoute v2.dc.html` (canonical case shell, with screens + diagrams), `Project — Sprout Math v2.dc.html`, `Project — LLM Gateway v2.dc.html`, `Project — Agent Observability v2.dc.html`, `Project — GraphRAG v2.dc.html`, `Project — Red-Team Gate v2.dc.html`, `Project — Eval Control Tower v2.dc.html`, `Project — AI Safety Audit v2.dc.html`, `Project — RAG Guardrails v2.dc.html`, `Project — Multi-Agent MCP v2.dc.html`
- `Archive v2.dc.html` — evidence map
- `RecruiterAssistant.dc.html` — shared assistant component (launcher + panel + canned Q&A)
- `assets/` — images used by the designs

Open any `.dc.html` next to `support.js` in a browser to see the design live; read the markup between `<x-dc>…</x-dc>` and the `class Component` script for exact inline styles and copy. Do not ship these files — implement the equivalent in `platform-system.css` + the site's HTML pages.

## Implementation order suggestion
1. `platform-system.css`: add pill-nav rules (replace `.platform-nav` styling), work-card metric row + scrim, sticky resume pill.
2. Update nav markup + hero + contact copy in `index.html`; remove evidence strip + carousel.
3. Update nav markup on all other pages (resume, enterprise-ai-platform, all project pages, archive, legal).
4. `recruiter-assistant.css/js`: launcher restyle + copy, greeting, fit-CTA → Contact tab.
5. QA: no nav wrapping at 1024–1440px; launcher visible over green sections; all internal links resolve; print styles unaffected.
