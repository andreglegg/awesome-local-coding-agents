# t0-v1 — Versioned task

**Fixture:** `benchmarks/fixtures/t0-v1/project/` copied into a clean isolated workspace.

**Exact agent prompt:**

> Run the project's tests, inspect the relevant source code, fix the failing greeting test by updating the implementation, and rerun the tests. Do not delete or weaken tests.

**Pass:** `node benchmarks/evaluators/evaluate.mjs t0-v1 /absolute/workspace/path` exits 0. Human intervention beyond ordinary permission approvals invalidates verification. Do not share evaluator/reference solutions with the agent.
