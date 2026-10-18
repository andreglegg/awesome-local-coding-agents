# Awesome Local Coding Agents

[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CLI coding agents for local LLMs and small models — curated with evidence, hardware-aware metadata, and reproducible verification.**

> Local-capable is a compatibility claim. **Small-model verified is an empirical claim.**

Last reviewed dataset: **2026-10-18** · 10 active agents · 4 local-first · 5 small-model candidates · **0 small-model verified**

## Why this list exists

Many coding agents say they support Ollama or an OpenAI-compatible endpoint. That does not tell you whether the agent is practical with a 7B, 8B, or 14B model, whether tool calls survive weaker models, how much context the harness burns, or what hardware was used.

This repository separates **documented local compatibility** from **measured small-model performance**. The long-term goal is to answer questions like:

- What is the best CLI coding agent for a 16 GB Apple Silicon machine?
- Which harness works reliably with a <=14B coder model?
- Which agent has the lowest tool-call failure rate with local inference?
- Which model + quantization + runtime combination is actually reproducible?

## Legend

- 🟢 **Local-first** — local inference is a first-class design path.
- 🟡 **Local-capable** — documented local inference exists, but it is not the project's primary identity.
- 🧪 **Candidate** — engineering signals suggest small-model friendliness, but qualifying benchmark evidence has not been submitted.
- ✅ **Verified** — qualifying <=14B benchmark evidence exists in this repository.
- ◻️ **Unverified** — local support is documented, but no small-model claim is made.

## Agents

| Agent | Profile | Local backends | Offline | Small-model status | Smallest verified | Evidence |
| --- | --- | --- | :---: | --- | --- | --- |
| [Atomic Agent](https://github.com/AtomicBot-ai/atomic-agent) | 🟢 Local-first | llama.cpp, OpenAI-compatible | ✅ | 🧪 Candidate | — | [E1](https://github.com/AtomicBot-ai/atomic-agent/blob/main/README.md) |
| [hax](https://github.com/OleksandrChekhovskyi/hax) | 🟢 Local-first | llama.cpp, Ollama, OpenAI-compatible | ✅ | 🧪 Candidate | — | [E1](https://github.com/OleksandrChekhovskyi/hax/blob/master/README.md) |
| [Swival](https://github.com/Swival/swival) | 🟢 Local-first | llama.cpp, Ollama, vLLM, MLX, LocalAI, OpenAI-compatible | ✅ | 🧪 Candidate | — | [E1](https://github.com/Swival/swival/blob/master/README.md) [E2](https://github.com/Swival/swival/blob/master/docs.md/providers.md) |
| [agentty](https://github.com/1ay1/agentty) | 🟡 Local-capable | Ollama, OpenAI-compatible | ✅ | 🧪 Candidate | — | [E1](https://github.com/1ay1/agentty/blob/master/README.md) |
| [goose](https://github.com/aaif-goose/goose) | 🟡 Local-capable | Ollama, llama.cpp | ◐ | 🧪 Candidate | — | [E1](https://github.com/aaif-goose/goose/blob/main/README.md) [E2](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/tool-shim.md) |
| [Nanocoder](https://github.com/Nano-Collective/nanocoder) | 🟢 Local-first | Ollama, OpenAI-compatible | ✅ | ◻️ Unverified | — | [E1](https://github.com/Nano-Collective/nanocoder/blob/main/README.md) |
| [Aider](https://github.com/Aider-AI/aider) | 🟡 Local-capable | Ollama, OpenAI-compatible | ◐ | ◻️ Unverified | — | [E1](https://github.com/Aider-AI/aider/blob/main/aider/website/docs/llms.md) |
| [Forge](https://github.com/andreglegg/forge) | 🟡 Local-capable | llama.cpp, LM Studio, vLLM, Ollama, OpenAI-compatible | ◐ | ◻️ Unverified | — | [E1](https://github.com/andreglegg/forge/blob/main/src/provider.ts) |
| [OliveCode](https://github.com/BenjaminZajko/opencodeFORK) | 🟡 Local-capable | Ollama | ◐ | ◻️ Unverified | — | [E1](https://github.com/BenjaminZajko/opencodeFORK/blob/dev/README.md) [E2](https://github.com/BenjaminZajko/opencodeFORK/blob/v0.1.0/packages/opencode/src/onboarding/ollama.ts) |
| [Tau](https://github.com/huggingface/tau) | 🟡 Local-capable | llama.cpp, Ollama, OpenAI-compatible | ◐ | ◻️ Unverified | — | [E1](https://github.com/huggingface/tau/blob/main/website/content/guides/providers-and-models.md) |

### Notes

A **candidate** label is intentionally not a performance claim. It means the project's design contains a relevant signal — for example explicit small-model support, context reduction, a tool-call shim, or unusually low harness overhead — that makes it worth benchmarking.

No project receives the **Verified** label from documentation alone.

## Model tiers

| Tier | Total parameter count |
| --- | ---: |
| **Tiny** | <= 4B |
| **Small** | > 4B and <= 14B |
| **Medium-local** | > 14B and <= 32B |
| **Large-local** | > 32B |

For MoE models, total parameters determine the tier; active parameters should also be recorded. Quantization is reported separately and does not change the tier.

## Verification

To earn **Small-model verified**, an agent must have reproducible evidence using a model with <=14B total parameters and satisfy the core benchmark gate:

1. pass **T0 Tool Use**;
2. pass **T2 Bug Fix**;
3. pass at least one of **T1 Repository Understanding** or **T3 Multi-file Change**;
4. complete those runs without manual intervention beyond the initial task and ordinary permission approval.

See [Benchmark methodology](docs/methodology.md) and [Verification policy](docs/verification.md).

## What qualifies for the list?

An active entry must have a real terminal interface, be able to operate on a codebase, provide a documented route to local inference, remain currently usable, and include first-party evidence.

Cloud-only tools, IDE-only assistants, raw inference servers, and generic frameworks without a usable coding CLI are outside the active scope.

## Contributing

PRs are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md). New entries must update `data/agents.json`; do not hand-edit this README.

Run:

```bash
npm run generate
npm run check
```

For the full design rationale and roadmap, see [SPEC.md](SPEC.md).

## Related projects

- [Awesome CLI Coding Agents](https://github.com/bradAGI/awesome-cli-coding-agents) — broad directory of terminal coding agents and harnesses.
- [Awesome AI Coding on a Budget](https://github.com/mrtnrocks/awesome-ai-coding-on-a-budget) — broader cost-efficiency guide covering models, routing, compression, runtimes, and tooling.

## License

[MIT](LICENSE)
