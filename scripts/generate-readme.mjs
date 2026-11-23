import fs from "node:fs";
import process from "node:process";

const dataset = JSON.parse(fs.readFileSync("data/agents.json", "utf8"));
const tiers = JSON.parse(fs.readFileSync("data/model-tiers.json", "utf8"));

const statusRank = { verified: 0, candidate: 1, unverified: 2 };
const profileRank = { "local-first": 0, "local-capable": 1 };

const ordered = [...dataset.agents]
  .filter((agent) => agent.status === "active")
  .sort((a, b) =>
    statusRank[a.smallModelStatus] - statusRank[b.smallModelStatus] ||
    profileRank[a.localSupport] - profileRank[b.localSupport] ||
    a.name.localeCompare(b.name)
  );

const badge = (agent) => {
  if (agent.smallModelStatus === "verified") return "✅ Verified";
  if (agent.smallModelStatus === "candidate") return "🧪 Candidate";
  return "◻️ Unverified";
};

const profile = (agent) =>
  agent.localSupport === "local-first" ? "🟢 Local-first" : "🟡 Local-capable";

const offline = (value) => {
  if (value === "yes") return "✅";
  if (value === "conditional") return "◐";
  return "?";
};

const verifiedModel = (agent) => {
  if (!agent.smallestVerifiedModel) return "—";
  const model = agent.smallestVerifiedModel;
  return `${model.name} (${model.totalParametersB}B, ${model.quantization ?? "unquantized"})`;
};

const evidenceLinks = (agent) =>
  agent.evidence.map((item, index) => `[E${index + 1}](${item.url})`).join(" ");

const verifiedCount = ordered.filter((agent) => agent.smallModelStatus === "verified").length;
const candidateCount = ordered.filter((agent) => agent.smallModelStatus === "candidate").length;
const localFirstCount = ordered.filter((agent) => agent.localSupport === "local-first").length;

