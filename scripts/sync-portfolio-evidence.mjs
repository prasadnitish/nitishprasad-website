import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { portfolioEvidenceSources } from "../evidence/sources.mjs";

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcesRoot = resolve(process.env.PORTFOLIO_SOURCES_ROOT || join(websiteRoot, ".."));

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function git(repo, ...args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8" }).trim();
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function materializeFile(sourceRoot, targetRoot, file) {
  const input = await readFile(join(sourceRoot, file.source));
  const output = join(targetRoot, file.target);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, input);
  return {
    name: file.name,
    path: file.target,
    sha256: sha256(input),
    bytes: input.byteLength,
    media_type: "application/json"
  };
}

async function materializeProjection(sourceRoot, targetRoot, projection) {
  const input = await readFile(join(sourceRoot, projection.source));
  const parsed = JSON.parse(input);
  if (projection.type !== "ai_safety_summary") {
    throw new Error(`Unsupported projection: ${projection.type}`);
  }
  const value = {
    version: "1.0",
    generated_at: parsed.generated_at,
    dataset: parsed.dataset,
    settings: parsed.settings,
    models: parsed.models,
    source_artifact: {
      path: projection.source,
      sha256: sha256(input),
      bytes: input.byteLength,
      per_case_transcripts_public: false
    }
  };
  const output = Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
  await mkdir(targetRoot, { recursive: true });
  await writeFile(join(targetRoot, projection.target), output);
  return {
    name: projection.name,
    path: projection.target,
    sha256: sha256(output),
    bytes: output.byteLength,
    media_type: "application/json"
  };
}

for (const source of portfolioEvidenceSources) {
  const sourceRoot = join(sourcesRoot, source.sourceDirectory);
  const targetRoot = join(websiteRoot, source.publicDirectory);
  const head = git(sourceRoot, "rev-parse", "HEAD");
  try {
    git(sourceRoot, "merge-base", "--is-ancestor", source.sourceCommit, head);
  } catch {
    throw new Error(`${source.demoId}: required source commit ${source.sourceCommit} is not present at ${sourceRoot}`);
  }

  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(targetRoot, { recursive: true });

  const artifacts = [];
  for (const file of source.files || []) {
    artifacts.push(await materializeFile(sourceRoot, targetRoot, file));
  }
  if (source.projection) {
    artifacts.push(await materializeProjection(sourceRoot, targetRoot, source.projection));
  }
  if (source.authoredArtifact) {
    const output = Buffer.from(`${JSON.stringify(source.authoredArtifact.value, null, 2)}\n`);
    await writeFile(join(targetRoot, source.authoredArtifact.target), output);
    artifacts.push({
      name: source.authoredArtifact.name,
      path: source.authoredArtifact.target,
      sha256: sha256(output),
      bytes: output.byteLength,
      media_type: "application/json"
    });
  }

  const manifest = {
    demo_id: source.demoId,
    mode: source.mode,
    source_repository: source.sourceRepository,
    source_commit: source.sourceCommit,
    generated_at: source.generatedAt,
    generator_command: source.generatorCommand,
    inputs: artifacts.map((artifact) => ({
      name: artifact.name,
      path: artifact.path,
      sha256: artifact.sha256,
      bytes: artifact.bytes
    })),
    artifacts,
    environment: source.environment,
    providers: source.providers,
    claims: source.claims,
    limitations: source.limitations
  };
  await writeJson(join(targetRoot, "manifest.json"), manifest);

  for (const alias of source.aliases || []) {
    const aliasRoot = join(websiteRoot, alias);
    await rm(aliasRoot, { recursive: true, force: true });
    await mkdir(aliasRoot, { recursive: true });
    for (const artifact of artifacts) {
      const bytes = await readFile(join(targetRoot, artifact.path));
      await mkdir(dirname(join(aliasRoot, artifact.path)), { recursive: true });
      await writeFile(join(aliasRoot, artifact.path), bytes);
    }
    await writeJson(join(aliasRoot, "manifest.json"), manifest);
  }

  console.log(`${source.demoId}: ${artifacts.length} artifact(s) -> ${relative(websiteRoot, targetRoot)}`);
}
