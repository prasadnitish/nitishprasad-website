# nitishprasad.com – Edit Plan

## Global framing changes

1. Clarify solo ownership across projects
   - Add to hero, under the main sentence:
     - `For every project here, I individually conceptualized the product, designed the system, and wrote the production code end to end.`
   - Rationale: Makes “builder PM” explicit and resolves ambiguity about team vs. solo work.

2. Calibrate scope and budget ownership (current role)
   - In **Current focus** (Experience section), change:
     - `Senior Product Manager at Amazon. Turned Amplify from a dashboard request into a platform-shaped AI product with real operating leverage.`
   - To:
     - `Senior Product Manager at Amazon. I lead seller incentive programs for the US 3P business with a nine-figure annual budget and turned Amplify from a dashboard request into a platform-shaped AI product with real operating leverage.`
   - Under **May 2025 – Present · Senior Product Manager, Fees**, add a new bullet after the first paragraph:
     - `Own end-to-end strategy and design for US 3P seller incentive programs, managing a nine-figure annual budget and tying incentives to seller growth and P&L impact.`

3. Make “Principal-level” claim feel grounded
   - Under **HIRING SNAPSHOT**, after “What stands out” bullet list, add:
     - `Currently titled Senior PM at Amazon; portfolio and scope are calibrated for Principal/Staff PM roles in AI platforms and marketplace economics.`
   - Rationale: Preempts recruiter concern about title vs. claimed level.

---

## Hero and navigation

4. Fix tiny hero/nav oddities
   - Top-left text currently renders as:
     - `Nitish` on one line and `. ` on the next.
   - Change the label to a cleaner single token:
     - `Nitish Prasad`
   - Ensure the dot after your name is removed in the anchor text.

5. Hero CTA hierarchy
   - Currently:
     - `View Amplify` `View Case Studies` `Open Resume`
   - Change to:
     - Make **View Amplify** primary visually.
     - Demote others slightly (e.g., second line or reduced emphasis).
   - Optional microcopy tweak:
     - `View Amplify (Flagship AI Platform Case Study)`

---

## Selected Case Studies block

6. Clean up numbering formatting
   - Current:
     - `SELECTED CASE STUDIES[**1  .  Amplify**...`
   - Ensure a space between label and first item and remove stray line breaks so it reads:
     - `SELECTED CASE STUDIES`
     - `**1. Amplify** – Principal-level product judgment...`
   - Do similarly for **2. SproutRoute** and **3. MathQuest Kids**.

7. Clarify what each case study proves
   - For Amplify subtitle:
     - Current: `Principal-level product judgment, AI platform thinking, and measurable business impact.`
     - Keep as-is (strong).
   - For SproutRoute subtitle:
     - Current: `0→1 execution range, shipping speed, and end-to-end product building.`
     - Change to:
       - `0→1 execution range, shipping speed, and full-stack end-to-end product building.`
   - For MathQuest subtitle:
     - Current: `Product craft, constrained UX decisions, and thoughtful platform boundaries.`
     - Add “offline-first” for clarity:
       - `Product craft, constrained UX decisions, offline-first constraints, and thoughtful platform boundaries.`

---

## Flagship Work section

8. Amplify tile – make solo/system role explicit
   - Current tile summary:
     - `Started as a dashboard request. I pushed it into an AI seller intelligence platform, chose the operating model that made the economics work, and built toward Salesforce integration instead of another disconnected tool.`
   - Change to:
     - `Started as a dashboard request. I pushed it into an AI seller intelligence platform, chose the operating model that made the economics work, and drove the path toward Salesforce integration instead of another disconnected tool.`
   - Rationale: “Drove the path” reads less like you owned Salesforce engineering but keeps strong ownership.

9. SproutRoute tile – emphasize full-stack + solo
   - Current:
     - `A full-stack AI trip planner I shipped end to end in ten weeks. It shows how I find the product wedge, make the right tradeoffs, and get the product shipped.`
   - Change to:
     - `A full-stack AI trip planner I designed, architected, and built end to end in ten weeks. It shows how I find the product wedge, make the right tradeoffs, and get the product shipped.`

10. MathQuest tile – emphasize you implemented it
    - Current:
      - `An offline-first iPad math app for kids. It shows how I handle learning UX, privacy, determinism, and first-version focus without overbuilding.`
    - Change to:
      - `An offline-first iPad math app for kids that I designed and implemented in SwiftUI. It shows how I handle learning UX, privacy, determinism, and first-version focus without overbuilding.`

11. Metrics formatting consistency
    - Current line:
      - `**99%**Infrastructure cost reduction`
    - Change to:
      - `**99%** infrastructure cost reduction`
    - Do the same for:
      - `**1,600+**Amplify users...` → `**1,600+** Amplify users...`
      - `**<500ms**P95 latency target achieved` → `**<500ms** P95 latency target achieved`
      - `**45→5 min**Prep time saved per AM call` → `**45→5 min** prep time saved per AM call`

