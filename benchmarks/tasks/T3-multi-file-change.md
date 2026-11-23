# t3-v1 — Versioned task

**Fixture:** `benchmarks/fixtures/t3-v1/project/` copied into a clean isolated workspace.

**Exact agent prompt:**

> Implement coupon WELCOME10 as a 10% discount on the subtotal; checkout() must return rounded subtotal, discount and total. Other coupons must leave totals unchanged. Update both the discount calculation and checkout integration files. Run the tests.

**Pass:** `node benchmarks/evaluators/evaluate.mjs t3-v1 /absolute/workspace/path` exits 0. Human intervention beyond ordinary permission approvals invalidates verification. Do not share evaluator/reference solutions with the agent.
