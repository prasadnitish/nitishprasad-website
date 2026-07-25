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

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

const scenarios = {
  hiring: { seed: 8142, base: 0.54, label: "Hiring screening" },
  lending: { seed: 29311, base: 0.48, label: "Lending risk" },
  support: { seed: 77191, base: 0.58, label: "Support priority" }
};

function generateRows(scenarioId, size) {
  const scenario = scenarios[scenarioId];
  const random = seeded(scenario.seed);
  const genders = ["female", "male", "non_binary"];
  const ages = ["18_29", "30_44", "45_plus"];
  const regions = ["NA", "EU", "APAC"];
  const baselineBias = { female: -0.09, male: 0.05, non_binary: -0.12 };
  const candidateBias = { female: -0.025, male: 0.015, non_binary: -0.035 };
  return Array.from({ length: size }, (_, index) => {
    const genderRoll = random();
    const gender = genderRoll < 0.46 ? genders[0] : genderRoll < 0.93 ? genders[1] : genders[2];
    const ageRoll = random();
    const ageBand = ageRoll < 0.33 ? ages[0] : ageRoll < 0.78 ? ages[1] : ages[2];
    const regionRoll = random();
    const region = regionRoll < 0.42 ? regions[0] : regionRoll < 0.72 ? regions[1] : regions[2];
    const actual = random() < scenario.base ? 1 : 0;
    const noise = (random() - 0.5) * 0.32;
    const baselineScore = clamp((actual ? 0.69 : 0.31) + baselineBias[gender] + noise, 0, 1);
    const candidateScore = clamp((actual ? 0.72 : 0.28) + candidateBias[gender] + noise * 0.8, 0, 1);
    return {
      record_id: `${scenarioId}-${index + 1}`,
      actual_label: actual,
      baseline_pred: baselineScore >= 0.5 ? 1 : 0,
      candidate_pred: candidateScore >= 0.5 ? 1 : 0,
      gender,
      age_band: ageBand,
      region
    };
  });
}

