---
target: "https://www.nitishprasad.com/"
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T00-55-52Z
slug: www-nitishprasad-com
---
# Portfolio Motion and UX Review - 2026-06-22

Target: https://www.nitishprasad.com/

Source inspected: `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website`

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Desktop vine and mobile progress help, but active section state is mostly decorative. |
| 2 | Match system / real world | 3 | The language maps well to product judgment and system design. |
| 3 | User control and freedom | 2 | Mobile nav hides most routes; lightbox has weak keyboard control. |
| 4 | Consistency and standards | 3 | Strong visual system, but repeated numbered case markers feel templated. |
| 5 | Error prevention | 2 | Hidden lightbox close button remains focusable before the lightbox opens. |
| 6 | Recognition rather than recall | 2 | Users can scan proof rows, but artifact and screenshot affordances need clearer interaction cues. |
| 7 | Flexibility and efficiency | 2 | Desktop routes are efficient; mobile recruiters lose quick access to Resume, Archive, and case-study routes. |
| 8 | Aesthetic and minimalist design | 3 | Distinct cinematic typography and restraint, with room for richer section-specific interaction. |
| 9 | Error recovery | 2 | Escape closes the lightbox, but there is no dialog state, focus trap, or focus return. |
| 10 | Help and documentation | 3 | Archive, resume, case actions, and evidence paths are useful. |
| **Total** |  | **25/40** | **Strong visual foundation; UX polish and motion system are not yet at the same level.** |

## Anti-Patterns Verdict

This does not read as an obviously AI-generated portfolio. The giant first-fold typography, dark restrained palette, vine progress motif, and actual product screenshots give it a distinctive point of view.

The weak spots are second-order AI tells, not first-order slop:

- Repeated `01 / 02 / 03 / 04` section markers appear across case-study pages and read like generic editorial scaffolding when repeated.
- The proof path and operating model sections are clear but visually similar, so the page can flatten after the strong hero.
- Several artifact cards use dark placeholder-like surfaces rather than a meaningful preview, which undercuts the "Evidence should be easy to inspect" promise.

Deterministic scan:

- `numbered-section-markers` advisory on `ai-eval-control-tower.html`, `project-sproutroute.html`, `project-sproutmath.html`, `project-amplify.html`, and `archive.html`.
- Earlier scan on `project-ai-eval.html` flagged single-font use, but that page is a redirect and should be treated as a false positive for the live experience.

Visual overlay:

- Overlay injection was attempted in the in-app browser but failed because the browser evaluation surface is read-only for mutation. No user-visible overlay was produced.

## Overall Impression

The first fold is memorable and directionally right: it says senior product judgment, not generic portfolio. The biggest opportunity is to turn the rest of the scroll into a guided evaluation journey. Right now, the site has a strong visual identity but only a light interaction model: scroll progress, active vine nodes, hover text color, horizontal strips, and image lightbox.

## What's Working

1. The hero has real presence.
   The H1, right-side summary, and product-surface mosaic immediately separate the site from resume-template portfolios.

2. The proof path is conceptually strong.
   Each case says what was prioritized, tested, and cut, which is exactly the right recruiter-facing framing.

3. Case studies use real evidence.
   SproutRoute screenshots, diagrams, metrics, and decision sections give the site material that can support richer motion without feeling decorative.

## Priority Issues

### [P1] Fix lightbox accessibility before adding more motion

Why it matters: The lightbox is visually hidden with `opacity: 0` and `pointer-events: none`, but its close button remains in the focusable DOM. Keyboard users can tab to an invisible "x" before opening any image.

Fix:

- Keep the lightbox `hidden` or `inert` until opened.
- Prefer a native `<dialog>` or a modal pattern with `aria-modal="true"`.
- Wrap zoomable images in real `<button>` elements or links, not click-only `<img>` handlers.
- Trap focus while open, close on Escape, and return focus to the triggering image.
- Add an explicit visual cue such as "Open full image" on hover and focus.

Implementation area:

- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.js`, especially `setupLightbox()`.
- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.css`, especially `.lightbox`.

Suggested command: `$impeccable harden`

### [P1] Restore mobile route access

Why it matters: On mobile, the homepage nav leaves only "Signal" visible. Recruiters on a phone lose quick access to SproutRoute, Amplify, Resume, and Archive, even though those are high-intent routes.

Fix:

- Add a compact menu button or bottom action rail with `Work`, `Resume`, and `Contact`.
- Keep at least one direct "Resume" or "Contact" route visible on mobile.
- Avoid hiding every non-current route on the homepage.

Implementation area:

- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/index.html`, primary nav.
- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.css`, mobile `.nav-links` rules.

Suggested command: `$impeccable adapt`

### [P2] Turn the proof path into an interactive proof reader

Why it matters: The proof path is the site's strongest content, but it currently behaves like a list. A recruiter should be able to skim it like an evidence index and immediately understand which case to open.

Fix:

- Add a sticky preview pane on desktop that changes when a proof row is hovered, focused, or enters the viewport.
- Use the real screenshot, architecture diagram, or benchmark preview for each row.
- Add keyboard parity: focus a row, preview changes; Enter opens the case.
- On mobile, keep the simple stacked rows but add compact thumbnails or type-specific chips.

