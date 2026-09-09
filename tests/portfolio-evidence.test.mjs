import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { portfolioEvidenceSources } from "../evidence/sources.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function json(path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

async function text(path) {
  return readFile(join(root, path), "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function resolvePointer(value, pointer) {
  return pointer
    .split("/")
    .slice(1)
    .reduce((current, segment) => current?.[segment.replaceAll("~1", "/").replaceAll("~0", "~")], value);
}

test("every supported claim resolves to committed evidence", async () => {
  const manifestPaths = [
    "demos/llm-gateway/artifacts/manifest.json",
    "demos/rag-guardrails/artifacts/manifest.json",
    "demos/redteam/artifacts/manifest.json",
    "demos/agent-observability/artifacts/manifest.json",
    "demos/eval-control-tower/artifacts/manifest.json",
    "demos/ai-safety-audit/artifacts/manifest.json",
    "demos/amplify/artifacts/manifest.json"
  ];
  for (const manifestPath of manifestPaths) {
    const manifest = await json(manifestPath);
    const directory = dirname(manifestPath);
    for (const claim of manifest.claims) {
      const artifact = await json(join(directory, claim.evidence_artifact));
      assert.notEqual(
        resolvePointer(artifact, claim.evidence_pointer),
        undefined,
        `${manifest.demo_id}/${claim.id} points to missing evidence`
      );
    }
  }
});

test("red-team replay contains all 40 immutable probe rows and correct tallies", async () => {
  const artifact = await json("demos/redteam/artifacts/redteam-benchmark.json");
  assert.equal(artifact.results.length, 40);
  assert.equal(artifact.verdict, "BLOCK");
  assert.deepEqual(artifact.tallies, {
    prompt_injection: 1,
    jailbreak: 0,
    data_exfiltration: 1,
    tool_call_abuse: 1
  });
  assert.equal(artifact.results.filter((probe) => probe.success).length, 3);
  assert.ok(artifact.results.every((probe) => probe.evidence.includes("[REDACTED]")));
});

test("observability replay agrees exactly with trace and load artifacts", async () => {
  const trace = await json("demos/agent-observability/artifacts/forced-failure.json");
  const load = await json("demos/agent-observability/artifacts/trace-load.json");
  assert.equal(trace.meta.run_id, "forced_failure_20260712");
  assert.equal(trace.meta.tenant_id, "portfolio");
  assert.equal(trace.spans.find((span) => span.status === "error").detail.error_code, "POLICY_SERVICE_UNAVAILABLE");
  assert.equal(load.burst_attempted, 150000);
  assert.equal(load.retained_errors, 150);
  assert.equal(load.tenant_crossovers, 0);
  assert.equal(load.raw_payload_fields_persisted, 0);
});

test("evaluation and safety views derive provider metrics from artifacts", async () => {
  const seller = await json("demos/eval-control-tower/artifacts/seller-intelligence-v3.json");
  assert.equal(seller.meta.prompt_count, 24);
  assert.equal(seller.summary.per_model["gpt-5-mini"].avg_quality, 90.4);
  const safety = await json("demos/ai-safety-audit/artifacts/ai-safety-benchmark-summary.json");
  assert.equal(safety.dataset.evaluated_cases, 540);
  assert.deepEqual(safety.models.map((model) => model.cases_success), [540, 540]);
  assert.equal(safety.source_artifact.sha256, "0ae2a228efdf349a0b898a47e6535ac4d90381b6de473dff605979fcf6c24487");
});

test("artifact hashes detect tampering", async () => {
  const manifest = await json("demos/redteam/artifacts/manifest.json");
  const bytes = await readFile(join(root, "demos/redteam/artifacts/redteam-benchmark.json"));
  assert.equal(sha256(bytes), manifest.artifacts[0].sha256);
  assert.notEqual(sha256(Buffer.concat([bytes, Buffer.from("tampered")])), manifest.artifacts[0].sha256);
});

test("public routes declare the correct evidence mode and local imports stay browser-only", async () => {
  const routes = {
    "demos/llm-gateway/index.html": "local_execution",
    "demos/rag-guardrails/index.html": "local_execution",
    "demos/redteam/index.html": "artifact_replay",
    "demos/agent-observability/index.html": "artifact_replay",
    "evals/index.html": "artifact_replay",
    "ai-safety/index.html": "local_execution",
    "demos/amplify/index.html": "workflow_walkthrough"
  };
  for (const [path, mode] of Object.entries(routes)) {
    const html = await text(path);
    assert.ok(html.includes(`data-evidence-mode="${mode}"`), `${path} is missing ${mode}`);
    assert.match(html, /<script[^>]+src="[^"]+\.js\?v=\d{8}-\d+"/, `${path} must cache-bust its demo runtime`);
  }
  const explorer = await text("demos/evidence-explorer.js");
  const safety = await text("ai-safety/app.js");
  assert.ok(!explorer.includes("fetch(file"));
  assert.ok(!safety.includes("fetch(file"));
  assert.ok(explorer.includes("file.text()"));
  assert.ok(safety.includes("file.text()"));
});

test("Gateway fixtures select the policy context their labels promise", async () => {
  const gateway = await text("demos/llm-gateway/index.html");
  const runtime = await text("demos/demo-system.js");
  assert.match(gateway, /Restricted-data block<\/button>/);
  assert.match(gateway, /data-data-class="restricted"[^>]*>Restricted-data block/);
  assert.ok(runtime.includes('button.dataset.dataClass'));
});

test("published HTML contains no mojibake", async () => {
  const htmlFiles = (await readdir(root, { recursive: true })).filter((path) => path.endsWith(".html"));
  for (const path of htmlFiles) {
    assert.doesNotMatch(await text(path), /[âÂÃð�]/u, `${path} contains broken UTF-8 text`);
  }
});

test("case studies link their manifest and disclose reproduction boundaries", async () => {
  const cases = {
    "project-llm-gateway.html": ["llm-gateway", "demos/llm-gateway/artifacts/manifest.json"],
    "project-rag-pipeline.html": ["rag-guardrails", "demos/rag-guardrails/artifacts/manifest.json"],
    "project-redteam-harness.html": ["redteam", "demos/redteam/artifacts/manifest.json"],
    "project-agent-observability.html": ["agent-observability", "demos/agent-observability/artifacts/manifest.json"],
    "ai-eval-control-tower.html": ["eval-control-tower", "demos/eval-control-tower/artifacts/manifest.json"],
    "project-ai-safety.html": ["ai-safety-audit", "demos/ai-safety-audit/artifacts/manifest.json"],
    "project-amplify.html": ["amplify", "demos/amplify/artifacts/manifest.json"]
  };
  for (const [path, [demoId, manifest]] of Object.entries(cases)) {
    const html = await text(path);
    const source = portfolioEvidenceSources.find((candidate) => candidate.demoId === demoId);
    assert.ok(html.includes(manifest), `${path} does not link its manifest`);
    assert.ok(html.includes("Evidence contract"), `${path} has no evidence contract`);
    assert.ok(
      html.includes(source.generatorCommand.replaceAll("&", "&amp;")),
      `${path} has drifted from the manifest generator command`
    );
  }
});
