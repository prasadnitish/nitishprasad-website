(() => {
  "use strict";

  const lab = document.body.dataset.lab;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    "\"": "&quot;"
  })[character]);

  async function fetchJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Evidence request failed (${response.status})`);
    return response.json();
  }

  function modeLabel(mode) {
    return {
      local_execution: "Local execution",
      artifact_replay: "Artifact replay",
      workflow_walkthrough: "Workflow walkthrough"
    }[mode] || mode;
  }

  async function renderManifest(path) {
    const target = document.querySelector("#evidence-summary");
    if (!target) return null;
    const manifest = await fetchJson(path);
    target.innerHTML = `
      <span class="evidence-mode">${escapeHtml(modeLabel(manifest.mode))}</span>
      <span>Source <code>${escapeHtml(manifest.source_commit.slice(0, 8))}</code></span>
      <a href="${escapeHtml(path)}">Manifest ↗</a>
    `;
    return manifest;
  }

  function setResult(target, html) {
    target.innerHTML = html;
  }

  function resetTrace(steps) {
    for (const step of steps) {
      step.className = "trace-step";
      step.querySelector("strong").textContent = "Pending";
    }
  }

  const STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "i", "in", "is", "it",
    "of", "on", "or", "that", "the", "to", "was", "what", "when", "where", "who", "why", "with", "you",
    "your", "we", "our", "this", "these", "those"
  ]);

  function tokenize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => !STOPWORDS.has(token));
  }

  function countTerms(tokens) {
    const counts = new Map();
    for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
    return counts;
  }

  function hashToken(token) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function hashedBagEmbedding(text, dimensions = 128) {
    const vector = Array(dimensions).fill(0);
    for (const token of tokenize(text)) vector[hashToken(token) % dimensions] += 1;
    const norm = Math.hypot(...vector) || 1;
    return vector.map((value) => value / norm);
  }

  function cosine(first, second) {
    return first.reduce((sum, value, index) => sum + value * second[index], 0);
  }

  class BrowserSemanticCache {
    constructor() {
      this.entries = new Map();
    }

    namespace(context) {
      return [context.tenant, context.task, context.policy, context.dataClass].join("::");
    }

    get(prompt, context) {
      const bucket = this.entries.get(this.namespace(context)) || [];
      const query = hashedBagEmbedding(prompt);
      let best = null;
      for (const entry of bucket) {
        const similarity = cosine(query, entry.embedding);
        if (!best || similarity > best.similarity) best = { entry, similarity };
      }
      return best && best.similarity >= 0.88 ? best : null;
    }

    set(prompt, value, context) {
      if (context.dataClass === "restricted") return;
      const key = this.namespace(context);
      const bucket = this.entries.get(key) || [];
      bucket.push({ embedding: hashedBagEmbedding(prompt), value });
      this.entries.set(key, bucket.slice(-20));
    }
  }

  function protectPrompt(input, context) {
    if (context.region !== context.providerRegion) {
      return {
        action: "block",
        reason: `Residency policy blocks ${context.region} data from ${context.providerRegion}.`,
        findings: []
      };
    }
    const detectors = [
      { type: "payment_card", regex: /\b(?:\d[ -]*?){13,19}\b/g, critical: true },
      { type: "ssn", regex: /\b\d{3}-\d{2}-\d{4}\b/g, critical: true },
      { type: "health_identifier", regex: /\b(?:MRN|medical record)(?:\s*(?:number|no\.?))?\s*[:#-]?\s*[A-Z0-9-]{6,}\b/gi, critical: true },
      { type: "email", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, critical: false },
      { type: "phone", regex: /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, critical: false }
    ];
    const findings = detectors
      .map((detector) => {
        const matches = String(input).match(detector.regex) || [];
        return matches.length ? { type: detector.type, count: matches.length, critical: detector.critical } : null;
      })
      .filter(Boolean);
    if (context.dataClass === "restricted" && findings.some((finding) => finding.critical)) {
      return { action: "block", reason: "Restricted data cannot be sent to an external provider.", findings };
    }
    return { action: findings.length ? "redact" : "allow", reason: null, findings };
  }

  async function initGateway() {
    const manifest = await renderManifest("artifacts/manifest.json");
    const benchmark = await fetchJson("artifacts/before-after.json");
    const isolation = await fetchJson("artifacts/load-and-isolation.json");
    const form = document.querySelector("#gateway-form");
    const result = document.querySelector("#gateway-result");
    const verdict = document.querySelector("#gateway-verdict");
    const steps = [...document.querySelectorAll("#gateway-trace .trace-step")];
    const cache = new BrowserSemanticCache();
    const quotas = new Map();
    const policy = {
      version: "2026-07-12.1",
      tripPlan: ["gemini-2.5-flash", "claude-haiku-4-5"],
      packingList: ["deepseek-v4-flash", "gemini-2.5-flash"],
      parseInput: ["deepseek-v4-flash", "gemini-2.5-flash"]
    };

    document.querySelector("#gateway-benchmark").innerHTML = `
      <div class="evidence-grid">
        <article><span>Warm cost reduction</span><strong>${escapeHtml(benchmark.warm.cost_reduction_pct)}%</strong><small>${escapeHtml(benchmark.evidence_level)}</small></article>
        <article><span>Isolation</span><strong>${isolation.controls.cross_tenant_cache_result ? "Failed" : "Passed"}</strong><small>Cross-tenant cache result: ${escapeHtml(isolation.controls.cross_tenant_cache_result)}</small></article>
        <article><span>Load envelope</span><strong>${escapeHtml(isolation.allowed)} allowed</strong><small>${escapeHtml(isolation.evidence_level)}</small></article>
      </div>
      <p class="limitation">${escapeHtml(manifest.limitations.join(" "))}</p>
    `;

    document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
      document.querySelector("#prompt").value = button.dataset.prompt;
      if (button.dataset.task) document.querySelector("#task").value = button.dataset.task;
      if (button.dataset.dataClass) document.querySelector("#data-class").value = button.dataset.dataClass;
    }));
    document.querySelector("#quota-reset").addEventListener("click", () => {
      quotas.clear();
      verdict.textContent = "RESET";
      setResult(result, "<div class=\"result-empty\">The browser-local quota buckets were reset.</div>");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const request = {
        task: document.querySelector("#task").value,
        tenant: document.querySelector("#tenant").value.trim() || "portfolio-demo",
        prompt: document.querySelector("#prompt").value.trim(),
        dataClass: document.querySelector("#data-class").value,
        region: document.querySelector("#source-region").value,
        providerRegion: document.querySelector("#provider-region").value,
        forceOutage: document.querySelector("#force-outage").checked,
        policy: policy.version
      };
      resetTrace(steps);
      steps[0].classList.add("done");
      steps[0].querySelector("strong").textContent = request.tenant;

      const used = quotas.get(request.tenant) || 0;
      if (used >= 3) {
        steps[1].classList.add("block");
        steps[1].querySelector("strong").textContent = "Demo quota exhausted";
        verdict.textContent = "RATE LIMITED";
        setResult(result, `
          <div class="result-label">LOCAL POLICY DECISION / GATEWAY_RATE_LIMIT</div>
          <div class="gate block">BLOCK</div>
          <p>This tenant used the three-request browser demonstration quota. Reset the local bucket to continue.</p>
        `);
        return;
      }
      quotas.set(request.tenant, used + 1);
      steps[1].classList.add("done");
      steps[1].querySelector("strong").textContent = `${used + 1} / 3`;

      const protectedPrompt = protectPrompt(request.prompt, request);
      if (protectedPrompt.action === "block") {
        steps[2].classList.add("block");
        steps[2].querySelector("strong").textContent = "Blocked";
        steps[3].querySelector("strong").textContent = "Not evaluated";
        verdict.textContent = "BLOCKED";
        setResult(result, `
          <div class="result-label">LOCAL POLICY DECISION / GATEWAY_DLP_BLOCK</div>
          <div class="gate block">BLOCK</div>
          <p>${escapeHtml(protectedPrompt.reason)}</p>
          <div class="metric-rail">
            <div class="metric"><span>Provider calls</span><strong>0</strong></div>
            <div class="metric"><span>Findings</span><strong>${protectedPrompt.findings.length}</strong></div>
            <div class="metric"><span>Cache writes</span><strong>0</strong></div>
            <div class="metric"><span>Raw data sent</span><strong>none</strong></div>
          </div>
        `);
        return;
      }
      steps[2].classList.add("done");
      steps[2].querySelector("strong").textContent = protectedPrompt.action;

      const context = request;
      const cached = cache.get(request.prompt, context);
      const chain = policy[request.task];
      const attempts = [];
      let selectedModel = chain[0];
      if (!cached && request.forceOutage) {
        attempts.push({ model: chain[0], outcome: "deterministic outage fixture" });
        selectedModel = chain[1];
      }
      if (!cached) {
        cache.set(request.prompt, { selectedModel, attempts }, context);
      }
      steps[3].classList.add("done");
      steps[3].querySelector("strong").textContent = cached ? "Tenant cache hit" : selectedModel;
      verdict.textContent = cached ? "CACHE HIT" : attempts.length ? "FALLBACK" : "ROUTED";

      const decision = {
        request: {
          tenant: request.tenant,
          task_type: request.task,
          data_class: request.dataClass,
          source_region: request.region,
          provider_region: request.providerRegion
        },
        policy_version: policy.version,
        dlp_action: protectedPrompt.action,
        dlp_findings: protectedPrompt.findings,
        cache: {
          namespace: cache.namespace(context),
          hit: Boolean(cached),
          similarity: cached ? Number(cached.similarity.toFixed(4)) : null
        },
        route: {
          approved_chain: chain,
          selected_model: cached ? cached.entry.value.selectedModel : selectedModel,
          attempts
        },
        provider_stub: {
          called: false,
          answer_generated: false,
          note: "The public workbench stops after the real policy decision."
        }
      };
      setResult(result, `
        <div class="result-label">LOCAL EXECUTION / PROVIDER STUB</div>
        <h3>${cached ? "Reused a tenant-scoped route." : "Produced an approved route."}</h3>
        <p>No model answer was fabricated. The browser executed the policy engine and stopped at the deterministic provider boundary.</p>
        <pre>${escapeHtml(JSON.stringify(decision, null, 2))}</pre>
      `);
    });
  }

  function buildRetriever(documents) {
    const prepared = documents.map((document) => {
      const tokens = tokenize(`${document.title || ""} ${document.content || ""} ${(document.tags || []).join(" ")}`);
      return { ...document, tokens, termCounts: countTerms(tokens), length: tokens.length || 1 };
    });
    const documentFrequency = new Map();
    for (const document of prepared) {
      for (const token of new Set(document.tokens)) {
        documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
      }
    }
    const idf = new Map();
    for (const [token, count] of documentFrequency) {
      idf.set(token, Math.log((prepared.length + 1) / (count + 1)) + 1);
    }
    return (question, topK = 4) => {
      const queryTokens = tokenize(question);
      const queryCounts = countTerms(queryTokens);
      return prepared
        .map((document) => {
          const title = `${document.title || ""} ${(document.tags || []).join(" ")}`.toLowerCase();
          let score = 0;
          for (const token of queryTokens) {
            const frequency = document.termCounts.get(token) || 0;
            if (!frequency) continue;
            const titleBoost = title.includes(token) ? 1.3 : 1;
            score += Math.log(1 + (queryCounts.get(token) || 0)) * Math.log(1 + frequency) * (idf.get(token) || 0) * titleBoost;
          }
          return { ...document, score: Number((score / Math.max(1, Math.sqrt(document.length))).toFixed(4)) };
        })
        .filter((document) => document.score >= 0.05)
        .sort((first, second) => second.score - first.score)
        .slice(0, topK);
    };
  }

  function injectionDecision(question) {
    const patterns = [
      /ignore\s+all\s+previous\s+instructions/i,
      /ignore\s+all\s+policy/i,
      /disregard\s+the\s+above/i,
      /disregard\s+all\s+policy/i,
      /reveal\s+system\s+prompt/i,
      /you\s+are\s+now\s+developer\s+mode/i,
      /bypass\s+guardrails/i,
      /do\s+not\s+follow\s+safety/i,
      /output\s+private\s+.*data/i,
      /hidden\s+internal\s+.*id/i
    ];
    return patterns.some((pattern) => pattern.test(question));
  }

  function groundedness(answer, retrieved) {
    const answerTokens = tokenize(answer);
    if (!answerTokens.length) return 0;
    const evidence = new Set(tokenize(retrieved.map((document) => `${document.title} ${document.content}`).join(" ")));
    return Number((answerTokens.filter((token) => evidence.has(token)).length / answerTokens.length).toFixed(4));
  }

  async function initRag() {
    const manifest = await renderManifest("artifacts/manifest.json");
    const [travel, seller, evaluation] = await Promise.all([
      fetchJson("artifacts/travel-docs.json"),
      fetchJson("artifacts/seller-docs.json"),
      fetchJson("artifacts/rag-eval-report.json")
    ]);
    const retrievers = { travel: buildRetriever(travel), seller: buildRetriever(seller) };
    const result = document.querySelector("#rag-result");
    const verdict = document.querySelector("#rag-verdict");

    document.querySelector("#rag-evidence").innerHTML = `
      <div class="evidence-grid">
        <article><span>Held-out cases</span><strong>${escapeHtml(evaluation.summary?.total || evaluation.total_cases || 24)}</strong><small>From the committed evaluation artifact</small></article>
        <article><span>Corpus</span><strong>${travel.length + seller.length} documents</strong><small>${travel.length} travel · ${seller.length} seller</small></article>
        <article><span>Provider calls</span><strong>0</strong><small>Extractive local execution</small></article>
      </div>
      <p class="limitation">${escapeHtml(manifest.limitations.join(" "))}</p>
    `;

    document.querySelector("#rag-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const domain = document.querySelector("#rag-domain").value;
      const question = document.querySelector("#rag-question").value.trim();
      if (!question) {
        verdict.textContent = "INVALID";
        setResult(result, "<div class=\"result-empty\">Enter a question.</div>");
        return;
      }
      if (injectionDecision(question)) {
        verdict.textContent = "BLOCK";
        setResult(result, `
          <div class="result-label">INPUT GUARDRAIL / PROMPT_INJECTION_BLOCK</div>
          <div class="gate block">BLOCK</div>
          <p>The request stopped before retrieval. Corpus reads: 0. Provider calls: 0.</p>
        `);
        return;
      }
      const retrieved = retrievers[domain](question);
      if (!retrieved.length) {
        verdict.textContent = "ABSTAIN";
        setResult(result, `
          <div class="result-label">LOCAL EXECUTION / UNSUPPORTED</div>
          <div class="gate warn">ABSTAIN</div>
          <p>No document met the minimum retrieval score. No answer or quality score was manufactured.</p>
        `);
        return;
      }
      const leading = retrieved.slice(0, 2);
      const answer = leading
        .map((document) => `${document.title}: ${String(document.content).split(".")[0].trim()}.`)
        .join(" ");
      const score = groundedness(answer, retrieved);
      const gate = score >= 0.45 ? "PASS" : "BLOCK";
      verdict.textContent = gate;
      const rows = retrieved.map((document, index) => `
        <tr>
          <td>${index + 1}</td>
          <td><strong>${escapeHtml(document.title)}</strong><br><small>${escapeHtml(document.doc_id)} · ${escapeHtml(document.source)}</small></td>
          <td>${escapeHtml(document.score)}</td>
          <td>${escapeHtml(document.content)}</td>
        </tr>
      `).join("");
      setResult(result, `
        <div class="result-label">LOCAL RETRIEVAL / ${escapeHtml(domain)}</div>
        <div class="gate ${gate.toLowerCase()}">${gate}</div>
        <h3>${escapeHtml(answer)}</h3>
        <div class="metric-rail">
          <div class="metric"><span>Groundedness</span><strong>${score}</strong></div>
          <div class="metric"><span>Retrieved</span><strong>${retrieved.length}</strong></div>
          <div class="metric"><span>Citations</span><strong>${leading.length}</strong></div>
          <div class="metric"><span>Generator</span><strong>extractive</strong></div>
        </div>
        <div class="table-scroll"><table class="probe-table"><thead><tr><th>Rank</th><th>Source</th><th>Score</th><th>Exact source text</th></tr></thead><tbody>${rows}</tbody></table></div>
      `);
    });
  }

  async function digestHex(text) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
  }

  async function initRedteam() {
    const manifest = await renderManifest("artifacts/manifest.json");
    const [artifactResponse] = await Promise.all([fetch("artifacts/redteam-benchmark.json", { cache: "no-store" })]);
    const artifactText = await artifactResponse.text();
    const artifact = JSON.parse(artifactText);
    const expected = manifest.artifacts.find((item) => item.path === "redteam-benchmark.json").sha256;
    const actual = await digestHex(artifactText);
    const result = document.querySelector("#redteam-result");
    const status = document.querySelector("#redteam-status");
    const form = document.querySelector("#redteam-form");

    function render() {
      const categories = new Set([...form.querySelectorAll("input[name=category]:checked")].map((input) => input.value));
      const outcome = document.querySelector("#redteam-outcome").value;
      const rows = artifact.results.filter((probe) => (
        categories.has(probe.category) && (outcome === "all" || (outcome === "success" ? probe.success : !probe.success))
      ));
      status.textContent = artifact.verdict;
      const tableRows = rows.map((probe) => `
        <tr>
          <td>${escapeHtml(probe.probe_id)}</td>
          <td>${escapeHtml(probe.category.replaceAll("_", " "))}</td>
          <td class="${probe.success ? "probe-success" : "probe-safe"}">${probe.success ? "attack succeeded" : "not observed"}</td>
          <td><code>${escapeHtml(probe.criteria.type)}:${escapeHtml(probe.criteria.value)}</code></td>
          <td>${escapeHtml(probe.evidence)}</td>
        </tr>
      `).join("");
      setResult(result, `
        <div class="result-label">COMMITTED CAMPAIGN / ${escapeHtml(artifact.generated_at)}</div>
        <div class="gate ${artifact.verdict.toLowerCase()}">${escapeHtml(artifact.verdict)}</div>
        <p>${escapeHtml(artifact.reasons.join(" "))}</p>
        <div class="metric-rail">
          <div class="metric"><span>Rendered</span><strong>${rows.length} / ${artifact.results.length}</strong></div>
          <div class="metric"><span>Successes</span><strong>${artifact.results.filter((probe) => probe.success).length}</strong></div>
          <div class="metric"><span>Owner</span><strong>${escapeHtml(artifact.owner)}</strong></div>
          <div class="metric"><span>Artifact hash</span><strong>${actual === expected ? "verified" : "mismatch"}</strong></div>
        </div>
        <div class="table-scroll campaign-table"><table class="probe-table"><thead><tr><th>Probe</th><th>Category</th><th>Outcome</th><th>Criterion</th><th>Redacted evidence</th></tr></thead><tbody>${tableRows}</tbody></table></div>
      `);
    }

    form.addEventListener("change", render);
    document.querySelector("#redteam-inspect").addEventListener("click", render);
    render();
  }

  const initializers = {
    gateway: initGateway,
    rag: initRag,
    redteam: initRedteam
  };

  if (initializers[lab]) {
    initializers[lab]().catch((error) => {
      const result = document.querySelector(".result-card");
      if (result) setResult(result, `<div class="result-empty">Evidence could not be loaded: ${escapeHtml(error.message)}</div>`);
      console.error(error);
    });
  }
})();