const lines = [
  "# Awesome Local Coding Agents",
  "",
  "[![Awesome](https://awesome.re/badge.svg)](https://awesome.re)",
  "[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)",
  "[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)",
  "",
  "**CLI coding agents for local LLMs and small models — curated with evidence, hardware-aware metadata, and reproducible verification.**",
  "",
  "> Local-capable is a compatibility claim. **Small-model verified is an empirical claim.**",
  "",
  `Last reviewed dataset: **${dataset.updated}** · ${ordered.length} active agents · ${localFirstCount} local-first · ${candidateCount} small-model candidates · **${verifiedCount} small-model verified**`,
  "",
  "## Why this list exists",
  "",
  "Many coding agents say they support Ollama or an OpenAI-compatible endpoint. That does not tell you whether the agent is practical with a 7B, 8B, or 14B model, whether tool calls survive weaker models, how much context the harness burns, or what hardware was used.",
  "",
  "This repository separates **documented local compatibility** from **measured small-model performance**. The long-term goal is to answer questions like:",
  "",
  "- What is the best CLI coding agent for a 16 GB Apple Silicon machine?",
  "- Which harness works reliably with a <=14B coder model?",
  "- Which agent has the lowest tool-call failure rate with local inference?",
  "- Which model + quantization + runtime combination is actually reproducible?",
  "",
  "## Legend",
  "",
  "- 🟢 **Local-first** — local inference is a first-class design path.",
  "- 🟡 **Local-capable** — documented local inference exists, but it is not the project's primary identity.",
  "- 🧪 **Candidate** — engineering signals suggest small-model friendliness, but qualifying benchmark evidence has not been submitted.",
  "- ✅ **Verified** — qualifying <=14B benchmark evidence exists in this repository.",
  "- ◻️ **Unverified** — local support is documented, but no small-model claim is made.",
  "",
  "## Agents",
  "",
  "| Agent | Profile | Local backends | Offline | Small-model status | Smallest verified | Evidence |",
  "| --- | --- | --- | :---: | --- | --- | --- |",
  ...ordered.map((agent) =>
    `| [${agent.name}](${agent.repository}) | ${profile(agent)} | ${agent.backends.join(", ")} | ${offline(agent.offline)} | ${badge(agent)} | ${verifiedModel(agent)} | ${evidenceLinks(agent)} |`
  ),
  "",
  "### Notes",
  "",
  "A **candidate** label is intentionally not a performance claim. It means the project's design contains a relevant signal — for example explicit small-model support, context reduction, a tool-call shim, or unusually low harness overhead — that makes it worth benchmarking.",
  "",
  "No project receives the **Verified** label from documentation alone.",
  "",
  "## Model tiers",
  "",
  "| Tier | Total parameter count |",
  "| --- | ---: |",
  ...tiers.tiers.map((tier) => {
    let range;
    if (tier.minExclusiveB === null) range = `<= ${tier.maxInclusiveB}B`;
    else if (tier.maxInclusiveB === null) range = `> ${tier.minExclusiveB}B`;
    else range = `> ${tier.minExclusiveB}B and <= ${tier.maxInclusiveB}B`;
    return `| **${tier.label}** | ${range} |`;
  }),
  "",
  "For MoE models, total parameters determine the tier; active parameters should also be recorded. Quantization is reported separately and does not change the tier.",
  "",
  "## Verification",
  "",
  "To earn **Small-model verified**, an agent must have reproducible evidence using a model with <=14B total parameters and satisfy the core benchmark gate:",
  "",
  "1. pass **T0 Tool Use**;",
  "2. pass **T2 Bug Fix**;",
  "3. pass at least one of **T1 Repository Understanding** or **T3 Multi-file Change**;",
  "4. complete those runs without manual intervention beyond the initial task and ordinary permission approval.",
  "",
  "See [Benchmark methodology](docs/methodology.md) and [Verification policy](docs/verification.md).",
  "",
  "## What qualifies for the list?",
  "",
  "An active entry must have a real terminal interface, be able to operate on a codebase, provide a documented route to local inference, remain currently usable, and include first-party evidence.",
  "",
  "Cloud-only tools, IDE-only assistants, raw inference servers, and generic frameworks without a usable coding CLI are outside the active scope.",
  "",
  "## Contributing",
  "",
  "PRs are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md). New entries must update `data/agents.json`; do not hand-edit this README.",
  "",
  "Run:",
  "",
  "```bash",
  "npm run generate",
  "npm run check",
  "```",
  "",
  "See [Choose a coding agent](docs/choosing-an-agent.md) for guidance on local backends and hardware claims.",
  "Use [reproducible benchmark fixtures](benchmarks/fixtures/README.md) to measure real agent/model performance.",
  "",
  "For the full design rationale and roadmap, see [SPEC.md](SPEC.md).",
  "",
  "## Contributors",
  "",
  "Thanks to our [community contributors](CONTRIBUTORS.md), including authors whose submitted PRs were integrated through follow-up maintainer commits.",
  "",
  "## Related projects",
  "",
  "- [Awesome CLI Coding Agents](https://github.com/bradAGI/awesome-cli-coding-agents) — broad directory of terminal coding agents and harnesses.",
  "- [Awesome AI Coding on a Budget](https://github.com/mrtnrocks/awesome-ai-coding-on-a-budget) — broader cost-efficiency guide covering models, routing, compression, runtimes, and tooling.",
  "",
  "## License",
  "",
  "[MIT](LICENSE)"
];

const output = `${lines.join("\n")}\n`;
const readmePath = "README.md";

if (process.argv.includes("--check")) {
  const current = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
  if (current !== output) {
    console.error("README.md is stale. Run: npm run generate");
    process.exit(1);
  }
  console.log("README.md is up to date");
} else {
  fs.writeFileSync(readmePath, output);
  console.log(`generated README.md from ${ordered.length} active agents`);
}
