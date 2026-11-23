# Choosing a Local Coding Agent

The directory is evidence-backed, not ranked by stars, marketing, or unverifiable speed claims.

## Start with your inference backend

| What you already run | Agents to investigate | Evidence status |
| --- | --- | --- |
| Ollama | OpenCode, Qwen Code, Crush, Nanocoder, goose, Aider, Codex CLI | Documented local support; **no reproducible small-model results yet** |
| LM Studio | OpenCode, Codex CLI, Forge | Documented local compatibility; runtime/model details still matter |
| llama.cpp / OpenAI-compatible server | Forge, Aider, Swival, hax, Tau | Verify each project's documented endpoint configuration |
| Lean terminal-first workflows | hax, Atomic Agent, agentty, Swival | Candidate engineering signals are **not** benchmark wins |

This is a *starting point*, not a claim that all the agents above perform equally well. For exact backend support and first-party evidence, see the [generated agent table](../README.md#agents).

## What does "small model" mean?

This project uses **total parameters**: tiny <=4B, small >4B to <=14B. Quantization, context length, KV cache, tool-call formatting and total resident memory affect hardware feasibility independently.

**There are currently no official results establishing which agent works on 8 GB VRAM, 16 GB Apple Silicon, or CPU-only hardware.** Do not interpret model size or an Ollama checkbox as a hardware compatibility guarantee.

## How to choose responsibly

1. Select a backend that you have actually configured on your computer.
2. Check the upstream first-party evidence and current project maintenance status.
3. Prefer a model with explicit tool-use support; test editing and shell execution before using it on valuable code.
4. Use a disposable project and run the [T0-T3 benchmark fixtures](../benchmarks/fixtures/README.md). Record agent/model/runtime/hardware and unsuccessful attempts too.
5. Run real work with version control, a backup, approval gates and no private credentials in prompts until you trust the combination.

## Reading the labels

- **Local-first:** local inference is a first-class project path.
- **Local-capable:** local inference is documented but not necessarily the main focus.
- **Candidate:** engineering clues justify prioritizing small-model experiments, but no reproducible performance guarantee.
- **Verified:** only qualifying benchmark runs from one <=14B model configuration across T0, T2 and T1 or T3.

For model/runtime/hardware measurements and how badges are earned, see [methodology](methodology.md) and [verification](verification.md).
