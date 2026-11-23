# Benchmarks

This directory holds the benchmark task contracts and submitted raw results.

## Current state

v0.2 includes deterministic resettable **T0-T3 fixture projects and evaluators** under [`fixtures/`](fixtures/README.md). Run `npm run fixtures:check` to smoke-test known failures and reference fixes. These are not runs of any real coding agent.

A `verified` badge still requires original, independently reviewed run records with the same <=14B agent/model configuration passing T0, T2 and at least one of T1/T3. No agent has qualified yet.

## Result filenames

Use:

```text
<agent-id>--<model-slug>--<task-id>--<YYYYMMDD>-<attempt>.json
```

Example:

```text
hax--qwen3-coder-8b-q4_k_m--t2-v1--20261004-1.json
```

## Submission principles

- preserve failed attempts;
- remove secrets;
- use a clean task fixture;
- record manual intervention truthfully;
- prefer immutable agent/model versions;
- include verifier output.
