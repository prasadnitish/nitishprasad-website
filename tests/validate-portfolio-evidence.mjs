import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolioEvidenceSources } from "../evidence/sources.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modes = new Set(["local_execution", "artifact_replay", "workflow_walkthrough"]);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

for (const expected of portfolioEvidenceSources) {
  const manifestPath = join(root, expected.publicDirectory, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert.equal(manifest.demo_id, expected.demoId);
  assert.ok(modes.has(manifest.mode), `${expected.demoId}: invalid evidence mode`);
  assert.match(manifest.source_commit, /^[a-f0-9]{40}$/);
  assert.ok(manifest.source_repository.startsWith("https://"));
  assert.ok(manifest.generator_command);
  assert.ok(Number.isFinite(Date.parse(manifest.generated_at)));
  assert.ok(Array.isArray(manifest.claims) && manifest.claims.length > 0);
  assert.ok(Array.isArray(manifest.limitations) && manifest.limitations.length > 0);

  for (const artifact of manifest.artifacts) {
    const bytes = await readFile(join(root, expected.publicDirectory, artifact.path));
    assert.equal(bytes.byteLength, artifact.bytes, `${expected.demoId}/${artifact.path}: byte count drift`);
    assert.equal(sha256(bytes), artifact.sha256, `${expected.demoId}/${artifact.path}: SHA-256 drift`);
  }

  for (const alias of expected.aliases || []) {
    const aliasManifest = JSON.parse(await readFile(join(root, alias, "manifest.json"), "utf8"));
    assert.deepEqual(aliasManifest, manifest, `${expected.demoId}: alias manifest drift`);
  }
}

const demoSystem = await readFile(join(root, "demos/demo-system.js"), "utf8");
for (const banned of [
  "successMap",
  "Modeled response",
  "Graph score",
  "Vector baseline",
  "confidence: 'High'",
  "&lt;500ms P95",
  "fixture.safe.test"
]) {
  assert.ok(!demoSystem.includes(banned), `Legacy superficial rendering remains: ${banned}`);
}

const homepage = await readFile(join(root, "index.html"), "utf8");
for (const label of ["Run locally", "Inspect evidence", "Explore workflow"]) {
  assert.ok(homepage.includes(label), `Homepage is missing evidence CTA: ${label}`);
}

console.log(`Validated ${portfolioEvidenceSources.length} evidence manifests and all public artifact hashes.`);
