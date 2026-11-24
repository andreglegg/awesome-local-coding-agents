# Free remote CPU benchmark pilot

This workflow lets repository maintainers run **real local-model agents** on a public GitHub Actions 4-CPU, 16-GB Linux runner without relying on a personal machine. Public standard runner minutes are free, but there is **no GPU** and the small-model harness may be impractically slow or fail. These are empirical outcomes, not endorsements.

The `.github/workflows/benchmark-pilot.yml` workflow can be started manually from Actions when it is on the default branch, selecting `forge`, `opencode`, or `codex-cli`, T0–T3, and attempt 1–3. The special `benchmark-pilot/**` branch trigger is only for commissioning the workflow; it starts Forge/T0/attempt 1. Do not use it for regular unreviewed PR submissions.

The Docker image contains pinned versions of the 3 CLIs and Ollama. The model is **qwen2.5-coder:1.5b**, pulled during image build. Version, CLI flags, setup and context length are recorded. **Ollama's model tag should be further pinned by its resolved digest before treating runs as fully reproducible.** This is only a low-resource capability pilot, not a final fair 7B–14B ranking.

The container has no external network (`docker run --network=none`), no GitHub credentials, no host home mount, dropped capabilities, CPU/memory/pid limits, and a disposable fixture workspace. The evaluator runs **outside the agent container** and never appears in its workspace. Do not put sensitive data into test prompts. Initial image/package/model downloads happen while network is available; only the actual agent run is isolated.

The workflow uploads JSON results and separate agent/evaluator logs **even for failures**, retained for 30 days. It never commits any benchmark data or auto-awards verification badges. A maintainer must inspect the original logs, model digest/quantization, and metadata, and independently reproduce qualifying runs before accepting any `verified` status.

For the Issue #7 full pilot, run all 3 agents across T0–T3 with 3 fresh attempts each, preserve 36 outputs, and record the precise model digest/quantization from Ollama. If a CLI does not initialize, record a failed run and fix the harness in a separate, versioned change, never silently rewrite past results.

**Known limitation:** OpenCode and Codex may require larger context windows than the 8K pilot allocation. This may produce valid failure evidence, but cannot by itself be interpreted as comparative performance. Re-run at a common, model-supported context if the runner has enough memory.