function safeDivide(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function calculateModel(rows, attribute, predictionField) {
  const groups = new Map();
  for (const row of rows) {
    const key = String(row[attribute] || "unknown");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const perGroup = [...groups.entries()].map(([group, records]) => {
    let truePositive = 0;
    let falsePositive = 0;
    let falseNegative = 0;
    let predictedPositive = 0;
    for (const row of records) {
      const actual = Number(row.actual_label);
      const predicted = Number(row[predictionField]);
      predictedPositive += predicted;
      if (actual === 1 && predicted === 1) truePositive += 1;
      if (actual === 0 && predicted === 1) falsePositive += 1;
      if (actual === 1 && predicted === 0) falseNegative += 1;
    }
    const actualNegative = records.length - records.filter((row) => Number(row.actual_label) === 1).length;
    return {
      group,
      n: records.length,
      selectionRate: safeDivide(predictedPositive, records.length),
      truePositiveRate: safeDivide(truePositive, truePositive + falseNegative),
      falsePositiveRate: safeDivide(falsePositive, actualNegative)
    };
  }).sort((first, second) => first.group.localeCompare(second.group));
  const gap = (field) => Math.max(...perGroup.map((group) => group[field])) - Math.min(...perGroup.map((group) => group[field]));
  const selectionRateGap = gap("selectionRate");
  const truePositiveRateGap = gap("truePositiveRate");
  const falsePositiveRateGap = gap("falsePositiveRate");
  return {
    groups: perGroup,
    selectionRateGap,
    truePositiveRateGap,
    averageOddsGap: (truePositiveRateGap + falsePositiveRateGap) / 2
  };
}

function auditRows(rows, attribute, policy, source) {
  const baseline = calculateModel(rows, attribute, "baseline_pred");
  const candidate = calculateModel(rows, attribute, "candidate_pred");
  const failures = [];
  if (candidate.selectionRateGap > policy.selectionRateGap) failures.push("Selection-rate gap exceeds policy.");
  if (candidate.truePositiveRateGap > policy.truePositiveRateGap) failures.push("True-positive-rate gap exceeds policy.");
  if (candidate.averageOddsGap > policy.averageOddsGap) failures.push("Average-odds gap exceeds policy.");
  return {
    version: "1.0",
    generated_at: new Date().toISOString(),
    source,
    protected_attribute: attribute,
    row_count: rows.length,
    policy,
    baseline,
    candidate,
    verdict: failures.length ? "BLOCK" : "PASS",
    reasons: failures
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "\"") {
      if (quoted && text[index + 1] === "\"") {
        cell += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted || rows.length < 2) throw new Error("CSV is empty or has an unterminated quoted value.");
  const headers = rows[0];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function normalizeCsv(records) {
  const shared = ["record_id", "actual_label", "gender", "age_band", "region"];
  const missing = shared.filter((field) => !(field in records[0]));
  if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}.`);
  if ("baseline_pred" in records[0] && "candidate_pred" in records[0]) {
    return records.map((record) => ({
      ...record,
      actual_label: Number(record.actual_label),
      baseline_pred: Number(record.baseline_pred),
      candidate_pred: Number(record.candidate_pred)
    }));
  }
  if (!("model_version" in records[0]) || !("predicted_label" in records[0])) {
    throw new Error("Include baseline_pred and candidate_pred, or model_version and predicted_label.");
  }
  const versions = [...new Set(records.map((record) => record.model_version))];
  if (versions.length < 2) throw new Error("Long-form CSV requires at least two model_version values.");
  const grouped = new Map();
  for (const record of records) {
    if (!grouped.has(record.record_id)) grouped.set(record.record_id, {});
    grouped.get(record.record_id)[record.model_version] = record;
  }
  return [...grouped.entries()].map(([recordId, models]) => {
    const baseline = models[versions[0]];
    const candidate = models[versions[1]];
    if (!baseline || !candidate) throw new Error(`Record ${recordId} is missing one model version.`);
    return {
      record_id: recordId,
      actual_label: Number(baseline.actual_label),
      baseline_pred: Number(baseline.predicted_label),
      candidate_pred: Number(candidate.predicted_label),
      gender: baseline.gender,
      age_band: baseline.age_band,
      region: baseline.region
    };
  });
}

function percentage(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

const state = { rows: [], source: "", audit: null };
const output = document.querySelector("#safety-output");
const status = document.querySelector("#safety-status");

function currentPolicy() {
  return {
    selectionRateGap: Number(document.querySelector("#spd-limit").value),
    truePositiveRateGap: Number(document.querySelector("#eod-limit").value),
    averageOddsGap: Number(document.querySelector("#aod-limit").value)
  };
}

function renderAudit() {
  const attribute = document.querySelector("#protected-attribute").value;
  state.audit = auditRows(state.rows, attribute, currentPolicy(), state.source);
  const audit = state.audit;
  status.textContent = audit.verdict;
  const groups = audit.candidate.groups.map((group) => `
    <article class="audit-group">
      <span>${escapeHtml(attribute)}</span>
      <h3>${escapeHtml(group.group)}</h3>
      <dl>
        <div><dt>Rows</dt><dd>${group.n}</dd></div>
        <div><dt>Selection</dt><dd>${percentage(group.selectionRate)}</dd></div>
        <div><dt>TPR</dt><dd>${percentage(group.truePositiveRate)}</dd></div>
        <div><dt>FPR</dt><dd>${percentage(group.falsePositiveRate)}</dd></div>
      </dl>
    </article>
  `).join("");
  output.innerHTML = `
    <div class="result-label">${escapeHtml(audit.source)} / ${audit.row_count} ROWS</div>
    <div class="gate ${audit.verdict.toLowerCase()}">${audit.verdict}</div>
    <h3>${audit.reasons.length ? escapeHtml(audit.reasons.join(" ")) : "Candidate clears the configured disparity thresholds."}</h3>
    <div class="metric-rail">
      <div class="metric"><span>Selection gap</span><strong>${percentage(audit.candidate.selectionRateGap)}</strong></div>
      <div class="metric"><span>TPR gap</span><strong>${percentage(audit.candidate.truePositiveRateGap)}</strong></div>
      <div class="metric"><span>Average odds</span><strong>${percentage(audit.candidate.averageOddsGap)}</strong></div>
      <div class="metric"><span>Data movement</span><strong>browser only</strong></div>
    </div>
    <div class="audit-groups">${groups}</div>
    <p class="limitation">These metrics describe the selected rows and policy. They are not a claim of real-world model fairness.</p>
  `;
}

function resetSample() {
  const scenarioId = document.querySelector("#scenario").value;
  const size = Number(document.querySelector("#sample-size").value);
  state.rows = generateRows(scenarioId, size);
  state.source = `DETERMINISTIC SAMPLE / ${scenarios[scenarioId].label}`;
  document.querySelector("#csv-message").textContent = "Deterministic synthetic rows loaded. Local CSV imports remain in this browser.";
  renderAudit();
}

function downloadJson(value) {
  const blob = new Blob([`${JSON.stringify(value, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ai-safety-audit-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function init() {
  const manifestPath = "artifacts/manifest.json";
  const [manifest, benchmark] = await Promise.all([
    fetchJson(manifestPath),
    fetchJson("artifacts/ai-safety-benchmark-summary.json")
  ]);
  document.querySelector("#evidence-summary").innerHTML = `
    <span class="evidence-mode">Local execution</span>
    <span>Source <code>${escapeHtml(manifest.source_commit.slice(0, 8))}</code></span>
    <a href="${manifestPath}">Manifest ↗</a>
  `;
  document.querySelector("#benchmark-output").innerHTML = `
    <div class="result-label">PROVIDER EVIDENCE / ${escapeHtml(benchmark.generated_at)}</div>
    <h3>Both models completed ${escapeHtml(benchmark.dataset.evaluated_cases)} cases.</h3>
    <p>Metrics below are read directly from the committed summary. The browser does not rerun or reinterpret provider outputs.</p>
    <div class="benchmark-models">
      ${benchmark.models.map((model) => `
        <article class="benchmark-model">
          <span>${escapeHtml(model.provider)} · ${escapeHtml(model.model_id)}</span>
          <h3>${escapeHtml(model.model_name)}</h3>
          <dl>
            <div><dt>Cases</dt><dd>${model.cases_success} / ${model.cases_attempted}</dd></div>
            <div><dt>Average score</dt><dd>${escapeHtml(model.avg_score)}</dd></div>
            <div><dt>Verdict accuracy</dt><dd>${escapeHtml(model.verdict_accuracy_pct)}%</dd></div>
            <div><dt>Schema valid</dt><dd>${escapeHtml(model.schema_valid_pct)}%</dd></div>
            <div><dt>P95 latency</dt><dd>${Number(model.latency_ms.p95).toLocaleString()} ms</dd></div>
            <div><dt>Total cost</dt><dd>$${Number(model.cost_usd.total).toFixed(4)}</dd></div>
          </dl>
        </article>
      `).join("")}
    </div>
    <pre>${escapeHtml(JSON.stringify(benchmark.source_artifact, null, 2))}</pre>
    <p class="limitation">${escapeHtml(manifest.limitations.join(" "))}</p>
  `;

  document.querySelector("#safety-form").addEventListener("submit", (event) => {
    event.preventDefault();
    renderAudit();
  });
  document.querySelector("#reset-sample").addEventListener("click", resetSample);
  document.querySelector("#scenario").addEventListener("change", resetSample);
  document.querySelector("#protected-attribute").addEventListener("change", renderAudit);
  document.querySelector("#export-audit").addEventListener("click", () => downloadJson(state.audit));
  document.querySelector("#safety-csv").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error("CSV exceeds the 2 MB browser-local limit.");
      const records = parseCsv(await file.text());
      state.rows = normalizeCsv(records);
      state.source = `LOCAL CSV / ${file.name}`;
      document.querySelector("#csv-message").textContent = `${file.name} loaded locally. No bytes were uploaded.`;
      renderAudit();
    } catch (error) {
      event.target.value = "";
      document.querySelector("#csv-message").textContent = error.message;
    }
  });

  const localTab = document.querySelector("#local-tab");
  const benchmarkTab = document.querySelector("#benchmark-tab");
  const localView = document.querySelector("#local-view");
  const benchmarkView = document.querySelector("#benchmark-view");
  function switchView(showBenchmark) {
    localView.hidden = showBenchmark;
    benchmarkView.hidden = !showBenchmark;
    localTab.setAttribute("aria-selected", String(!showBenchmark));
    benchmarkTab.setAttribute("aria-selected", String(showBenchmark));
    localTab.className = `button ${showBenchmark ? "secondary" : "primary"}`;
    benchmarkTab.className = `button ${showBenchmark ? "primary" : "secondary"}`;
  }
  localTab.addEventListener("click", () => switchView(false));
  benchmarkTab.addEventListener("click", () => switchView(true));
  resetSample();
}

init().catch((error) => {
  output.innerHTML = `<div class="result-empty">${escapeHtml(error.message)}</div>`;
  console.error(error);
});
