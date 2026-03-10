# Website Declutter + Tone Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove redundant sections and boxes from the homepage, then tighten the narrative tone by eliminating repetition and cleaning up awkward phrasing.

**Architecture:** Pure content + structural edits to `index-app.jsx` (source) and `index-app.js` (its compiled mirror). No new components, no new CSS classes. The compiled `.js` is a line-for-line readable mirror of the `.jsx` wrapped in an IIFE — every change applies identically to both files.

**Tech Stack:** Vanilla React 18 (CDN), vanilla CSS, static HTML — no build step required.

---

## What we're removing and why

| Box / Section | Why it's redundant |
|---|---|
| "Hiring snapshot" aside card in Hero | Dry keyword lists that repeat the headline, eyebrow, and intro prose |
| 4 `fitCards` grid above Experience timeline | Repeats Approach credibility cards + Amplify narrative already told 3x |
| "Project coverage" bullet list in Contact | Summarizes a page the reader just scrolled through |
| `copy` text on each proof card | Vague restatements of what the Amplify project card already says |
| `footer` label on project cards | "Role, outcomes, and ownership first" — meaningless to an external reader |

## What we're tightening

| Location | Problem | Fix |
|---|---|---|
| FlagshipWork section header | h2 "Flagship case studies." echoes eyebrow "Flagship Work" | Simplify or remove h2 |
| Systems section | Title and note say almost identical things | Remove the `section-note` |
| `heroReads` copy | Abstract skill labels ("execution range", "thoughtful platform boundaries") | Make concrete and specific |
| `credibility[0].copy` | "high-bar environment" — Amazon-internal framing | Rewrite to plain English |
| `credibility[1].copy` | Comma-separated keyword dump, not a sentence | Make it a real sentence |
| `credibility[2].copy` | "realities that arrive after adoption starts to matter" — awkward | Tighten |

---

## Task 1: Remove "Hiring Snapshot" aside card from Hero

**Files:**
- Modify: `index-app.jsx` lines 34–47 (data) and lines 308–320 (render)
- Modify: `index-app.js` same logical blocks (IIFE-wrapped mirror)

**Step 1: Delete `heroSnapshot` data array**

In `index-app.jsx`, delete lines 34–47:
```js
// DELETE THIS ENTIRE BLOCK:
const heroSnapshot = [
  {
    label: "Best-fit roles",
    value: "Principal PM, Staff PM, Lead PM, AI Product Lead, Technical Product Lead"
  },
  {
    label: "Core strengths",
    value: "0→1 product strategy, AI platform design, system tradeoffs, customer workflow thinking, scaled execution"
  },
  {
    label: "What stands out",
    value: "10+ years at Amazon, measurable outcomes, technical fluency, and a habit of pushing beyond the first framing of the problem"
  }
];
```

**Step 2: Delete the "Hiring snapshot" aside-card block from `Hero()`**

In `index-app.jsx`, inside the `Hero()` function's `<aside className="hero-aside">`, delete the second `<div className="aside-card">` block (the one with `pill signal` and `heroSnapshot.map`):

```jsx
// DELETE THIS ENTIRE BLOCK from Hero():
<div className="aside-card">
  <span className="pill signal">Hiring snapshot</span>
  <div className="divider"></div>
  <div className="list-tight">
    {heroSnapshot.map((item) => (
      <div key={item.label}>
        <strong>{item.label}</strong>
        <p>{item.value}</p>
      </div>
    ))}
  </div>
</div>
```

**Step 3: Apply identical deletions to `index-app.js`**

Same content exists starting at line 32 in `index-app.js`. Delete the `heroSnapshot` array and the same aside-card block in the `Hero` function.

**Step 4: Verify**

Open `index.html` in a browser. The Hero aside should show only the "Selected case studies" card, with more breathing room below it.