Implementation area:

- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/index.html`, `.proof-path`.
- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.css`, `.proof-link`.

Suggested command: `$impeccable animate`

### [P2] Add a real motion grammar, not scattered animation

Why it matters: The site promises cinematic pacing, but the current motion system is mostly progress state and one scroll cue. The page can feel static after the hero.

Fix:

- Add a first-load sequence: brand lockup, vine seed, H1 line groups, right-side summary, surface mosaic. Keep content visible by default and only enhance with transform, clip, opacity, or blur.
- Add section activation states using `IntersectionObserver`: current frame content can shift from muted to active while neighboring frames soften.
- Add proof-row preview transitions and artifact-card reveal transitions tied to focus and viewport entry.
- Respect `prefers-reduced-motion` with instant state changes or short crossfades.

Implementation area:

- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.js`, existing frame observer.
- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.css`, frame, proof path, artifact, and reduced-motion rules.

Suggested command: `$impeccable animate`

### [P2] Replace repeated numbered case-study markers with narrative states

Why it matters: `01 / boundaries`, `02 / shipped flow`, and similar labels are understandable, but repeated across multiple pages they become a template signal. The site has stronger language available.

Fix:

- Use chapter labels that map to the decision arc: `Boundary`, `Flow`, `Architecture`, `Tradeoff`.
- If numbers stay, make them functional: show them in a case-study progress rail and tie them to active section state.
- Vary the section treatment by case type, so SproutRoute, Amplify, and AI Eval do not all feel structurally identical.

Implementation area:

- Case-study HTML files, especially `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/project-sproutroute.html`.

Suggested command: `$impeccable quieter`

### [P3] Make artifact cards inspectable, not just clickable

Why it matters: The artifact strip says evidence should be easy to inspect, but the final cards are dark surfaces with minimal signal. They read less valuable than the screenshot-backed cards.

Fix:

- Give benchmark and safety cards real mini-previews: pass/warn/block bars, score grids, model comparison slivers, or decision memo snippets.
- Add a horizontal progress indicator or drag affordance for the strip.
- On focus, reveal "Open benchmark", "Open safety audit", or "Open archive" labels.

Implementation area:

- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/index.html`, `.artifact-strip`.
- `/Users/nitish/VS Code Projects/tpm-portfolio/nitishprasad-website/vertical-system.css`, `.artifact`.

Suggested command: `$impeccable delight`

## Motion Enhancements Worth Building

1. Hero load choreography
   Sequence: nav settles, vine draws 8-12%, H1 line groups reveal, summary lifts in, mosaic tiles scale from 0.96 to 1.0 with a short stagger.

2. Scroll-linked vine labels
   The vine already tracks progress. Add small chapter labels or tooltips near active nodes on desktop: `Signal`, `Proof`, `Artifacts`, `Operating model`, `Contact`.

3. Proof-path preview rail
   On desktop, the right side can hold a sticky live preview while rows scroll. This makes scanning cases feel like reviewing evidence, not reading a list.

4. Case-study screenshot filmstrip
   SproutRoute screens should feel like a flow. Use a keyboard-accessible carousel or scroll-snap filmstrip with step labels and an "open full image" affordance.

5. Architecture stepper
   For SproutRoute architecture, animate the evolution from V1 to V3 to current state. Highlight what moved from AI generation to deterministic or cached systems.

6. Contact section end-state
   The final frame should feel like a decisive landing, not just another section. Add a subtle route-selection module: `Talk AI systems`, `Review resume`, `Open strongest case`.

## Persona Red Flags

### Mobile recruiter

- High-intent nav routes are hidden on the homepage.
- Resume is not visible in the mobile nav.
- The hero is strong, but the first visible path to work depends on partially visible horizontal tiles.

### Keyboard-only reviewer

- Lightbox images are not focusable controls.
- The hidden lightbox close button is focusable before the modal opens.
- Proof rows are links, but their hover polish does not translate into an equivalent focus-driven preview.

### Principal PM / product leader

- The evidence is strong, but the page does not yet help compare cases by decision type.
- The proof path could expose "AI boundary", "workflow intelligence", "offline restraint", and "eval gate" as filters or visual categories.

## Minor Observations

- The first fold is visually stronger than the middle folds. Add more section-specific interaction after the hero.
- Smooth scroll and scroll snap are pleasant on desktop, but keep mobile movement conservative.
- The reduced-motion media query exists and should be preserved.
- Artifact cards with no imagery need intentional data-visual treatment.

## Questions to Consider

1. Should the homepage optimize for a guided story or fast triage?
   Options: guided cinematic story, recruiter triage, hybrid with a visible "short path".

2. Which proof path should get the richest interaction first?
   Options: SproutRoute as shipped product evidence, AI Eval as AI governance evidence, Amplify as senior PM workflow evidence.

3. How much motion should the portfolio carry?
   Options: restrained premium motion, cinematic scroll narrative, mostly static with richer hover/focus states.
