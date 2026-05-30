## Executive summary

The site has a small attack surface for a public portfolio: mostly static HTML/CSS, no auth, no cookies, no database, and no first-party server API. I found and patched the main repo-level issues: CSV-derived values in the AI Safety demo are now escaped before `innerHTML` rendering, the resume print action no longer uses a `javascript:` URL, and Cloudflare Worker static-assets headers are now declared in `_headers`. The remaining work is mostly post-deploy verification and future hardening toward a stricter CSP.

## Fixed findings

### SBP-001: CSV-derived values reached `innerHTML` in the AI Safety demo

- Severity: Medium before patch; Low residual
- Location: `ai-safety/index.html:1208-1230`, `ai-safety/index.html:940-1065`
- Evidence: the demo reads a local CSV, normalizes fields including `gender`, `age_band`, and `region`, then renders computed tables with `innerHTML`.
- Impact: because the demo is self-contained and local-only, this is not a persistent stored-XSS issue. A malicious CSV could still execute script in the visitor's browser on the portfolio origin if opened in the demo.
- Fix applied: added `escapeHtml` and `escapeAttr`, then escaped dynamic values used by table/list renderers. See `ai-safety/index.html:900-910`, `ai-safety/index.html:946-1065`.
- Residual risk: remaining `innerHTML` calls now compose mostly static markup plus escaped values. A stronger future fix would build DOM nodes directly and add an automated malicious-CSV regression test.

### SBP-002: Resume print action used a `javascript:` URL

- Severity: Low
- Location: `resume.html:52`, `resume.html:169-170`
- Evidence: the print control previously used `href="javascript:window.print()"`.
- Impact: current code was static and not attacker-controlled, but `javascript:` URLs are a risky pattern and conflict with stricter CSP.
- Fix applied: replaced the link with a button and attached the print action via an event listener.
- Residual risk: low; a stricter future CSP should be easier after inline scripts are externalized.

### SBP-003: Browser security headers were not repo-controlled

- Severity: Medium
- Location: `_headers:1-6`
- Evidence: live headers showed HSTS and `X-Content-Type-Options`, but no visible CSP, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` before this patch.
- Impact: missing policy headers increase blast radius for future XSS, framing, referrer leakage, and unnecessary browser feature access.
- Fix applied: added a Cloudflare Workers static-assets `_headers` file with `X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and a baseline `Content-Security-Policy`.
- Residual risk: the CSP currently allows `'unsafe-inline'` because the repo uses inline scripts in static pages and demos. This is an intentional compatibility tradeoff, not the final ideal state.

## Remaining recommendations

### SBP-004: Externalize inline scripts and tighten CSP

- Severity: Medium
- Location: `index.html:484-499`, `resume.html:160-170`, project page menu scripts, `ai-safety/index.html:536-1248`
- Issue: `_headers` currently uses `script-src 'self' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` to avoid breaking existing inline scripts/styles.
- Recommended mitigation: move shared menu scripts into a same-origin JS file, move inline styles where practical, and replace inline allowance with script hashes or a strict `script-src 'self'`.
- Detection: after deploying a stricter CSP, browse `/`, `/resume.html`, `/ai-safety/`, and `/evals/` and check console CSP violations.

### SBP-005: Add post-deploy security verification

- Severity: Medium
- Location: deployment process; no script currently present
- Issue: Cloudflare dashboard/edge config is in scope, but not fully represented in repo. Runtime checks are the reliable way to catch dashboard drift.
- Recommended mitigation: add a small deploy verification script that checks:
  - `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, and HSTS on `/`, `/ai-safety/`, `/evals/`
  - `404` for `.git/HEAD`, `.git/config`, `.git/logs/HEAD`, `.env`, `.DS_Store`, `.assetsignore`, `.claude/settings.local.json`
  - crawler access for `GPTBot`, `ChatGPT-User`, `ClaudeBot`, and `Googlebot`
- Detection: run it after every `wrangler deploy`.

### SBP-006: Review Cloudflare dashboard-only controls

- Severity: Medium
- Location: Cloudflare dashboard
- Issue: repo files cannot prove account-level MFA, deploy permissions, route ownership, WAF/bot rules, Transform Rules, or whether the Worker URL should be indexed.
- Recommended mitigation: confirm dashboard RBAC/MFA, routes for `www.nitishprasad.com/*` and `nitishprasad.com/*`, and any Worker preview/custom domain exposure. Keep route and header intent documented in repo.
- Detection: compare live headers and route behavior after dashboard changes.

## Positive findings

- No committed `.env` or obvious runtime secret file found in the repo scan.
- `.assetsignore` excludes `.git/`, `.claude/`, `.DS_Store`, `.gitignore`, `.assetsignore`, stale review artifacts, old OG images, security reports, and `docs/`.
- Live spot checks returned `404` for `.git/HEAD`, `.git/config`, `.git/logs/HEAD`, `.DS_Store`, `.assetsignore`, and `.claude/settings.local.json`.
- External `_blank` links generally use `rel="noopener"` or `rel="noreferrer"`.
- `robots.txt`, `sitemap.xml`, and `llms.txt` match the intended public crawlability posture.

## Verification performed

- `rg` scans for dangerous sinks, secrets, headers, and `javascript:` URLs.
- Live `curl -I` checks for `/`, `/ai-safety/`, `/evals/`, apex redirect, HTTP-to-HTTPS redirect, crawler user agents, and internal-file 404s.
- Local browser smoke test for `/ai-safety/` showed the demo loads and initializes: title `AI Safety Audit Tool`, status `Scenario: Hiring Screening | attr=gender | records=420`, verdict `BLOCK`.
- `git diff --check` passed.
- `wrangler deploy --dry-run --name nitishprasad-website --assets . --route 'www.nitishprasad.com/*' --route 'nitishprasad.com/*' --compatibility-date 2026-05-16` passed and showed the Worker static assets binding.

## Sources

- Cloudflare Workers Static Assets headers docs: https://developers.cloudflare.com/workers/static-assets/headers/
- Cloudflare Workers Static Assets configuration docs: https://developers.cloudflare.com/workers/static-assets/binding/
