import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resultsDir = path.join(root, "benchmarks", "results");
const taskIds = new Set(["t0", "t1", "t2", "t3", "t4"]);
const isString = (v) => typeof v === "string" && v.trim().length > 0;
const numeric = (v) => typeof v === "number" && Number.isFinite(v);
const positive = (v) => numeric(v) && v > 0;
const nonNegative = (v) => numeric(v) && v >= 0;

export function validateBenchmarkResults(dataset, results) {
  const errors = [];
  const agents = new Map((dataset.agents ?? []).map((agent) => [agent.id, agent]));
  const configKey = (r) => JSON.stringify([
    r.agent?.id, r.agent?.version, r.model?.id, r.model?.totalParametersB,
    r.model?.quantization, r.runtime?.backend, r.runtime?.version, r.runtime?.contextTokens
  ]);

  for (const [filename, r] of Object.entries(results)) {
    const prefix = filename;
    const err = (message) => errors.push(prefix + ": " + message);
    if (!r || typeof r !== "object") { err("must contain JSON object"); continue; }
    if (r.schemaVersion !== 1) err("schemaVersion must be 1");
    if (!taskIds.has(r.task?.id) || r.task?.version !== 1) err("unknown task/version");
    if (!isString(r.agent?.id) || !agents.has(r.agent?.id)) err("unknown agent.id");
    if (!isString(r.agent?.version)) err("agent.version required");
    if (!isString(r.model?.id) || !isString(r.model?.family)) err("model id/family required");
    if (!positive(r.model?.totalParametersB)) err("totalParametersB must be positive");
    if (r.model?.activeParametersB != null && !positive(r.model?.activeParametersB)) err("activeParametersB invalid");
    if (!isString(r.model?.quantization)) err("quantization required");
    if (!isString(r.runtime?.backend) || !isString(r.runtime?.version) || !positive(r.runtime?.contextTokens)) err("runtime backend/version/contextTokens required");
    if (!isString(r.hardware?.os) || !isString(r.hardware?.cpu) || !isString(r.hardware?.gpu) ||
        !positive(r.hardware?.systemRamGB) || !nonNegative(r.hardware?.acceleratorMemoryGB) ||
        !["VRAM", "unified"].includes(r.hardware?.memoryType)) err("hardware metadata missing/invalid");
    if (!isString(r.execution?.command) || Number.isNaN(Date.parse(r.execution?.startedAt)) ||
        !nonNegative(r.execution?.elapsedSeconds) || !Number.isInteger(r.execution?.manualInterventions) ||
        r.execution.manualInterventions < 0 || typeof r.execution.networkEnabled !== "boolean") err("execution metadata missing/invalid");
    if (typeof r.outcome?.passed !== "boolean" || !Number.isInteger(r.outcome?.toolCallFailures) ||
        r.outcome.toolCallFailures < 0 || !isString(r.outcome?.verifier)) err("outcome metadata missing/invalid");
  }

  for (const agent of dataset.agents ?? []) {
    const refs = agent.benchmarkResults ?? [];
    if (!Array.isArray(refs)) continue; // Also checked by base validator
    const seen = new Set();
    const valid = [];
    for (const ref of refs) {
      if (typeof ref !== "string" || !/^benchmarks\/results\/[a-zA-Z0-9_.-]+\.json$/.test(ref)) {
        errors.push(agent.id + ": invalid benchmarkResults path " + String(ref));
        continue;
      }
      if (seen.has(ref)) errors.push(agent.id + ": duplicate benchmarkResults " + ref);
      seen.add(ref);
      const r = results[ref];
      if (!r) { errors.push(agent.id + ": benchmark file not found " + ref); continue; }
      if (r.agent?.id !== agent.id) errors.push(agent.id + ": result refers to different agent " + ref);
      else valid.push(r);
    }
    if (agent.smallModelStatus !== "verified") continue;
    const qualifying = valid.filter((r) =>
      r.outcome?.passed === true && r.execution?.manualInterventions === 0 &&
      r.execution?.networkEnabled === false && positive(r.model?.totalParametersB) &&
      r.model.totalParametersB <= 14 && taskIds.has(r.task?.id) && r.task?.version === 1
    );
    const byConfig = new Map();
    for (const result of qualifying) {
      const key = configKey(result);
      if (!byConfig.has(key)) byConfig.set(key, new Set());
      byConfig.get(key).add(result.task.id);
    }
    const passedGate = [...byConfig.values()].some((tasks) =>
      tasks.has("t0") && tasks.has("t2") && (tasks.has("t1") || tasks.has("t3"))
    );
    if (!passedGate) errors.push(agent.id + ": verified requires matching unassisted T0, T2 and T1/T3 passing runs from one <=14B configuration");
    if (agent.smallestVerifiedModel?.id && !qualifying.some((r) => r.model.id === agent.smallestVerifiedModel.id)) {
      errors.push(agent.id + ": smallestVerifiedModel.id not found in qualifying results");
    }
    if (agent.smallestVerifiedModel?.name && !qualifying.some((r) => r.model.id === agent.smallestVerifiedModel.name)) {
      errors.push(agent.id + ": smallestVerifiedModel.name must match a qualifying model ID");
    }
  }
  return errors;
}

export function loadBenchmarkResults(dir = resultsDir) {
  const results = {};
  const errors = [];
  for (const name of fs.readdirSync(dir).filter((name) => name.endsWith(".json") && !name.endsWith(".template.json"))) {
    const relative = "benchmarks/results/" + name;
    try { results[relative] = JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")); }
    catch (error) { errors.push(relative + ": invalid JSON: " + error.message); }
  }
  return { results, errors };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dataset = JSON.parse(fs.readFileSync(path.join(root, "data/agents.json"), "utf8"));
  const loaded = loadBenchmarkResults();
  const errors = [...loaded.errors, ...validateBenchmarkResults(dataset, loaded.results)];
  if (errors.length) {
    for (const error of errors) console.error("benchmark validation error:", error);
    process.exitCode = 1;
  } else console.log("benchmark metadata and verification gates validated");
}
