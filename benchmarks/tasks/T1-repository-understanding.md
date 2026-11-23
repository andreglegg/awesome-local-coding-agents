# t1-v1 — Versioned task

**Fixture:** `benchmarks/fixtures/t1-v1/project/` copied into a clean isolated workspace.

**Exact agent prompt:**

> Inspect this codebase without editing existing files. Create architecture.json in the workspace root containing six string fields: entryPoint, requestModule, cacheModule, dataModule, cacheKeyPrefix, databaseFunction. Determine their values from the source code. Use exact paths/names.

**Pass:** `node benchmarks/evaluators/evaluate.mjs t1-v1 /absolute/workspace/path` exits 0. Human intervention beyond ordinary permission approvals invalidates verification. Do not share evaluator/reference solutions with the agent.
