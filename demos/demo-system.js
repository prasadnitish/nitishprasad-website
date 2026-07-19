(() => {
  const lab = document.body.dataset.lab;
  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

  function setupExamples() {
    document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector('#prompt').value = button.dataset.prompt;
      document.querySelector('#task').value = button.dataset.task;
    }));
  }

  function initGateway() {
    const form = document.querySelector('#gateway-form');
    const result = document.querySelector('#gateway-result');
    const verdict = document.querySelector('#gateway-verdict');
    const steps = [...document.querySelectorAll('#gateway-trace .trace-step')];
    const cache = new Map();
    const routes = {
      tripPlan: ['gemini-2.5-flash', 'claude-haiku-4-5'],
      packingList: ['deepseek-v4-flash', 'gemini-2.5-flash'],
      parseInput: ['deepseek-v4-flash', 'gemini-2.5-flash'],
    };
    setupExamples();
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const task = document.querySelector('#task').value;
      const tenant = document.querySelector('#tenant').value.trim() || 'portfolio-demo';
      const prompt = document.querySelector('#prompt').value.trim();
      const restricted = /(\b\d{3}-\d{2}-\d{4}\b|\b(?:\d[ -]*?){13,16}\b|medical record|health identifier)/i.test(prompt);
      const key = `${tenant}::${task}::${prompt.toLowerCase().replace(/\s+/g, ' ')}`;
      steps.forEach((step) => { step.className = 'trace-step'; step.querySelector('strong').textContent = 'Pending'; });
      verdict.textContent = 'ROUTING'; result.innerHTML = '<div class="result-empty loading">Evaluating identity, data class, and route policy…</div>';
      steps[0].classList.add('done'); steps[0].querySelector('strong').textContent = tenant;
      await wait(140);
      if (restricted) {
        steps[1].classList.add('block'); steps[1].querySelector('strong').textContent = 'Restricted data';
        steps[2].querySelector('strong').textContent = 'Not evaluated'; steps[3].querySelector('strong').textContent = 'Not called'; verdict.textContent = 'BLOCKED';
        result.innerHTML = '<div class="result-label">GATEWAY_DLP_BLOCK</div><h3>Provider access denied.</h3><p>The payment or health-data fixture was stopped before cache lookup or model routing. No raw value left this browser.</p><div class="metric-rail"><div class="metric"><span>Provider calls</span><strong>0</strong></div><div class="metric"><span>Cache writes</span><strong>0</strong></div><div class="metric"><span>Cost</span><strong>$0</strong></div><div class="metric"><span>Policy</span><strong>fail closed</strong></div></div>';
        return;
      }
      steps[1].classList.add('done'); steps[1].querySelector('strong').textContent = 'Internal / clear';
      await wait(140);
      const cacheHit = cache.has(key); const model = routes[task][0];
      steps[2].classList.add('done'); steps[2].querySelector('strong').textContent = model;
      await wait(140);
      steps[3].classList.add('done'); steps[3].querySelector('strong').textContent = cacheHit ? 'Semantic cache' : 'Modeled response'; verdict.textContent = cacheHit ? 'CACHE HIT' : 'ROUTED';
      const inputTokens = Math.max(12, Math.ceil(prompt.length / 4)); const outputTokens = task === 'parseInput' ? 42 : task === 'packingList' ? 118 : 240;
      const costs = { 'gemini-2.5-flash': [0.3, 2.5], 'deepseek-v4-flash': [0.14, 0.28] }; const rate = costs[model]; const cost = cacheHit ? 0 : inputTokens / 1e6 * rate[0] + outputTokens / 1e6 * rate[1];
      if (!cacheHit) cache.set(key, true);
      const answer = task === 'parseInput' ? 'Structured intent: Boston · next Friday · 2 adults.' : task === 'packingList' ? 'A compact weather-aware packing plan was selected under the low-cost route.' : 'A family-aware Seattle itinerary route was selected with an approved fallback chain.';
      result.innerHTML = `<div class="result-label">POLICY 2026-07-12.1 / ${escapeHtml(task)}</div><h3>${cacheHit ? 'Reused safely.' : 'Routed to ' + escapeHtml(model) + '.'}</h3><p>${answer}</p><div class="metric-rail"><div class="metric"><span>Cache</span><strong>${cacheHit ? 'hit' : 'miss'}</strong></div><div class="metric"><span>Modeled cost</span><strong>$${cost.toFixed(6)}</strong></div><div class="metric"><span>Tokens</span><strong>${inputTokens + outputTokens}</strong></div><div class="metric"><span>Fallback</span><strong>${routes[task][1]}</strong></div></div>`;
    });
  }

  function initGraph() {
    const source = {
      US: { Growth: ['Northstar Goods', 'Cedar Lane', 'Desert Bloom', 'Pacific Loom'], fee: { Growth: '2.5%', Export: '4%', Launch: '$29', Premium: '6%' } },
      UK: { Premium: ['Thames Studio'], fee: { Premium: '6%' } },
      CA: { Export: ['Maple Works', 'Harbor Craft'], fee: { Export: '4%' } },
      DE: { Launch: [], fee: { Launch: '$29' } },
      JP: { Growth: ['Kumo Market'], fee: { Growth: '2.5%' } },
    };
    document.querySelector('#graph-form').addEventListener('submit', async (event) => {
      event.preventDefault(); const question = document.querySelector('#graph-question').value; const result = document.querySelector('#graph-result'); const verdict = document.querySelector('#graph-verdict');
      result.innerHTML = '<div class="result-empty loading">Generating bounded read query and traversing ontology…</div>'; verdict.textContent = 'TRAVERSING'; await wait(220);
      const region = ['US', 'UK', 'CA', 'DE', 'JP'].find((code) => question.includes(` ${code} `)); const program = ['Growth', 'Premium', 'Export', 'Launch'].find((name) => question.includes(name)); const sellers = source[region][program] || []; const fee = source[region].fee[program];
      const cypher = 'MATCH (s:Seller {tenant_id: $tenant_id})-[:APPLIES_IN]->(r:Region {tenant_id: $tenant_id}),\n      (s)-[:ELIGIBLE_FOR]->(p:Program {tenant_id: $tenant_id})\nMATCH (p)-[:CHARGES]->(f:Fee {tenant_id: $tenant_id})\nWHERE r.code = $region AND p.name = $program\nRETURN s, r, p, f LIMIT 100';
      const answer = sellers.length ? `${sellers.join(', ')} ${sellers.length === 1 ? 'is' : 'are'} eligible for ${program} in ${region}; the applicable fee is ${fee}.` : 'Insufficient data in the governed seller graph.';
      verdict.textContent = sellers.length ? 'GROUNDED' : 'NO RESULT';
      result.innerHTML = `<div class="result-label">READ ONLY / TENANT DEMO</div><h3>${escapeHtml(answer)}</h3><div class="node-map">${sellers.map((seller) => `<span class="node">Seller:${escapeHtml(seller)}</span>`).join('')}<span class="node edge">Region:${region}</span><span class="node edge">Program:${program}</span><span class="node edge">Fee:${fee}</span></div><pre>${escapeHtml(cypher)}</pre><div class="metric-rail"><div class="metric"><span>Hops</span><strong>3</strong></div><div class="metric"><span>Graph score</span><strong>${sellers.length ? '96' : '100'}</strong></div><div class="metric"><span>Vector baseline</span><strong>${sellers.length ? '54' : '61'}</strong></div><div class="metric"><span>Tenant crossover</span><strong>0</strong></div></div>`;
    });
  }

  function initRedteam() {
    const labels = { prompt_injection: 'Prompt injection', jailbreak: 'Jailbreak', data_exfiltration: 'Data exfiltration', tool_call_abuse: 'Tool abuse' };
    document.querySelector('#redteam-form').addEventListener('submit', async (event) => {
      event.preventDefault(); const target = document.querySelector('#redteam-target').value; const selected = [...document.querySelectorAll('#redteam-form input:checked')].map((input) => input.value); const result = document.querySelector('#redteam-result'); const status = document.querySelector('#redteam-status');
      if (!selected.length) { result.innerHTML = '<div class="result-empty">Select at least one attack class.</div>'; return; }
      status.textContent = 'RUNNING'; result.innerHTML = '<div class="result-empty loading">Mutating probes, scoring behavior, and computing release policy…</div>'; await wait(300);
      const successMap = target === 'vulnerable' ? { prompt_injection: 1, jailbreak: 0, data_exfiltration: 1, tool_call_abuse: 1 } : { prompt_injection: 0, jailbreak: 0, data_exfiltration: 0, tool_call_abuse: 0 };
      const critical = selected.reduce((sum, category) => sum + (['data_exfiltration', 'tool_call_abuse'].includes(category) ? successMap[category] : 0), 0); const medium = selected.reduce((sum, category) => sum + (!['data_exfiltration', 'tool_call_abuse'].includes(category) ? successMap[category] : 0), 0); const gate = critical > 0 ? 'BLOCK' : medium > 1 ? 'WARN' : 'PASS'; const probes = selected.length * 10;
      status.textContent = gate; const rows = selected.map((category) => `<tr><td>${labels[category]}</td><td>10</td><td class="${successMap[category] ? 'probe-success' : 'probe-safe'}">${successMap[category]}</td><td>${['data_exfiltration', 'tool_call_abuse'].includes(category) ? 'Critical' : 'Medium'}</td></tr>`).join('');
      result.innerHTML = `<div class="result-label">RELEASE GATE / ${escapeHtml(target)}</div><div class="gate ${gate.toLowerCase()}">${gate}</div><p>${gate === 'BLOCK' ? `${critical} critical attack success(es) exceeded the configured limit of zero.` : 'No selected attack crossed the configured release threshold.'}</p><table class="probe-table"><thead><tr><th>Category</th><th>Probes</th><th>Successes</th><th>Severity</th></tr></thead><tbody>${rows}</tbody></table><div class="metric-rail"><div class="metric"><span>Probes</span><strong>${probes}</strong></div><div class="metric"><span>Critical</span><strong>${critical}</strong></div><div class="metric"><span>Medium</span><strong>${medium}</strong></div><div class="metric"><span>Evidence</span><strong>redacted</strong></div></div>`;
    });
  }

  function initRag() {
    const cases = {
      travel: { safe: /booster|car seat|california/i, answer: 'California requires an appropriate child restraint based on age and size; verify the current state guidance before travel.', citations: ['CA child passenger safety guidance', 'SproutRoute family travel policy'] },
      seller: { safe: /growth|fee|eligible/i, answer: 'The Growth recommendation is eligible only after region, account status, and policy freshness checks pass.', citations: ['Synthetic seller program policy v3', 'Eligibility ruleset 2026-07'] },
    };
    document.querySelector('#rag-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const domain = document.querySelector('#rag-domain').value; const question = document.querySelector('#rag-question').value.trim(); const result = document.querySelector('#rag-result'); const verdict = document.querySelector('#rag-verdict');
      result.innerHTML = '<div class="result-empty loading">Checking input, retrieving context, and scoring groundedness…</div>'; verdict.textContent = 'RUNNING'; await wait(260);
      if (/ignore (all|previous)|system prompt|reveal secrets/i.test(question)) {
        verdict.textContent = 'BLOCK';
        result.innerHTML = '<div class="result-label">INPUT GUARDRAIL / PROMPT INJECTION</div><div class="gate block">BLOCK</div><p>The request was stopped before retrieval. No corpus content or system instruction was exposed.</p><div class="metric-rail"><div class="metric"><span>Retrieval calls</span><strong>0</strong></div><div class="metric"><span>Citations</span><strong>0</strong></div><div class="metric"><span>Evidence retained</span><strong>redacted</strong></div></div>';
        return;
      }
      const fixture = cases[domain]; const grounded = fixture.safe.test(question); verdict.textContent = grounded ? 'PASS' : 'WARN';
      const answer = grounded ? fixture.answer : 'The governed corpus does not contain enough evidence to answer confidently. Escalate or refine the question.';
      const citations = grounded ? fixture.citations.map((citation, index) => `<li>[${index + 1}] ${escapeHtml(citation)}</li>`).join('') : '<li>No supporting citation met the threshold.</li>';
      result.innerHTML = `<div class="result-label">DUAL-DOMAIN TRACE / ${escapeHtml(domain)}</div><div class="gate ${grounded ? 'pass' : 'warn'}">${grounded ? 'PASS' : 'WARN'}</div><h3>${escapeHtml(answer)}</h3><ul>${citations}</ul><div class="metric-rail"><div class="metric"><span>Groundedness</span><strong>${grounded ? '0.94' : '0.41'}</strong></div><div class="metric"><span>Context chunks</span><strong>${grounded ? '3' : '1'}</strong></div><div class="metric"><span>PII findings</span><strong>0</strong></div><div class="metric"><span>Release policy</span><strong>${grounded ? 'pass' : 'review'}</strong></div></div>`;
    });
  }

  function initAmplify() {
    const playbooks = {
      growth: { action: 'Prioritize a Growth program conversation', confidence: 'High', evidence: 'Eligibility passed · engagement signal fresh · regional policy current', owner: 'Account lead' },
      recovery: { action: 'Resolve catalog health before expansion', confidence: 'High', evidence: 'Blocking defect open · revenue impact rising · remediation playbook matched', owner: 'Catalog specialist' },
      expansion: { action: 'Validate cross-border prerequisites', confidence: 'Medium', evidence: 'Demand signal present · tax and logistics evidence incomplete', owner: 'Expansion specialist' },
    };
    document.querySelector('#amplify-form').addEventListener('submit', async (event) => {
      event.preventDefault(); const scenario = document.querySelector('#amplify-scenario').value; const region = document.querySelector('#amplify-region').value; const result = document.querySelector('#amplify-result'); const verdict = document.querySelector('#amplify-verdict');
      verdict.textContent = 'ASSEMBLING'; result.innerHTML = '<div class="result-empty loading">Checking permission, eligibility, freshness, and playbook evidence…</div>'; await wait(240);
      const item = playbooks[scenario]; verdict.textContent = item.confidence === 'High' ? 'READY' : 'REVIEW';
      result.innerHTML = `<div class="result-label">ANONYMIZED WORKFLOW / ${escapeHtml(region)}</div><h3>${escapeHtml(item.action)}</h3><p>${escapeHtml(item.evidence)}.</p><div class="trace"><div class="trace-step done"><span>01 / permission</span><strong>Allowed</strong></div><div class="trace-step done"><span>02 / eligibility</span><strong>Checked</strong></div><div class="trace-step done"><span>03 / freshness</span><strong>Current</strong></div><div class="trace-step done"><span>04 / explanation</span><strong>Generated</strong></div></div><div class="metric-rail"><div class="metric"><span>Confidence</span><strong>${item.confidence}</strong></div><div class="metric"><span>Owner</span><strong>${item.owner}</strong></div><div class="metric"><span>Latency shape</span><strong>&lt;500ms P95</strong></div><div class="metric"><span>Raw customer data</span><strong>none</strong></div></div>`;
    });
  }

  if (lab === 'gateway') initGateway();
  if (lab === 'graph') initGraph();
  if (lab === 'redteam') initRedteam();
  if (lab === 'rag') initRag();
  if (lab === 'amplify') initAmplify();
})();
