const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  "\"": "&quot;"
})[character]);

async function fetchText(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Evidence request failed (${response.status})`);
  return response.text();
}

async function fetchJson(path) {
  return JSON.parse(await fetchText(path));
}

async function digestHex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function modeLabel(mode) {
  return {
    local_execution: "Browser lab",
    artifact_replay: "Recorded results",
    workflow_walkthrough: "Workflow walkthrough"
  }[mode] || mode;
}

function renderManifest(target, manifest, manifestPath) {
  target.innerHTML = `
    <span class="evidence-mode">${escapeHtml(modeLabel(manifest.mode))}</span>
    <span>Source <code>${escapeHtml(manifest.source_commit.slice(0, 8))}</code></span>
    <a href="${escapeHtml(manifestPath)}">Source details ↗</a>
  `;
}

function sanitizeTrace(value, expectedTenant) {
  if (!value || typeof value !== "object" || !value.meta || !Array.isArray(value.spans)) {
    throw new Error("Trace must contain meta and spans.");
  }
  if (value.meta.tenant_id !== expectedTenant) {
    throw new Error(`Tenant mismatch: expected ${expectedTenant}.`);
  }
  if (value.spans.length < 1 || value.spans.length > 10000) {
    throw new Error("Trace must contain between 1 and 10,000 spans.");
  }
  const allowedMeta = ["run_id", "tenant_id", "service_id", "environment", "started_at", "total_cost", "source"];
  const meta = Object.fromEntries(allowedMeta.filter((key) => key in value.meta).map((key) => [key, value.meta[key]]));
  const allowedDetails = new Set(["error_code", "fallback_reason"]);
  const spans = value.spans.map((span, index) => {
    if (!span || typeof span !== "object") throw new Error(`Span ${index + 1} is invalid.`);
    const start = Number(span.start_ms);
    const end = Number(span.end_ms);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) {
      throw new Error(`Span ${index + 1} has invalid offsets.`);
    }
    if (!["ok", "error"].includes(span.status)) throw new Error(`Span ${index + 1} has an invalid status.`);
    const detail = span.detail && typeof span.detail === "object"
      ? Object.fromEntries(Object.entries(span.detail).filter(([key]) => allowedDetails.has(key)))
      : null;
    return {
      span_id: String(span.span_id || `span-${index + 1}`).slice(0, 100),
      label: String(span.label || "unnamed").slice(0, 100),
      parent_span_id: span.parent_span_id == null ? null : String(span.parent_span_id).slice(0, 100),
      start_ms: start,
      end_ms: end,
      status: span.status,
      cost: Number.isFinite(Number(span.cost)) ? Number(span.cost) : null,
      detail
    };
  });
  return { meta, spans };
}

async function initObservability() {
  const manifestPath = "artifacts/manifest.json";
  const [manifest, traceText, load] = await Promise.all([
    fetchJson(manifestPath),
    fetchText("artifacts/forced-failure.json"),
    fetchJson("artifacts/trace-load.json")
  ]);
  const expectedHash = manifest.artifacts.find((artifact) => artifact.path === "forced-failure.json").sha256;
  const actualHash = await digestHex(traceText);
  let trace = sanitizeTrace(JSON.parse(traceText), "portfolio");
  let filter = "all";
  const summary = document.querySelector("#evidence-summary");
  const output = document.querySelector("#trace-output");
  const status = document.querySelector("#trace-status");
  const expectedTenant = document.querySelector("#expected-tenant");
  renderManifest(summary, manifest, manifestPath);

  function render() {
    const visible = trace.spans.filter((span) => filter === "all" || span.status === "error");
    const maximum = Math.max(1, ...trace.spans.map((span) => span.end_ms));
    const rows = visible.map((span) => {
      const left = Math.max(0, Math.min(100, (span.start_ms / maximum) * 100));
      const width = Math.max(2, Math.min(100 - left, ((span.end_ms - span.start_ms) / maximum) * 100));
      return `
        <article class="span-row ${span.status}">
          <div>
            <span>${escapeHtml(span.label)}</span>
            <strong>${escapeHtml(span.status)}</strong>
            <small>${escapeHtml(span.start_ms)}–${escapeHtml(span.end_ms)} ms · ${escapeHtml(span.span_id)}</small>
          </div>
          <div class="span-track" aria-label="${escapeHtml(span.label)} relative offset">
            <i style="left:${left}%;width:${width}%"></i>
          </div>
          <pre>${escapeHtml(JSON.stringify(span.detail || {}, null, 2))}</pre>
        </article>
      `;
    }).join("");
    status.textContent = `${visible.length} SPANS`;
    output.innerHTML = `
      <div class="result-label">RUN ${escapeHtml(trace.meta.run_id)} / TENANT ${escapeHtml(trace.meta.tenant_id)}</div>
      <h3>${trace.spans.some((span) => span.status === "error") ? "Failure retained." : "No error span in this trace."}</h3>
      <div class="metric-rail">
        <div class="metric"><span>Started</span><strong>${escapeHtml(trace.meta.started_at || "not provided")}</strong></div>
        <div class="metric"><span>Errors</span><strong>${trace.spans.filter((span) => span.status === "error").length}</strong></div>
        <div class="metric"><span>Trace hash</span><strong>${actualHash === expectedHash ? "verified" : "local import"}</strong></div>
        <div class="metric"><span>Raw payload fields</span><strong>${escapeHtml(load.raw_payload_fields_persisted)}</strong></div>
      </div>
      <p class="limitation">The timeline shows milliseconds elapsed from the start of the trace.</p>
      <div class="span-list">${rows || "<p>No spans match this filter.</p>"}</div>
    `;
  }

  document.querySelector("#trace-load-evidence").innerHTML = `
    <div class="evidence-grid">
      <article><span>Burst attempted</span><strong>${load.burst_attempted.toLocaleString()}</strong><small>${escapeHtml(load.evidence_level)}</small></article>
      <article><span>Errors retained</span><strong>${load.retained_errors}</strong><small>Low-priority successes dropped: ${load.dropped_low_priority_successes.toLocaleString()}</small></article>
      <article><span>Tenant crossovers</span><strong>${load.tenant_crossovers}</strong><small>Buffer limit: ${load.buffer_limit.toLocaleString()}</small></article>
    </div>
    <p class="limitation">The load test simulates collector traffic in one process.</p>
  `;

  document.querySelectorAll("[data-trace-filter]").forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.traceFilter;
    document.querySelectorAll("[data-trace-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    render();
  }));
  document.querySelector("#trace-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("Trace file exceeds the 2 MB browser-local limit.");
      const text = await file.text();
      trace = sanitizeTrace(JSON.parse(text), expectedTenant.value.trim());
      filter = "all";
      status.textContent = "IMPORTED";
      document.querySelector("#trace-import-message").textContent = `${file.name} loaded locally. No bytes were uploaded.`;
      render();
    } catch (error) {
      event.target.value = "";
      document.querySelector("#trace-import-message").textContent = error.message;
    }
  });
  render();
}

function validateEvaluation(value) {
  if (!value || typeof value !== "object" || !value.meta || !value.summary) {
    throw new Error("Evaluation artifact must contain meta and summary.");
  }
  const models = value.summary.per_model || value.per_model;
  if (!models || typeof models !== "object" || !Object.keys(models).length) {
    throw new Error("Evaluation artifact has no per-model evidence.");
  }
  for (const [modelId, model] of Object.entries(models)) {
    for (const field of ["avg_quality", "p50_latency_ms", "p95_latency_ms", "total_cost_usd", "policy_violations"]) {
      if (!Number.isFinite(Number(model[field]))) throw new Error(`${modelId} is missing numeric ${field} evidence.`);
    }
    if (!model.dimension_averages || !Object.keys(model.dimension_averages).length) {
      throw new Error(`${modelId} has no quality-dimension evidence.`);
    }
  }
  return value;
}

async function initEvaluations() {
  const base = "/demos/eval-control-tower/artifacts";
  const manifestPath = `${base}/manifest.json`;
  const manifest = await fetchJson(manifestPath);
  const summary = document.querySelector("#evidence-summary");
  const output = document.querySelector("#eval-output");
  const status = document.querySelector("#eval-status");
  const selector = document.querySelector("#eval-artifact");
  renderManifest(summary, manifest, manifestPath);
  let current = null;
  let sourceLabel = "";

  function recommendation(models) {
    const entries = Object.entries(models);
    const eligible = entries.filter(([, model]) => Number(model.policy_violations) === 0);
    if (!eligible.length) {
      return {
        verdict: "BLOCK",
        title: "No candidate clears the safety floor.",
        detail: "Every recorded model has at least one policy violation. Quality, cost, and latency are not used to override that floor."
      };
    }
    eligible.sort(([, first], [, second]) => Number(second.avg_quality) - Number(first.avg_quality));
    const [id, winner] = eligible[0];
    return {
      verdict: "PASS",
      title: `${winner.name || id} leads the eligible set.`,
      detail: `Highest artifact-recorded quality among models with zero policy violations: ${winner.avg_quality}.`
    };
  }

  function render() {
    const artifact = validateEvaluation(current);
    const models = artifact.summary.per_model || artifact.per_model;
    const decision = recommendation(models);
    const generated = new Date(artifact.meta.generated_at);
    const ageDays = Math.max(0, Math.floor((Date.now() - generated.getTime()) / 86400000));
    const cards = Object.entries(models).map(([id, model]) => `
      <article class="model-card">
        <div><span>${escapeHtml(model.provider || "Provider not recorded")}</span><h3>${escapeHtml(model.name || id)}</h3></div>
        <dl>
          <div><dt>Quality</dt><dd>${escapeHtml(model.avg_quality)}</dd></div>
          <div><dt>P95 latency</dt><dd>${Number(model.p95_latency_ms).toLocaleString()} ms</dd></div>
          <div><dt>Total cost</dt><dd>$${Number(model.total_cost_usd).toFixed(4)}</dd></div>
          <div><dt>Policy violations</dt><dd>${escapeHtml(model.policy_violations)}</dd></div>
        </dl>
      </article>
    `).join("");
    const dimensions = [...new Set(Object.values(models).flatMap((model) => Object.keys(model.dimension_averages)))];
    const dimensionRows = dimensions.map((dimension) => `
      <tr>
        <th>${escapeHtml(dimension.replaceAll("_", " "))}</th>
        ${Object.values(models).map((model) => `<td>${model.dimension_averages[dimension] == null ? "No evidence" : escapeHtml(model.dimension_averages[dimension])}</td>`).join("")}
      </tr>
    `).join("");
    status.textContent = decision.verdict;
    output.innerHTML = `
      <div class="result-label">${escapeHtml(sourceLabel)} / RUN ${escapeHtml(artifact.meta.run_id || "not recorded")}</div>
      <div class="gate ${decision.verdict.toLowerCase()}">${decision.verdict}</div>
      <h2>${escapeHtml(decision.title)}</h2>
      <p>${escapeHtml(decision.detail)}</p>
      <div class="metric-rail">
        <div class="metric"><span>Dataset</span><strong>${escapeHtml(artifact.meta.dataset)}</strong></div>
        <div class="metric"><span>Prompts</span><strong>${escapeHtml(artifact.meta.prompt_count)}</strong></div>
        <div class="metric"><span>Judge</span><strong>${escapeHtml(artifact.meta.judge_model)}</strong></div>
        <div class="metric"><span>Freshness</span><strong>${ageDays} days</strong></div>
      </div>
      <div class="model-grid">${cards}</div>
      <div class="table-scroll"><table class="probe-table"><thead><tr><th>Dimension</th>${Object.keys(models).map((id) => `<th>${escapeHtml(models[id].name || id)}</th>`).join("")}</tr></thead><tbody>${dimensionRows}</tbody></table></div>
      <p class="limitation">Freshness is calculated from the artifact timestamp. The explorer marks no provider result as current model behavior.</p>
    `;
  }

  async function loadCommitted(file, label) {
    current = validateEvaluation(await fetchJson(`${base}/${file}`));
    sourceLabel = label;
    render();
  }

  selector.addEventListener("change", () => {
    const selected = selector.selectedOptions[0];
    loadCommitted(selected.value, selected.textContent).catch((error) => {
      output.innerHTML = `<div class="result-empty">${escapeHtml(error.message)}</div>`;
    });
  });
  document.querySelector("#eval-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Evaluation file exceeds the 5 MB browser-local limit.");
      current = validateEvaluation(JSON.parse(await file.text()));
      sourceLabel = `LOCAL IMPORT ${file.name}`;
      document.querySelector("#eval-import-message").textContent = `${file.name} loaded locally. No bytes were uploaded.`;
      render();
    } catch (error) {
      event.target.value = "";
      document.querySelector("#eval-import-message").textContent = error.message;
    }
  });
  document.querySelector("#eval-source-links").innerHTML = manifest.artifacts.map((artifact) => (
    `<a href="${base}/${escapeHtml(artifact.path)}">${escapeHtml(artifact.name)} ↗</a>`
  )).join("");
  await loadCommitted(selector.value, selector.selectedOptions[0].textContent);
}

const app = document.body.dataset.evidenceApp;
const initializers = { observability: initObservability, evaluations: initEvaluations };
initializers[app]?.().catch((error) => {
  const output = document.querySelector(".result-card");
  if (output) output.innerHTML = `<div class="result-empty">${escapeHtml(error.message)}</div>`;
  console.error(error);
});