**Step 5: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: remove hiring snapshot card from hero aside"
```

---

## Task 2: Remove `fitCards` block from ExperienceSection

**Files:**
- Modify: `index-app.jsx` lines 127–144 (data) and lines 439–446 (render)
- Modify: `index-app.js` same blocks

**Step 1: Delete `fitCards` data array**

In `index-app.jsx`, delete lines 127–144:
```js
// DELETE THIS ENTIRE BLOCK:
const fitCards = [
  {
    title: "Current focus",
    copy: "Senior Product Manager at Amazon. Turned Amplify from a dashboard request into a platform-shaped AI product with real operating leverage."
  },
  {
    title: "Sweet spot",
    copy: "0→1 framing, customer discovery, PR-FAQ thinking, architecture pressure-testing, experimentation, and platform strategy."
  },
  {
    title: "Technical range",
    copy: "Deep enough to challenge architecture and operating-model decisions rather than treating the technical stack as a black box."
  },
  {
    title: "Best interview arc",
    copy: "Product leader who turns ambiguous bets into scaled systems while managing cost, latency, quality, adoption, and organizational buy-in."
  }
];
```

**Step 2: Delete the `cred-grid` render block from `ExperienceSection()`**

In `index-app.jsx`, inside `ExperienceSection()`, delete the entire `<div className="cred-grid">` block:
```jsx
// DELETE THIS ENTIRE BLOCK from ExperienceSection():
<div className="cred-grid">
  {fitCards.map((card) => (
    <article className="panel-card" key={card.title}>
      <h3>{card.title}</h3>
      <p>{card.copy}</p>
    </article>
  ))}
</div>
```

**Step 3: Apply identical deletions to `index-app.js`**

**Step 4: Verify**

The Experience section should now show only the section header + the timeline. Cleaner, less redundant with the Approach section above it.

**Step 5: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: remove fitCards grid from experience section"
```

---

## Task 3: Remove "Project coverage" card from Contact, make it single-column

**Files:**
- Modify: `index-app.jsx` lines 505–544 (`Contact()` function)
- Modify: `index-app.js` same block
- Modify: `portfolio-refresh.css` — no changes needed (`.split-section` unused here after this, but CSS is harmless)

**Step 1: Rewrite `Contact()` to single-column**

Replace the entire `Contact()` function body with this (removes the `split-section` wrapper and the project coverage card):

```jsx
function Contact() {
  return (
    <section className="section" id="contact">
      <article className="panel-card" style={{ maxWidth: "680px" }}>
        <div className="eyebrow">Contact</div>
        <h2 className="section-title" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)" }}>
          If the role needs someone who can shape the product and stay close to the system, I am happy to talk.
        </h2>
        <p className="inline-note">
          Email is the fastest path. LinkedIn and GitHub are here if you want the broader context.
        </p>
        <div className="contact-cta">
          <a className="button primary" href={SITE.resume} target="_blank" rel="noreferrer">
            Open Resume
          </a>
          <a className="contact-link" href={`mailto:${SITE.email}`}>
            Email Nitish
          </a>
          <a className="contact-link" href={SITE.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a className="contact-link" href={SITE.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </article>
    </section>
  );
}
```

**Step 2: Apply identical change to `index-app.js`**

**Step 3: Verify**

Contact section should be a single clean card at natural reading width. No redundant project summary list.

**Step 4: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: simplify contact section to single column, remove project coverage list"
```

---

## Task 4: Strip verbose `copy` from proof cards

**Files:**
- Modify: `index-app.jsx` lines 49–70 (data) and line ~349 (render)
- Modify: `index-app.js` same blocks

**Step 1: Remove `copy` field from each item in `proofs` array**

Replace the `proofs` array with:
```js
const proofs = [
  { stat: "1,600+", label: "Amplify users across NA and EU" },
  { stat: "99%",    label: "Infrastructure cost reduction" },
  { stat: "<500ms", label: "P95 latency target achieved" },
  { stat: "45→5 min", label: "Prep time saved per AM call" }
];
```

**Step 2: Remove `<p>{proof.copy}</p>` from the proof card render**

In `AmplifyOutcomes()`, change:
```jsx
// BEFORE:
<article className="proof-card" key={proof.label}>
  <strong>{proof.stat}</strong>
  <span>{proof.label}</span>
  <p>{proof.copy}</p>
