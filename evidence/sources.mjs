export const portfolioEvidenceSources = [
  {
    demoId: "llm-gateway",
    mode: "local_execution",
    sourceRepository: "https://github.com/prasadnitish/llm-gateway",
    sourceDirectory: "llm-gateway",
    sourceCommit: "a82bde6783f792814b3fd905b940a2428315c2e8",
    generatedAt: "2026-07-12T17:31:00.000Z",
    generatorCommand: "npm test && npm run benchmark && npm run load",
    publicDirectory: "demos/llm-gateway/artifacts",
    files: [
      { source: "reports/before-after.json", target: "before-after.json", name: "deterministic benchmark" },
      { source: "reports/load-and-isolation.json", target: "load-and-isolation.json", name: "load and isolation report" }
    ],
    environment: {
      execution: "browser-local policy engine",
      provider_calls: false,
      benchmark: "deterministic synthetic provider simulation"
    },
    providers: [{ name: "deterministic-provider-stub", model: "none", live: false }],
    claims: [
      {
        id: "gateway-policy-controls",
        statement: "Arbitrary request envelopes exercise DLP, residency, quota, tenant-scoped cache, routing, and fallback policy locally.",
        evidence_artifact: "load-and-isolation.json",
        evidence_pointer: "/controls"
      },
      {
        id: "gateway-benchmark-boundary",
        statement: "Published cost and latency figures are deterministic benchmark results, not live-provider measurements.",
        evidence_artifact: "before-after.json",
        evidence_pointer: "/evidence_level"
      }
    ],
    limitations: [
      "The public interaction never calls a model provider and does not generate a model answer.",
      "The benchmark validates gateway policy behavior, not internet or provider latency."
    ]
  },
  {
    demoId: "rag-guardrails",
    mode: "local_execution",
    sourceRepository: "https://github.com/prasadnitish/rag-pipeline-guardrails",
    sourceDirectory: "rag-pipeline-guardrails",
    sourceCommit: "976a847351ddc68dbbde5dc2a660bdbf207cfc82",
    generatedAt: "2026-04-02T23:16:00.000Z",
    generatorCommand: "npm test && npm run eval && npm run gate",
    publicDirectory: "demos/rag-guardrails/artifacts",
    files: [
      { source: "src/domains/travel/docs.json", target: "travel-docs.json", name: "travel corpus" },
      { source: "src/domains/seller_synth/docs.json", target: "seller-docs.json", name: "seller corpus" },
      { source: "output/rag-eval-report.json", target: "rag-eval-report.json", name: "24-case evaluation" },
      { source: "output/rag-gate-report.json", target: "rag-gate-report.json", name: "release gate report" }
    ],
    environment: {
      execution: "browser-local term-weighted retrieval and guardrails",
      provider_calls: false,
      corpus: "committed synthetic policy documents"
    },
    providers: [{ name: "extractive-template", model: "none", live: false }],
    claims: [
      {
        id: "rag-input-dependent-retrieval",
        statement: "Arbitrary questions are ranked against the committed corpus and return source-backed extractive answers or abstain.",
        evidence_artifact: "rag-eval-report.json",
        evidence_pointer: "/summary"
      },
      {
        id: "rag-injection-boundary",
        statement: "Prompt-injection patterns are blocked before retrieval.",
        evidence_artifact: "rag-gate-report.json",
        evidence_pointer: "/checks"
      }
    ],
    limitations: [
      "The public demo uses an extractive generator; it does not compare live model providers.",
      "The corpus is intentionally small and synthetic."
    ]
  },
  {
    demoId: "redteam",
    mode: "artifact_replay",
    sourceRepository: "https://github.com/prasadnitish/ai-safety-audit-tool/tree/codex/redteam-harness",
    sourceDirectory: "ai-safety-redteam-harness",
    sourceCommit: "7e80c861da6e67a9b77dddfd1b77f1d5b481803e",
    generatedAt: "2026-07-25T20:26:29.430Z",
    generatorCommand: "npm test && npm run redteam:bench",
    publicDirectory: "demos/redteam/artifacts",
    files: [
      { source: "output/redteam-benchmark.json", target: "redteam-benchmark.json", name: "40-probe vulnerable-baseline campaign" }
    ],
    environment: {
      execution: "committed artifact replay",
      provider_calls: false,
      target: "fixture://vulnerable-baseline"
    },
    providers: [{ name: "PyRIT", model: "deterministic vulnerable baseline", live: false, version: "0.14.0" }],
    claims: [
      {
        id: "redteam-release-verdict",
        statement: "The committed 40-probe vulnerable-baseline campaign produced a BLOCK verdict.",
        evidence_artifact: "redteam-benchmark.json",
        evidence_pointer: "/verdict"
      }
    ],
    limitations: [
      "Controls filter and inspect a completed campaign; PyRIT is not executing in the browser.",
      "The artifact makes no claim that a live commercial model was compromised."
    ]
  },
  {
    demoId: "agent-observability",
    mode: "artifact_replay",
    sourceRepository: "https://github.com/prasadnitish/AI-Eval-Control-Tower/tree/codex/agent-observability",
    sourceDirectory: "ai-eval-control-tower-observability",
    sourceCommit: "24d5d87fcd9c57ea957bed45c6bc38ed4a25b5e7",
    generatedAt: "2026-07-12T17:44:17.969Z",
    generatorCommand: "npm test && npm run trace:failure && npm run trace:load",
    publicDirectory: "demos/agent-observability/artifacts",
    files: [
      { source: "output/traces/forced-failure.json", target: "forced-failure.json", name: "forced-failure trace" },
      { source: "output/reports/trace-load.json", target: "trace-load.json", name: "150,000-span load report" }
    ],
    environment: {
      execution: "committed artifact replay with browser-local import",
      provider_calls: false,
      timestamp_offsets: "reconstructed from source trace timing"
    },
    providers: [],
    claims: [
      {
        id: "trace-forced-failure",
        statement: "The committed trace retains the policy-service failure and the release-gate fallback reason.",
        evidence_artifact: "forced-failure.json",
        evidence_pointer: "/spans/1/detail/error_code"
      },
      {
        id: "trace-load",
        statement: "The in-process collector simulation attempted 150,000 spans and retained all 150 error spans.",
        evidence_artifact: "trace-load.json",
        evidence_pointer: "/retained_errors"
      }
    ],
    limitations: [
      "Load evidence is an in-process buffered collector simulation, not a hosted throughput benchmark.",
      "The fixture contains relative millisecond offsets rather than original wall-clock span timestamps."
    ]
  },
  {
    demoId: "eval-control-tower",
    mode: "artifact_replay",
    sourceRepository: "https://github.com/prasadnitish/AI-Eval-Control-Tower/tree/codex/principal-pm-dashboard-redesign",
    sourceDirectory: "AI Eval Control Tower - principal-dashboard-redesign",
    sourceCommit: "3b87af78781893eee9a3c634c805a4724b5c12aa",
    generatedAt: "2026-04-17T12:48:00.549Z",
    generatorCommand: "npm test && npm run eval:sproutroute:full && npm run eval:seller:v3",
    publicDirectory: "demos/eval-control-tower/artifacts",
    aliases: ["evals/artifacts"],
    files: [
      { source: "src/data/sproutroute-full.json", target: "sproutroute-full.json", name: "SproutRoute full evaluation" },
      { source: "src/data/seller-intelligence-v3.json", target: "seller-intelligence-v3.json", name: "seller intelligence evaluation" }
    ],
    environment: {
      execution: "committed provider evaluation replay with browser-local import",
      provider_calls: false,
      judge: "recorded in each artifact"
    },
    providers: [{ name: "OpenRouter", model: "artifact-specific", live: false }],
    claims: [
      {
        id: "eval-artifact-derived",
        statement: "Candidates, quality dimensions, latency, cost, policy violations, and recommendations are derived from the selected artifact.",
        evidence_artifact: "seller-intelligence-v3.json",
        evidence_pointer: "/summary/per_model"
      }
    ],
    limitations: [
      "The explorer replays completed evaluations and does not call providers.",
      "Historical provider behavior may not represent current model versions."
    ]
  },
  {
    demoId: "ai-safety-audit",
    mode: "local_execution",
    sourceRepository: "https://github.com/prasadnitish/AI-Eval-Control-Tower",
    sourceDirectory: "AI Eval Control Tower",
    sourceCommit: "94eeaf68ed8851ed0658e0de649b292f43d2116d",
    generatedAt: "2026-02-27T14:59:17.785Z",
    generatorCommand: "npm run ai-safety:bench -- --limit 540",
    publicDirectory: "demos/ai-safety-audit/artifacts",
    aliases: ["ai-safety/artifacts"],
    projection: {
      source: "output/ai-safety-benchmark-full.json",
      target: "ai-safety-benchmark-summary.json",
      name: "540-case-per-model benchmark summary",
      type: "ai_safety_summary"
    },
    environment: {
      execution: "browser-local fairness calculation plus committed provider benchmark summary",
      provider_calls: false,
      benchmark_cases_per_model: 540
    },
    providers: [
      { name: "Anthropic", model: "claude-sonnet-4-6", live: false },
      { name: "DeepSeek", model: "deepseek-chat", live: false }
    ],
    claims: [
      {
        id: "safety-provider-benchmark",
        statement: "The evidence view summarizes 540 completed cases per model and preserves the full source artifact hash.",
        evidence_artifact: "ai-safety-benchmark-summary.json",
        evidence_pointer: "/models"
      }
    ],
    limitations: [
      "The browser receives the benchmark summary, not the 5.4 MB per-case provider transcript.",
      "Local fairness calculations are synthetic unless the user imports a CSV."
    ]
  },
  {
    demoId: "amplify",
    mode: "workflow_walkthrough",
    sourceRepository: "https://github.com/prasadnitish/nitishprasad-website",
    sourceDirectory: "nitishprasad-website-demo-remediation",
    sourceCommit: "c11dabe50e51f75956211b47650e287d11b96afe",
    generatedAt: "2026-07-25T12:00:00.000Z",
    generatorCommand: "node scripts/sync-portfolio-evidence.mjs",
    publicDirectory: "demos/amplify/artifacts",
    authoredArtifact: {
      target: "workflow-states.json",
      name: "anonymized workflow states",
      value: {
        "version": "1.0",
        "evidence_level": "anonymized workflow walkthrough; no AI execution claim",
        "states": {
          "growth": {
            "title": "Prioritize a Growth program conversation",
            "signals": ["Eligibility passed", "Engagement signal fresh", "Regional policy current"],
            "owner": "Account lead",
            "next_gate": "Human confirms account context before outreach"
          },
          "recovery": {
            "title": "Resolve catalog health before expansion",
            "signals": ["Blocking defect open", "Revenue impact rising", "Remediation playbook matched"],
            "owner": "Catalog specialist",
            "next_gate": "Defect is resolved before expansion is reconsidered"
          },
          "expansion": {
            "title": "Validate cross-border prerequisites",
            "signals": ["Demand signal present", "Tax evidence incomplete", "Logistics evidence incomplete"],
            "owner": "Expansion specialist",
            "next_gate": "Tax and logistics owners approve prerequisites"
          }
        }
      }
    },
    environment: {
      execution: "authored anonymized workflow walkthrough",
      provider_calls: false,
      proprietary_data: false
    },
    providers: [],
    claims: [
      {
        id: "amplify-walkthrough-only",
        statement: "Inputs select an illustrative workflow state and do not execute an AI system.",
        evidence_artifact: "workflow-states.json",
        evidence_pointer: "/evidence_level"
      }
    ],
    limitations: [
      "The public route contains no proprietary implementation, data, confidence score, or latency benchmark.",
      "Workflow states illustrate product decision architecture rather than system performance."
    ]
  }
];
