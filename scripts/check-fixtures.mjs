import fs from "node:fs";import os from "node:os";import path from "node:path";import {spawnSync} from "node:child_process";import {fileURLToPath} from "node:url";
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),".."),temporary=fs.mkdtempSync(path.join(os.tmpdir(),"local-agent-fixtures-"));
const run=(id,w)=>spawnSync(process.execPath,[path.join(repo,"benchmarks/evaluators/evaluate.mjs"),id,w],{encoding:"utf8",timeout:30000});
const patch=(file,needle,change)=>{const c=fs.readFileSync(file,"utf8");if(!c.includes(needle))throw Error("bad fixture "+needle);fs.writeFileSync(file,c.replace(needle,change));};
try{for(const id of ["t0-v1","t1-v1","t2-v1","t3-v1"]){const w=path.join(temporary,id);fs.cpSync(path.join(repo,"benchmarks/fixtures",id,"project"),w,{recursive:true});
const failed=run(id,w);if(failed.status!==1)throw Error(id+" seed should fail; "+failed.stdout+failed.stderr);
if(id==="t0-v1")patch(path.join(w,"src/greeting.mjs"),'"Hello, " + name;', '"Hello, " + name + "!";');
if(id==="t1-v1")fs.writeFileSync(path.join(w,"architecture.json"),JSON.stringify({entryPoint:"src/index.mjs",requestModule:"src/request.mjs",cacheModule:"src/cache.mjs",dataModule:"src/database.mjs",cacheKeyPrefix:"user:",databaseFunction:"loadUser"}));
if(id==="t2-v1")patch(path.join(w,"src/shipping.mjs"),"subtotal > 50","subtotal >= 50");
if(id==="t3-v1"){patch(path.join(w,"src/discount.mjs"),"=>0;",'=>coupon==="WELCOME10"?Math.round(subtotal*10)/100:0;');patch(path.join(w,"src/checkout.mjs"),"total:subtotal","total:Math.round((subtotal-saved)*100)/100");}
const passed=run(id,w);if(passed.status!==0)throw Error(id+" expected success: "+passed.stdout+passed.stderr);console.log(id+" baseline fails, reference solution passes");}
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
