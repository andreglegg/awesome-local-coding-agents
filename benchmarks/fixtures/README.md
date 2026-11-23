# Executable coding-agent benchmark fixtures (v1)

The task fixtures are deliberately seeded to fail, with independent evaluator scripts and self-checking reference solutions. **Fixture checks are not results of an LLM run.** No agent receives a verified badge from them.

To benchmark:
1. Copy **only** `benchmarks/fixtures/<task>-v1/project/` into a clean, disposable workspace. Do not expose this repository's evaluators, other fixture tasks, or reference solutions to the agent.
2. Start the agent with the task's *exact prompt* from `benchmarks/tasks/`. Pin the agent revision, model, quantization, inference runtime, context and hardware. Disable network and exclude all credentials/private files.
3. Allow only routine permissions; do not offer hints, patches or retries with an altered model.
4. After it finishes, from **outside** the workspace run `node benchmarks/evaluators/evaluate.mjs t0-v1 /absolute/workspace/path` (change task).
5. Preserve passing and failing attempts as JSON from `benchmarks/results/result.template.json`. The verified gate remains passing T0+T2+(T1 or T3), unassisted, with the **same <=14B model configuration**.

`npm run fixtures:check` verifies seeded failures and known-solution successes for T0-T3. T4 is not implemented yet.
