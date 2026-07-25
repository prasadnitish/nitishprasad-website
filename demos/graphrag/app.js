(() => {
  const stop = new Set(["a", "an", "and", "are", "for", "from", "how", "in", "is", "me", "of", "on", "or", "show", "the", "to", "what", "when", "which", "who", "why", "with"]);
  const tokens = (text) => new Set((text.toLowerCase().match(/[a-z0-9_$.-]+/g) || []).filter((token) => !stop.has(token)));
  const similarity = (left, right) => {
    const a = tokens(left); const b = tokens(right);
    const union = new Set([...a, ...b]);
    return union.size ? [...a].filter((token) => b.has(token)).length / union.size : 0;
  };
  const exactHeldOut = (question, recipe) => recipe.questions.includes(question);

  const form = document.querySelector("#graph-form");
  const scenarioSelect = document.querySelector("#graph-scenario");
  const questionInput = document.querySelector("#graph-question");
  const examples = document.querySelector("#graph-examples");
  const result = document.querySelector("#graph-result");
  const verdict = document.querySelector("#graph-verdict");
  let artifacts;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  function metricRail(items) {
    const rail = element("div", "metric-rail");
    items.forEach(([label, value]) => {
      const metric = element("div", "metric");
      metric.append(element("span", "", label), element("strong", "", value));
      rail.append(metric);
    });
    return rail;
  }

  function tracePanel(title) {
    const panel = element("div", "trace-panel");
    panel.append(element("h4", "", title));
    return panel;
  }

  function setResultEmpty(message) {
    result.replaceChildren(element("div", "result-empty", message));
  }

  function scenario() {
    return artifacts.scenarios[scenarioSelect.value];
  }

  function renderScenario() {
    const data = scenario();
    document.querySelector("#scenario-version").textContent = `ONTOLOGY / ${data.version}`;
    questionInput.value = data.examples[0];
    examples.replaceChildren();
    data.examples.forEach((question) => {
      const button = element("button", "example", question);
      button.type = "button";
      button.addEventListener("click", () => {
        questionInput.value = question;
        questionInput.focus();
      });
      examples.append(button);
    });
    document.querySelector("#build-title").textContent = `${data.counts.nodes} nodes · ${data.counts.relationships} relationships · ${data.counts.chunks} chunks`;
    document.querySelector("#build-metrics").replaceChildren(...[
      ["Sources", data.counts.sources],
      ["Mapped fields", data.counts.mapped_fields],
      ["Unmapped", 0],
      ["Tenant", "demo"],
    ].map(([label, value]) => {
      const metric = element("div", "metric");
      metric.append(element("span", "", label), element("strong", "", value));
      return metric;
    }));
    document.querySelector("#build-hash").textContent = `ontology ${data.ontology_hash} / data ${data.data_hash}`;
    document.querySelector("#eval-title").textContent = `${data.evaluation.passed}/${data.evaluation.cases} routing cases passed`;
    document.querySelector("#eval-note").textContent = `${data.evaluation.claim}. This is not a GraphRAG-versus-vector answer score.`;
    document.querySelector("#eval-link").href = `https://github.com/prasadnitish/seller-ontology-graphrag/blob/main/examples/${scenarioSelect.value}/generated/evaluation.json`;
    setResultEmpty("Route a question to reveal the approved recipe and committed evidence.");
    verdict.textContent = "WAITING";
  }

  function selectRecipe(question, data) {
    if (/ignore (?:all|previous)|system prompt|cross[- ]tenant|delete every|stale ontology|arbitrary cypher/i.test(question)) return null;
    const scored = data.recipes.map((recipe) => ({
      recipe,
      score: Math.max(...recipe.questions.map((example) => similarity(question, example))),
    })).sort((a, b) => b.score - a.score);
    const selected = scored[0];
    if (!selected || selected.score < 0.13) return null;
    if (selected.recipe.entities.length && !selected.recipe.entities.some((entity) => question.toLowerCase().includes(entity.toLowerCase()))) return null;
    if (Object.hasOwn(selected.recipe.parameters, "incident_id")) {
      const incident = question.match(/INC-\d+/i)?.[0];
      if (!incident || !selected.recipe.entities.includes(incident)) return null;
    }
    if (Object.hasOwn(selected.recipe.parameters, "program_name") && !["Growth", "Export", "Launch", "Premium"].some((name) => question.toLowerCase().includes(name.toLowerCase()))) return null;
    if (Object.hasOwn(selected.recipe.parameters, "region_code") && !/\b(?:US|CA|UK|DE|JP)\b/.test(question)) return null;
    if (scenarioSelect.value === "seller" && /\b[A-Z]{2}\b/.test(question)) {
      const region = question.match(/\b[A-Z]{2}\b/)[0];
      if (!["US", "CA", "UK", "DE", "JP"].includes(region)) return null;
    }
    return selected.recipe;
  }

  function renderUnsupported(question) {
    verdict.textContent = "UNSUPPORTED";
    const decision = element("div", "route-decision");
    decision.append(
      element("span", "route-badge unsupported", "unsupported"),
      element("span", "result-label", "NO APPROVED RECIPE + ENTITY MATCH"),
    );
    result.replaceChildren(
      decision,
      element("h3", "", "No executable query was produced."),
      element(
        "p",
        "",
        `The committed workbench returns unsupported instead of inventing an entity, route, or Cypher statement for “${question}”.`,
      ),
      metricRail([
        ["Cypher", "none"],
        ["Database calls", "0"],
        ["Quality score", "none"],
        ["State", "explicit"],
      ]),
    );
  }

  function renderRecipe(question, recipe) {
    const parameters = { ...recipe.parameters };
    if (parameters.incident_id) parameters.incident_id = question.match(/INC-\d+/i)?.[0] || parameters.incident_id;
    if (parameters.region_code) parameters.region_code = question.match(/\b(?:US|CA|UK|DE|JP)\b/)?.[0] || parameters.region_code;
    if (parameters.program_name) parameters.program_name = ["Growth", "Export", "Launch", "Premium"].find((name) => question.toLowerCase().includes(name.toLowerCase())) || parameters.program_name;
    const heldOut = exactHeldOut(question, recipe);
    const route = ["graph", "vector", "hybrid"].includes(recipe.route)
      ? recipe.route
      : "unsupported";
    verdict.textContent = route.toUpperCase();

    const decision = element("div", "route-decision");
    decision.append(
      element("span", `route-badge ${route}`, route),
      element("span", "result-label", `${recipe.id} / APPROVED`),
    );

    const traceGrid = element("div", "trace-grid");
    const parameterPanel = tracePanel("Typed parameters");
    parameterPanel.append(element("pre", "", JSON.stringify(parameters, null, 2)));
    const routePanel = tracePanel("Route decision");
    routePanel.append(element(
      "p",
      "",
      route === "graph"
        ? "Relationship-dependent answer; graph recipe selected."
        : route === "vector"
          ? "Narrative explanation; document retrieval selected."
          : "Exact relationships plus narrative evidence; both selected.",
    ));
    traceGrid.append(parameterPanel, routePanel);

    if (recipe.graph_trace.length) {
      const graphPanel = tracePanel("Returned subgraph");
      const nodeMap = element("div", "node-map");
      recipe.graph_trace.forEach((node) => nodeMap.append(element("span", "node", node)));
      graphPanel.append(nodeMap);
      traceGrid.append(graphPanel);
    }
    if (recipe.vector_trace.length) {
      const vectorPanel = tracePanel("Vector chunks");
      recipe.vector_trace.forEach((chunk) => vectorPanel.append(element("p", "", chunk)));
      traceGrid.append(vectorPanel);
    }

    const cypherPanel = tracePanel("Approved Cypher");
    cypherPanel.append(
      recipe.cypher
        ? element("pre", "", recipe.cypher)
        : element("p", "", "None. Vector-only recipes cannot carry Cypher."),
    );
    const citationPanel = tracePanel("Citations");
    const citationList = element("div", "citation-list");
    recipe.citations.forEach((citation) => {
      const item = element("div", "citation");
      item.append(element("code", "", `${citation.source} / ${citation.locator}`));
      citationList.append(item);
    });
    citationPanel.append(citationList);
    traceGrid.append(cypherPanel, citationPanel);

    result.replaceChildren(
      decision,
      element("h3", "", recipe.answer),
      traceGrid,
      metricRail([
        ["Execution", "artifact replay"],
        ["Latency", "not measured"],
        ["Held-out reference", heldOut ? "exact case" : "none"],
        ["Quality score", heldOut ? "case result only" : "none"],
      ]),
      element(
        "p",
        "reference-note",
        heldOut
          ? "This exact question exists in the committed held-out routing suite. The artifact evaluates route and parameters—not synthesized answer quality."
          : "This phrasing has no exact held-out reference, so the demo does not assign it a score.",
      ),
    );
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = questionInput.value.trim();
    const recipe = selectRecipe(question, scenario());
    if (!recipe) renderUnsupported(question);
    else renderRecipe(question, recipe);
  });
  scenarioSelect.addEventListener("change", renderScenario);

  fetch("artifacts.json")
    .then((response) => {
      if (!response.ok) throw new Error("Artifact manifest unavailable");
      return response.json();
    })
    .then((data) => {
      artifacts = data;
      renderScenario();
    })
    .catch((error) => {
      verdict.textContent = "ERROR";
      setResultEmpty(error.message);
    });
})();
