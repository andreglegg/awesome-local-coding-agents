import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const agents = new Map([["forge","0.2.2"],["codex-cli","0.171.0"],["opencode","2.4.1"]]);
const tasks = new Map([
  ["t0-v1","T0-tool-use.md"],
  ["t1-v1","T1-repository-understanding.md"],
  ["t2-v1","T2-bug-fix.md"],
  ["t3-v1","T3-multi-file-change.md"]
]);
const [agent="forge", task="t0-v1", attemptRaw="1"] = process.argv.slice(2);
assert(agents.has(agent), "Choose forge, codex-cli, or opencode");
assert(tasks.has(task), "Choose t0-v1, t1-v1, t2-v1, or t3-v1");
const attempt = Number(attemptRaw);
assert(Number.isInteger(attempt) && attempt >= 1 && attempt <= 3, "Attempt must be 1, 2, or 3");
const definition = fs.readFileSync(path.join(repo, "benchmarks/tasks", tasks.get(task)), "utf8");
const prompt = definition.match(/\*\*Exact agent prompt:\*\*\s*\n+>\s*(.+)/)?.[1]?.trim();
assert(prompt, "Task prompt is missing or has changed; do not silently substitute a different prompt");

const reportDirectory = path.join(repo, "benchmark-artifacts");
fs.mkdirSync(reportDirectory, {recursive:true});
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "local-agent-pilot-"));
const work = path.join(scratch, "workspace");
const fixture = path.join(repo, "benchmarks/fixtures", task, "project");
fs.cpSync(fixture, work, {recursive:true});
const gitInit = spawnSync("git", ["init", "--quiet", work], {encoding:"utf8"});
assert.equal(gitInit.status, 0, "git init failed");
const startedAt = new Date().toISOString();
const begun = Date.now();
const dockerArgs = [
  "run", "--rm", "--network=none", "--cap-drop=ALL",
  "--security-opt=no-new-privileges", "--user="+process.getuid()+":"+process.getgid(),
  "--memory=12g", "--cpus=3", "--pids-limit=256",
  "--tmpfs=/tmp:rw,size=3g,mode=1777",
  "-v", work+":/work:rw", "-w", "/work",
  "-e", "BENCH_AGENT="+agent, "-e", "BENCH_PROMPT="+prompt,
  "local-agent-benchmark:cpu"
];
const agentRun = spawnSync("docker", dockerArgs, {
  encoding:"utf8", timeout:850_000, maxBuffer:8_000_000
});
const elapsedSeconds = Math.round((Date.now()-begun)/1000);
const evaluated = spawnSync(process.execPath, [
  path.join(repo, "benchmarks/evaluators/evaluate.mjs"), task, work
], { encoding:"utf8", timeout:35_000, maxBuffer:1_000_000 });
const stamp = startedAt.slice(0,10).replaceAll("-","");
const name = agent+"--qwen2.5-coder-1.5b--"+task+"--"+stamp+"-"+attempt;
const agentText = (agentRun.stdout||"") + "\n[stderr]\n" + (agentRun.stderr||"");
const verifierText = (evaluated.stdout||"") + (evaluated.stderr||"");
fs.writeFileSync(path.join(reportDirectory,name+".agent.log"),agentText);
fs.writeFileSync(path.join(reportDirectory,name+".verifier.log"),verifierText);
const passed = evaluated.status === 0 && agentRun.status === 0;
const metadataLine = agentText.match(/BENCH_MODEL_META=(\{[^\n]+\})/);
let selectedModel = {};
try { if (metadataLine) selectedModel = JSON.parse(metadataLine[1]); } catch {}
const result = {
 schemaVersion:1, task:{id:task.slice(0,2),version:1},
 agent:{id:agent,version:agents.get(agent)},
 model:{id:"qwen2.5-coder:1.5b",family:"Qwen2.5-Coder",totalParametersB:1.5,activeParametersB:null,quantization:selectedModel.quantization || "unknown; see model metadata log"},
 runtime:{backend:"Ollama (offline Docker network)",version:"0.40.17",contextTokens:8192},
 hardware:{os:process.platform+" "+os.release(),cpu:os.cpus()[0]?.model||"GitHub hosted CPU",gpu:"none",systemRamGB:Math.round(os.totalmem()/1073741824),acceleratorMemoryGB:0,memoryType:"VRAM"},
 execution:{command:agent+" (see benchmarks/remote/agent-entrypoint.sh)",startedAt,elapsedSeconds,manualInterventions:0,networkEnabled:false},
 outcome:{passed,toolCallFailures:0,agentTurns:null,inputTokens:null,outputTokens:null,verifier:verifierText.trim().slice(0,2500)||"Evaluator did not complete"},
 notes:"Pilot: agent exit="+String(agentRun.status)+"; agent error="+(agentRun.error?.code||"none")+
       "; evaluator exit="+String(evaluated.status)+
       "; resolved model digest="+(selectedModel.digest || "unknown")+
       "; model parameter declaration="+(selectedModel.parameterSize || "unknown")+
       "; tool-call-failure count unavailable (0 is placeholder for schema compatibility)."
};
fs.writeFileSync(path.join(reportDirectory,name+".json"),JSON.stringify(result,null,2)+"\n");
const summary={name,passed,agentExitCode:agentRun.status,evaluatorExitCode:evaluated.status,elapsedSeconds,
  agentError:agentRun.error?.message,verifier:verifierText.slice(0,1000)};
console.log(JSON.stringify(summary,null,2));
if (!passed) {
  console.log("::warning title=Benchmark task did not pass::" + name + " failed its external verifier; artifact uploaded for analysis");
}
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "| Agent | Task | Attempt | Outcome | Duration |\n|---|---|---:|---|---:|\n| " +
    agent + " | " + task + " | " + attempt + " | **" + (passed ? "PASS" : "FAIL") +
    "** | " + elapsedSeconds + "s |\n");
}
fs.rmSync(scratch,{recursive:true,force:true});
// The workflow should still publish failed attempts as artifacts.
// Only setup or metadata errors fail the workflow.
