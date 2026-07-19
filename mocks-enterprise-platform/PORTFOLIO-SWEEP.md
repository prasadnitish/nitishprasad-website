# Portfolio cohesion and UX sweep

**Reviewed:** 2026-07-12  
**Surfaces:** live homepage, six live case pages, resume, archive, live Eval Control Tower, local website source, and the six enterprise-platform PRDs

## Executive decision

The new projects fit the portfolio if the website presents them as one enterprise AI platform program. They do not fit as six additional peer-level case studies.

The current site already asks a visitor to understand:

- a Staff and Principal capability model;
- a seven-step product-decision pattern;
- six case studies;
- six artifact links;
- four operating principles;
- five persistent navigation destinations.

The desktop homepage is 9,804 pixels tall at a 1,728-pixel viewport. The mobile homepage is 7,613 pixels tall at 390 pixels wide. Adding six more equal-weight projects would weaken the recruiter path and bury the strongest proof.

## Recommended portfolio model

### One platform program

**Enterprise AI Platform** becomes the umbrella product strategy and the primary forward-looking case.

It owns:

- the internal platform adoption guide;
- the three-year capability roadmap;
- the migration and compatibility contract;
- the shared KPI tree and economics model;
- the stage gates that determine whether each capability scales.

### Five connected capabilities

| Capability | Portfolio placement | Existing proof surface |
|---|---|---|
| LLM Gateway | New anchor capability inside the platform program | SproutRoute model routing and Eval Control Tower economics |
| Agent Observability | Expansion of AI Eval Control Tower | Eval traces plus SproutRoute `agent_runs` |
| Red-Team and Compliance Gate | Expansion of AI Safety Audit Tool | Existing 540-case benchmark and launch verdicts |
| GraphRAG Knowledge Layer | Evolution of RAG Guardrails | Existing retrieval, guardrail, and trace case |
| Multi-Agent Runtime and MCP | Implemented SproutRoute capability | Hosted `plan_trip`, `get_agent_trace`, and handoff trace |

### Three product proofs

- **Amplify:** enterprise workflow, adoption, commercial scale, and embedded distribution.
- **SproutRoute:** AI boundaries, model routing, agents, observability source data, and production operations.
- **Sprout Math:** product restraint, privacy, offline architecture, and native craft.

The product proofs show that the platform strategy comes from real product decisions. They remain visible without competing with every platform component for top-level navigation.

## Information architecture recommendation

### Primary navigation

Use four destinations:

1. **Work**: three product proofs.
2. **AI Platform**: operating model plus five capabilities.
3. **About**: leadership scope, background, and principles.
4. **Resume**: recruiter handoff.

Move Archive, legal pages, tools, and secondary artifacts into the footer or case-page related links.

### Homepage sequence

1. Two-line positioning statement and two actions.
2. Enterprise AI Platform overview with five expandable capabilities.
3. Three product proofs.
4. Evidence and outcomes.
5. Short leadership profile.
6. Contact.

Remove separate homepage sections for role signal, signal, artifact gallery, and operating model. Their best content moves into the platform overview, product proof cards, and About page.

## Page-level changes

### Homepage

- Replace six equal case links with one platform program and three product proofs.
- Remove the seven-chip decision pattern. Express the model through the platform flow.
- Replace hover-dependent proof previews with tap and keyboard-accessible expansion.
- Remove the duplicate artifact gallery. Put artifacts inside the relevant case.
- Cut the page to roughly four major chapters before contact.

### Enterprise AI Platform overview

Create a new overview page with:

- the capability map;
- three-year roadmap;
- adoption and migration path;
- business scorecard;
- one evidence link per component;
- explicit prototype, pilot, and future-state labels.

### AI Eval Control Tower

Position it as the platform's decision and evidence layer. Add:

- gateway, observability, red-team, GraphRAG, and agent-runtime inputs;
- policy and release-decision outputs;
- service, environment, policy, dataset, and evidence versions;
- release coverage, cost per successful request, and diagnosis-time measures;
- the planned observability waterfall.

Fix the current copy that says, “In production, this page should link…” because the live production page already links to `/evals/`.

### SproutRoute

- Keep the existing case as a product proof.
- Add the implemented MCP and agent-runtime evidence as the latest architecture stage.
- Link to the platform overview for future identity, DLP, tenancy, and gateway work.
- Do not claim those enterprise controls are implemented in SproutRoute v1.

### RAG Guardrails

- Rename the evolution path to “Knowledge Grounding: Guardrails to GraphRAG.”
- Keep the current vector-RAG case as the baseline.
- Add ontology, multi-hop evaluation, tenant isolation, write contention, and subgraph caching as the next validation layer.

### AI Safety Audit Tool

- Reframe it as the release-integrity capability.
- Add the automated red-team and compliance control map.
- Separate technical control results from legal compliance approval.
- Show CI tiers, evidence retention, owner routing, and exception expiry.

### Amplify and Sprout Math

Keep both focused. Do not force the new platform components into these pages. Amplify supplies organizational-scale and adoption evidence; Sprout Math supplies privacy and product-restraint evidence.

## Live UX findings

### High priority

- The homepage has seven large chapters and 35 links, producing a long recruiter path.
- Primary navigation changes by case family, so users lose a stable site map.
- The mobile header exposes all navigation destinations instead of using a compact adaptive pattern.
- Several sections rely on hover or scroll animation to reveal detail.
- The full-page mobile capture shows content fading during scroll-driven states; reduced-motion and no-JavaScript states need first-class validation.

### Medium priority

- Repeated abstract headings delay evidence.
- “Signal,” “proof path,” “artifacts,” and “operating model” overlap conceptually.
- The archive has 28 links and acts as a second navigation system.
- Project status is inconsistent: shipped, prototype, live tool, and future work appear at the same visual level.
- Sitemap dates remain at 2026-05-29 despite newer portfolio changes.

## Mock directions

### Option A: Platform Field Manual

Warm editorial design. Best for Principal and Staff PM recruiting because it gives strategy, evidence, and organizational scale equal weight. Uses an asymmetric hero, pinned capability narrative, and stacked evidence cases.

### Option B: Operating System

Dark technical command surface. Best for AI infrastructure and platform roles. Uses a split hero, systems-map language, an expandable capability rail, and operational telemetry motifs.

### Option C: Decision Brief

Bright executive presentation. Best for fast recruiter comprehension. Uses a centered narrative, a concise platform thesis, product-proof filmstrip, and scannable business outcomes.

## Recommendation

Build **Option A, Platform Field Manual**, with two borrowings:

- Option B's capability map for the Enterprise AI Platform page.
- Option C's concise recruiter summary and evidence strip for the homepage.

This combination keeps the portfolio distinctive while shortening the path from positioning to proof.