</article>

// AFTER:
<article className="proof-card" key={proof.label}>
  <strong>{proof.stat}</strong>
  <span>{proof.label}</span>
</article>
```

**Step 3: Apply identical changes to `index-app.js`**

**Step 4: Verify**

Proof cards should be tight stat + label only — no verbose explanation text underneath. Much cleaner visual rhythm.

**Step 5: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: remove verbose copy from proof cards — stat + label only"
```

---

## Task 5: Remove ambiguous `footer` labels from project cards

**Files:**
- Modify: `index-app.jsx` lines 72–103 (data) and lines 386–391 (render)
- Modify: `index-app.js` same blocks

**Step 1: Remove `footer` field from `flagshipProjects` data, and rewrite `copy` fields**

The existing copy uses instructional framing ("It shows how I...", "I pushed it into..."). Rewrite to present the work directly.

Replace `flagshipProjects` with:
```js
const flagshipProjects = [
  {
    href: "project-amplify.html",
    title: "Amplify",
    badge: "Flagship",
    badgeClass: "accent",
    icon: "◉",
    copy: "An AI seller intelligence platform serving 1,600+ account managers across NA and EU. I redefined the product scope, designed the operating model that cut infra costs 99%, and set the roadmap path toward Salesforce — not another disconnected internal tool.",
    metrics: ["1,600+ users", "99% cost cut", "<500ms latency"]
  },
  {
    href: "project-sproutroute.html",
    title: "SproutRoute",
    badge: "Live demo",
    badgeClass: "signal",
    icon: "△",
    copy: "Designed, built, and shipped solo in ten weeks — React, Node, Claude API, Railway. Full end-to-end ownership: product scope, architecture, UX, and deployment.",
    metrics: ["10 weeks", "167 tests", "Web + mobile"]
  },
  {
    href: "project-mathquest.html",
    title: "MathQuest Kids",
    badge: "Product craft",
    badgeClass: "success",
    icon: "□",
    copy: "An offline-first iPad math app for kids. Privacy-safe by design: no accounts, no analytics, no data collection. 535 content templates in native SwiftUI.",
    metrics: ["Offline first", "535 templates", "Native SwiftUI"]
  }
];
```

**Step 2: Replace `.project-footer` render with a simple "Read case study →" link**

In the `FlagshipWork()` project card render, replace:
```jsx
// BEFORE:
<div className="project-footer">
  <span>{project.footer}</span>
  <span>→</span>
</div>

// AFTER:
<div className="project-footer">
  <span>Read case study</span>
  <span>→</span>
</div>
```

**Step 3: Apply identical changes to `index-app.js`**

**Step 4: Verify**

All three project cards now show "Read case study →" at the bottom — clear, consistent, no jargon.

**Step 5: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: replace ambiguous footer labels on project cards with 'Read case study'"
```

---

## Task 6: Fix redundant section headers

**Files:**
- Modify: `index-app.jsx` — `FlagshipWork()` ~line 362, `Systems()` ~line 477
- Modify: `index-app.js` same blocks

**Step 1: Simplify FlagshipWork section header**

The eyebrow already says "Flagship Work" and the h2 just echoes it. Change:
```jsx
// BEFORE:
<div className="section-header">
  <div>
    <div className="eyebrow">Flagship Work</div>
    <h2 className="section-title">Flagship case studies.</h2>
  </div>
  <div className="section-note">Three case studies that explain the scope I can own.</div>
</div>

// AFTER:
<div className="section-header">
  <div>
    <div className="eyebrow">Flagship Work</div>
    <h2 className="section-title">Three case studies that explain the scope I can own.</h2>
  </div>