12. Compact the Amplify metrics bullets grammatically
    - Consider changing:
      - `Made a system-level operating model decision that cut annual AI infra from roughly $60K to $500.`
    - To:
      - `Made a system-level operating model decision that cut annual AI infra from roughly $60K to $500 while preserving latency and quality.`
    - Rationale: Ties decision to tradeoffs you care about.

---

## “How I work” and credibility copy

13. Bullet formatting cleanup
    - Current bullets each start with `*   •` (double markers).
    - In your source markdown/HTML, reduce to a single bullet character:
      - `- I usually start by reframing the problem...`
      - `- I stay close enough to the system design...`
      - `- I care about day-two product reality...`
      - `- I am most useful when a team needs product judgment and technical fluency in the same room.`

14. Minor wording polish
    - Current:
      - `I stay close enough to the system design to challenge the operating model, not just the roadmap.`
    - Optional change:
      - `I stay close to system design so I can challenge the operating model, not just the roadmap.`

---

## Experience section details

15. Add budget line (already described above)
    - Ensure the new incentive-program bullet follows the Amplify bullet to show both product and economics scope.

16. Clarify “executive reviews”
    - Current (CXBT role):
      - `Led strategic research across seller and vendor ecosystems. The work shaped roadmap and information-architecture decisions and fed directly into senior-leadership reviews.`
    - Optional change:
      - `Led strategic research across seller and vendor ecosystems. The work shaped roadmap and information-architecture decisions and fed directly into senior leadership reviews.`  
        (Remove hyphen in “senior-leadership” if you want consistency with standard corporate phrasing.)

17. Minor hyphenation cleanup
    - `Multi-region` appears in a few places; keep this consistent (don’t mix `multi-region` and `multi region`).
    - `platform-shaped` appears once. It’s fine but a bit unusual; you can keep it for voice, just ensure it’s consistently hyphenated.

---

## Supporting Systems section

18. Add a one-line framing sentence upfront
    - Current intro:
      - `Live demos and technical systems for evaluation, safety, and release decisions.`
    - Add immediately after:
      - `I designed the architectures and built the working implementations myself to test how these systems would behave in real release workflows.`

19. Microcopy tweaks (optional)
    - AI Eval Control Tower:
      - Consider: `Evaluation infrastructure for teams that need model quality, drift, latency, and release criteria in one place, not scattered across ad hoc dashboards.`
    - RAG Pipeline:
      - Current is strong; you can leave as-is.
    - AI Safety Audit Tool:
      - Current is strong; you can leave as-is.

---

## Contact section

20. Clarify openness and role types
    - After:
      - `Email is the fastest path. LinkedIn and GitHub are here if you want the broader context.`
    - Add:
      - `Open to Principal/Staff PM and AI Product Lead roles (Seattle or remote), especially where marketplace economics, AI platforms, and 0→1 to scale execution intersect.`

---

## Small consistency / style tweaks

21. Numbers and symbols
    - Ensure `0→1` uses the same arrow glyph everywhere (looks consistent now; just keep an eye on encoding).
    - Ensure spaces around symbols are consistent (e.g., `10+ years`, not `10+years`).

22. Section headings capitalization
    - Headings like `FLAGSHIP WORK`, `EXPERIENCE`, `SUPPORTING SYSTEMS` are ALL CAPS, while subheadings use Title Case. This is fine stylistically—just keep consistent if you add new sections.

23. Footer line
    - Current:
      - `Product portfolio for live case studies, demos, and shipped systems. ©  2026  Nitish Prasad.`
    - Optional small polish:
      - `Product portfolio of live case studies, demos, and shipped systems. © 2026 Nitish Prasad.`

# PRINCIPAL-LEVEL PRODUCT LEADER · 0→1 AND SCALE · AMAZON

I turn ambiguous 0→1 product bets into scaled systems with measurable business impact.

For every project here, I individually conceptualized the product, designed the system, and wrote the production code end to end.

Most of my work sits where product strategy meets system design. I like the stage where the request is still fuzzy, the operating model is still unsettled, and the product needs someone to narrow the real problem.

That has meant different things in different products: turning Amplify from a dashboard request into an AI seller intelligence platform, shipping SproutRoute end to end in ten weeks, and building MathQuest as a privacy-first offline iPad app for kids.

[View Amplify](https://www.nitishprasad.com/project-amplify.html) · [View Case Studies](https://www.nitishprasad.com/#work) · [Open Resume](https://www.nitishprasad.com/resume.html)

---

## HIRING SNAPSHOT

**Best-fit roles**

Principal PM, Staff PM, Lead PM, AI Product Lead, Technical Product Lead  

**Core strengths**

0→1 product strategy, AI platform design, system tradeoffs, customer workflow thinking, scaled execution  

**What stands out**

10+ years at Amazon, measurable outcomes, technical fluency, solo end-to-end builds, and a habit of pushing beyond the first framing of the problem.  
Currently titled Senior PM at Amazon; portfolio and scope are calibrated for Principal/Staff PM roles in AI platforms and marketplace economics.

