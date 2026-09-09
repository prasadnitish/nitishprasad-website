# Founder-screen redesign · September 8, 2026

## Implemented direction

E, Editorial × Product House. Five distinct responsive layouts and the full color/type/spacing choices live under `mocks/founder-screen/`. The recommendation retains the split hero, brings commercial ownership forward, and moves technical depth below the product stories.

The homepage follows: hero → commercial proof → Amplify / fees / SproutRoute → four operating lines → two consumer builds and two browser labs → IC fit → contact. The original technical demos and case-study routes remain reachable through AI Platform and All work.

## Changes

- Explicit Senior Product Manager at Amazon title; Principal / Staff IC is the target.
- Dated commercial evidence and a dedicated fees/incentives page.
- Amplify starts with the account manager, the decision to replace reporting-only scope, and the measured preparation result. It includes a generalized sponsor failure and recovery, with technical implementation behind a disclosure.
- Prep-time evidence always qualifies the 10-person study. Rollout reach, the separate pilot, and commercial program lifts remain distinct.
- Independent consumer builds demonstrate craft; no user-growth, retention, or family-test result is invented. Old Sprout Math content counts are replaced by a link to the live product inventory.
- Updated homepage/social metadata, resume page, About, consumer introductions, crawler summary, sitemap, and assistant privacy explanation.
- One sticky resume action in the desktop navigation. No floating resume or assistant chip.
- Source-linked portfolio guide with four reviewed answers and an explicitly hypothetical 90-day approach. Native dialog, keyboard containment, Escape, and focus return; no network calls or chat storage. The previous arbitrary-question chat and in-widget contact form are intentionally replaced by this guide and a direct email action. Legacy backend services were not modified.

## Validation

- 7 Node tests: answer scope, title honesty, study qualification, unknown keys, source links, and absence of network/storage behavior.
- 4 Python integration checks: local page/assets/fragment links, unique IDs, semantic basics, selected demo count, mocks, and sitemap.
- JavaScript syntax checks and `git diff --check`.
- Browser inspection at 1440px desktop, 390px mobile, and 320px narrow mobile. Main redesigned pages have no horizontal overflow. These are browser viewport checks, not physical iPhone certification.
- Mobile navigation open/close and Escape; guide questions, selected states, source links, keyboard boundary wrapping, Escape and focus restoration; Amplify disclosure opening.
- Desktop and mobile visual review caught and fixed a PDF-download contrast issue. Fresh asset URLs also prevented the local browser from reusing an older shared stylesheet.
- Both retained live browser labs produced results: model routing returned its modeled route; the grounded-answer lab returned WARN/abstention for insufficient evidence. No paid-model or contact-form submission was made.
- Homepage no longer loads the 117,186-byte GSAP bundle. The navigation replacement is 1,064 bytes. This is an asset-size comparison, not a measured Lighthouse or Core Web Vitals result.

## Boundaries and follow-up

- No new dependencies, external messages, or changes to the consumer apps.
- Existing unrelated dirty files were preserved. Existing PDF/Word resume downloads remain unchanged; their metrics were checked against the revised page.
- EU engineering adaptation is confirmed, but the supplied sources do not explain the specific regional requirements. The public case says so. Exact consumer launch dates and measured consumer adoption are not supplied.
- Release uses the existing parent Cloudflare Worker. Verify the injected guide on both primary pages and nested demo routes. The new static tests belong to this repository; the parent workspace has older source-shape tests for the retired free-form chat UI.
- Reintroducing generative chat would require reconciling the separate legacy knowledge/FAQ source first; it still contains older title, Salesforce, and inference-savings claims. The implemented guide does not read that source.

Source reconciliation and mock theses are recorded in `mocks/founder-screen/README.md`.

## Full-site release

The selected E system also covers the work index, technical and consumer case studies, platform strategy, privacy/legal pages, and branded 404. Technical content retains its diagrams and evidence links. Platform capabilities use native disclosures; diagram lightboxes retain their existing implementation. Public platform strategy is explicitly labeled as a proposed model informed by independent work.

Deployment excludes local skills, development files, tests, and design studies. The existing Worker routing, email bindings, and isolated invitation feature are preserved. The previous production version is the rollback point; use Wrangler deployment history rather than editing asset URLs for a rollback.

Release verification: 16 Node tests, four full-site Python checks, GraphRAG claim validation, and seven evidence manifests with artifact hashes pass. Browser review covers 21 public pages at 390px, selected reading pages at 320px, desktop layouts, native disclosures, menu/Escape, diagram preview, and the Worker-injected guide on home and nested demos. Gateway allow/block and RAG abstention/seller-retrieval paths were exercised. The RAG example now uses an out-of-corpus query, and its seller example selects the seller corpus. Term-matching limitations are stated beside the controls.

Wrangler dry-run passed with the existing Worker bindings. Pre-release production version: `d6ad281f-0d67-4ea5-b347-71d472da43e5`. Public assets exclude local skills and development artifacts. Unrelated invitation headers, robots entry, invitation files, and React lockfile edits remain outside this release commit.
