# t2-v1 — Versioned task

**Fixture:** `benchmarks/fixtures/t2-v1/project/` copied into a clean isolated workspace.

**Exact agent prompt:**

> The test suite is failing. Diagnose and fix the implementation without altering tests or weakening input validation, then rerun the tests.

**Pass:** `node benchmarks/evaluators/evaluate.mjs t2-v1 /absolute/workspace/path` exits 0. Human intervention beyond ordinary permission approvals invalidates verification. Do not share evaluator/reference solutions with the agent.
