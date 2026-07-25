import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = JSON.parse(await readFile(join(root, "demos/graphrag/artifacts.json"), "utf8"));
const caseStudy = await readFile(join(root, "project-graphrag.html"), "utf8");

assert.equal(artifacts.publishable_graph_vs_vector_claim, false);

const incident = artifacts.scenarios.incidents;
const seller = artifacts.scenarios.seller;

assert.deepEqual(incident.counts, {
  sources: 9,
  mapped_fields: 22,
  nodes: 17,
  relationships: 17,
  chunks: 36,
});
assert.deepEqual(seller.counts, {
  sources: 8,
  mapped_fields: 20,
  nodes: 33,
  relationships: 53,
  chunks: 87,
});
assert.deepEqual(
  [incident.evaluation.passed, incident.evaluation.cases],
  [40, 40],
);
assert.deepEqual(
  [seller.evaluation.passed, seller.evaluation.cases],
  [37, 40],
);

for (const claim of [
  "40 / 40",
  "37 / 40",
  "17 nodes",
  "33 nodes",
  "No committed artifact yet proves GraphRAG beats vector RAG",
]) {
  assert.ok(caseStudy.includes(claim), `Missing case-study evidence claim: ${claim}`);
}

assert.ok(!caseStudy.includes("Offline wins"));
assert.ok(!caseStudy.includes("100% win"));
assert.ok(!caseStudy.includes("Graph score"));

console.log("GraphRAG website claims match the committed artifact manifest.");
