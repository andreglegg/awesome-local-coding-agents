import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const agents=JSON.parse(fs.readFileSync(path.join(root,"data/agents.json"),"utf8")).agents;
const result={checkedAt:new Date().toISOString(),checked:0,broken:[],inconclusive:[]};
const token=process.env.GITHUB_TOKEN||"";
const auth=token?{Authorization:"Bearer "+token}:{};
const headers={Accept:"application/vnd.github+json","User-Agent":"awesome-local-coding-agents-freshness",...auth};
const jobs=[];
for(const agent of agents){
 if(agent.status!=="active")continue;
 const parsed=new URL(agent.repository);
 const parts=parsed.pathname.split("/").filter(Boolean);
 jobs.push({agent:agent.name,type:"upstream",url:"https://api.github.com/repos/"+parts[0]+"/"+parts[1]});
 for(const evidence of agent.evidence)jobs.push({agent:agent.name,type:"evidence",url:evidence.url});
}
async function inspect(job){
 try{
  let response=await fetch(job.url,{method:job.type==="evidence"?"HEAD":"GET",headers,signal:AbortSignal.timeout(10000)});
  if(job.type==="evidence"&&[405,501].includes(response.status))response=await fetch(job.url,{method:"GET",headers,signal:AbortSignal.timeout(10000)});
  result.checked++;
  if(response.status===404||response.status===410){
   result.broken.push({...job,reason:"HTTP "+response.status});return;
  }
  if(!response.ok){
   result.inconclusive.push({...job,reason:"HTTP "+response.status});return;
  }
  if(job.type==="upstream"){
   const details=await response.json();
   if(details.archived||details.disabled)result.broken.push({...job,reason:details.archived?"Archived":"Disabled"});
  }
 }catch(error){result.inconclusive.push({...job,reason:"Request could not be completed: "+(error?.name||"error")});}
}
let cursor=0;
await Promise.all(Array.from({length:Math.min(4,jobs.length)},async()=>{
 while(cursor<jobs.length){const j=jobs[cursor++];await inspect(j);}
}));
const outfile=path.join(root,"freshness-report.json");
fs.writeFileSync(outfile,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({checked:result.checked,broken:result.broken.length,inconclusive:result.inconclusive.length}));
for(const problem of result.broken)console.error("FRESHNESS:",problem.agent,problem.type,problem.reason,problem.url);
// Exit zero so the publishing step can create one reviewable issue; never delete entries automatically.
