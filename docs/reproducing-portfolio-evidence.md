# Reproducing portfolio benchmarks

Run these commands in each linked source repository. Public case studies focus on the product decision and the recorded results.

## project-ai-safety.html

`npm run ai-safety:bench -- --limit 540`

## ai-eval-control-tower.html

`npm test && npm run eval:sproutroute:full && npm run eval:seller:v3`

## project-agent-observability.html

`npm test && npm run trace:failure && npm run trace:load`

## project-llm-gateway.html

`npm test && npm run benchmark && npm run load`

## project-rag-pipeline.html

`npm test && npm run eval && npm run gate`

## project-redteam-harness.html

`npm test && npm run redteam:bench`