</div>
```

**Step 2: Remove redundant `section-note` from Systems**

The title and note say nearly identical things. Change:
```jsx
// BEFORE:
<div className="section-header">
  <div>
    <div className="eyebrow">Supporting Systems</div>
    <h2 className="section-title">Supporting systems for evaluation, safety, and launch quality.</h2>
  </div>
  <div className="section-note">Live demos and technical systems for evaluation, safety, and release decisions.</div>
</div>

// AFTER:
<div className="section-header">
  <div>
    <div className="eyebrow">Supporting Systems</div>
    <h2 className="section-title">Live demos and systems for evaluation, safety, and release decisions.</h2>
  </div>
</div>
```

**Step 3: Apply identical changes to `index-app.js`**

**Step 4: Commit**
```bash
git add index-app.jsx index-app.js
git commit -m "chore: fix redundant section headers in FlagshipWork and Systems"
```

---

## Task 7: Copy voice pass — data arrays

The anti-pattern throughout is **narration**: writing *about* the work rather than *presenting* it. Fix every instance.

**Files:**
- Modify: `index-app.jsx`
- Modify: `index-app.js` (identical changes)

### 7a — `heroReads`

Current copy uses abstract skill labels ("execution range", "thoughtful platform boundaries"). Replace with concrete specifics:

```js
const heroReads = [
  {
    href: "project-amplify.html",
    title: "Amplify",
    copy: "1,600+ users, 99% infra cost reduction, and a roadmap path into Salesforce — not another internal tool."
  },
  {
    href: "project-sproutroute.html",
    title: "SproutRoute",
    copy: "Full-stack AI trip planner, shipped solo in ten weeks. React, Node, Claude API, Railway."
  },
  {
    href: "project-mathquest.html",
    title: "MathQuest Kids",
    copy: "Offline-first iPad math app for kids. SwiftUI, no accounts, no analytics, 535 content templates."
  }
];
```

### 7b — `workingStyle`

Bullet 1 uses "wedge" (PM jargon) and "build against" (vague). Fix it. The others are fine.

```js
const workingStyle = [
  "I start by reframing the problem. Most first requests aren't quite the right problem yet.",
  "I stay close enough to the system to challenge the architecture and operating model, not just the roadmap.",
  "I care about day-two reality: adoption, cost, latency, governance, and how the tool fits into an existing workflow.",
  "I am most useful when a team needs product judgment and technical fluency in the same room."
];
```

### 7c — `credibility`

Three problems: "high-bar environment" is Amazon-internal jargon; `credibility[1]` is a comma-separated keyword dump, not a sentence; `credibility[2]` has awkward phrasing.

```js
const credibility = [
  {
    title: "Amazon operator",
    copy: "10+ years at Amazon, working across executive stakeholders, scaled systems, and organizational complexity — from individual contributor to VP-facing program ownership."
  },
  {
    title: "AI PM with technical depth",
    copy: "Fluent in RAG, Bedrock, cost-latency tradeoffs, and the operating-model decisions that separate a good demo from a production system."
  },
  {
    title: "0→1 to scale",
    copy: "Comfortable moving from early framing into prototyping, system design, shipping, and the adoption problems that follow launch."
  }
];
```

### 7d — `experience` timeline copy

Two entries use narration or Amazon-internal phrasing:

**experience[1] (CXBT):**
```js
// BEFORE:
"Led strategic research across seller and vendor ecosystems. The work shaped roadmap and information-architecture decisions and fed directly into senior-leadership reviews."

// AFTER:
"Led strategic research across seller and vendor ecosystems. Findings shaped product roadmaps, information architecture, and senior leadership decisions."
```

**experience[2] (PSAS Ops):**
```js
// BEFORE:
"...and owned VP-level goals for a 700-person organization."

