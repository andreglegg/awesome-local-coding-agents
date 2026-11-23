import test from "node:test";
import assert from "node:assert/strict";
import { validateBenchmarkResults } from "../scripts/validate-benchmarks.mjs";

const agent = () => ({
  id: "example", smallModelStatus: "verified", smallestVerifiedModel: { name: "model-8b", totalParametersB: 8 },
  benchmarkResults: ["benchmarks/results/t0.json", "benchmarks/results/t2.json", "benchmarks/results/t1.json"]
});
const result = (task) => ({
  schemaVersion: 1, task: { id: task, version: 1 },
  agent: { id: "example", version: "v1" },
  model: { id: "model-8b", family: "model", totalParametersB: 8, activeParametersB: null, quantization: "Q4_K_M" },
  runtime: { backend: "Ollama", version: "1.0", contextTokens: 8192 },
  hardware: { os: "Linux", cpu: "x86_64", gpu: "none", systemRamGB: 16, acceleratorMemoryGB: 0, memoryType: "unified" },
  execution: { command: "agent test", startedAt: "2026-11-23T00:00:00Z", elapsedSeconds: 10, manualInterventions: 0, networkEnabled: false },
  outcome: { passed: true, toolCallFailures: 0, verifier: "node --test" }
});
const inputs = () => {
  const a = agent();
  const results = Object.fromEntries(["t0", "t2", "t1"].map((t) => ["benchmarks/results/" + t + ".json", result(t)]));
  return { dataset: { agents: [a] }, results, a };
};

test("recognizes same-configuration T0/T2/T1 evidence", () => {
  const x = inputs();
  assert.deepEqual(validateBenchmarkResults(x.dataset, x.results), []);
});
test("rejects a verified badge missing T2", () => {
  const x = inputs(); x.results["benchmarks/results/t2.json"].outcome.passed = false;
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /verified requires/);
});
test("rejects manual intervention", () => {
  const x = inputs(); x.results["benchmarks/results/t0.json"].execution.manualInterventions = 1;
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /verified requires/);
});
test("rejects mixed model configurations", () => {
  const x = inputs(); x.results["benchmarks/results/t1.json"].runtime.contextTokens = 4096;
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /verified requires/);
});
test("rejects fabricated result path", () => {
  const x = inputs(); delete x.results["benchmarks/results/t2.json"];
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /not found/);
});
test("rejects oversized models", () => {
  const x = inputs(); for (const r of Object.values(x.results)) r.model.totalParametersB = 32;
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /verified requires/);
});
test("rejects incomplete metadata", () => {
  const x = inputs(); x.results["benchmarks/results/t0.json"].hardware.cpu = "";
  assert.match(validateBenchmarkResults(x.dataset, x.results).join(" "), /hardware metadata/);
});