// AFTER:
"...and delivered against VP-level goals for a 700-person organization."
```

**Apply all 7a–7d changes to `index-app.js` as well.**

**Commit:**
```bash
git add index-app.jsx index-app.js
git commit -m "copy: voice pass on data arrays — remove narration, jargon, and keyword dumps"
```

---

## Task 8: Copy voice pass — inline prose and section headings

**Files:**
- Modify: `index-app.jsx`
- Modify: `index-app.js` (identical changes)

### 8a — Approach section h3

The eyebrow already says "How I work". The h3 "The pattern in the work is pretty consistent." is meta-commentary. Remove it entirely.

In `Approach()`, delete this line:
```jsx
// DELETE:
<h3>The pattern in the work is pretty consistent.</h3>
```

### 8b — ExperienceSection section title

"The operating profile behind the projects." reads like a slide deck label.

```jsx
// BEFORE:
<h2 className="section-title">The operating profile behind the projects.</h2>

// AFTER:
<h2 className="section-title">10 years at Amazon, across product, program, and operations.</h2>
```

### 8c — AmplifyOutcomes intro paragraph

"The work covered product framing..." is status-update language. Rewrite to active voice.

```jsx
// BEFORE:
<p>
  AI seller intelligence platform built for 1,600+ account managers across North America and Europe.
  The work covered product framing, operating-model design, multi-region constraints, and a credible path
  into Salesforce workflows.
</p>

// AFTER:
<p>
  An AI seller intelligence platform serving 1,600+ account managers across North America and Europe.
  I redefined the product scope, designed the operating model, navigated multi-region constraints, and
  set the roadmap path toward Salesforce.
</p>
```

**Apply all 8a–8c changes to `index-app.js` as well.**

**Commit:**
```bash
git add index-app.jsx index-app.js
git commit -m "copy: voice pass on inline prose — remove meta-commentary, rewrite to active voice"
```

---

## Task 9: Final visual pass and verification

**Step 1: Open `index.html` in a browser (or via a local server)**
```bash
# From the nitishprasad-website directory:
python3 -m http.server 8080
# Open http://localhost:8080
```

**Step 2: Scroll through the full page. Check:**
- [ ] Hero aside: only one card visible ("Selected case studies")
- [ ] FlagshipWork: section header no longer echoes itself; proof cards show stat + label only; project cards show "Read case study →"
- [ ] Approach: section unchanged — still shows workingStyle + credibility (now with rewritten credibility copy)
- [ ] Experience: no 4-card grid at top — just section header → timeline
- [ ] Systems: single section title, no duplicate note
- [ ] Contact: single card, no "Project coverage" list
- [ ] No broken `undefined` values or missing keys in the React render

**Step 3: Check mobile (resize to ~375px)**
- [ ] All grids collapse correctly to single column
- [ ] No layout breakage from removed components

**Step 4: Final commit if any cleanup needed**
```bash
git add -p  # stage any final tweaks
git commit -m "chore: final visual pass after declutter and tone edits"
```

---

## Summary of what's removed / changed

**Removed (entire sections):**
- "Hiring snapshot" aside card in Hero
- 4-card `fitCards` grid in ExperienceSection
- "Project coverage" bullet list in Contact

**Simplified:**
- Proof cards: stat + label only (no verbose copy)
- Project card footers: "Read case study" instead of unexplained labels
- FlagshipWork and Systems section headers (no more echo)
- Contact: single column instead of split layout

**Rewritten (voice pass — narration → presentation):**
- `heroReads` → concrete specifics, not abstract skill labels
- `flagshipProjects[1,2].copy` → "It shows how I..." removed; work presented directly
- `workingStyle[0]` → "wedge" jargon removed
- `credibility` → keyword dumps rewritten as real sentences; "high-bar environment" gone
- `experience[1,2].copy` → "The work shaped...fed directly into" → active voice
- Approach h3 removed (meta-commentary)
- ExperienceSection title → specific, not a slide label
- AmplifyOutcomes paragraph → active voice, no "the work covered"
