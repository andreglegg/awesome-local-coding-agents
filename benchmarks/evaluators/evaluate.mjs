import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";
const [task,dir]=process.argv.slice(2);
if(!["t0-v1","t1-v1","t2-v1","t3-v1"].includes(task)||!dir||!fs.existsSync(dir)){console.error("Usage: node benchmarks/evaluators/evaluate.mjs TASK WORKSPACE");process.exit(2);}
const root=path.resolve(dir);
const load=async file=>import(pathToFileURL(path.join(root,file)).href+"?t="+Date.now());
try{
if(task!=="t1-v1"){const t=spawnSync(process.execPath,["--test"],{cwd:root,encoding:"utf8",timeout:30000});assert.equal(t.status,0,(t.stdout||"").slice(-1100)+(t.stderr||""));}
if(task==="t0-v1"){const {greeting}=await load("src/greeting.mjs");for(const n of ["Ada","Lin"])assert.equal(greeting(n),"Hello, "+n+"!");}
if(task==="t1-v1"){const a=JSON.parse(fs.readFileSync(path.join(root,"architecture.json"),"utf8"));const e={entryPoint:"src/index.mjs",requestModule:"src/request.mjs",cacheModule:"src/cache.mjs",dataModule:"src/database.mjs",cacheKeyPrefix:"user:",databaseFunction:"loadUser"};for(const [k,v] of Object.entries(e))assert.equal(a[k],v,k);for(const name of ["index","request","cache","database"]){const source=fs.readFileSync(new URL("../fixtures/t1-v1/project/src/"+name+".mjs",import.meta.url),"utf8");assert.equal(fs.readFileSync(path.join(root,"src/"+name+".mjs"),"utf8"),source);}}
if(task==="t2-v1"){const {shippingFee}=await load("src/shipping.mjs");for(const [a,v] of [[0,5],[49.99,5],[50,0],[100,0]])assert.equal(shippingFee(a),v);assert.throws(()=>shippingFee(-1),RangeError);}
if(task==="t3-v1"){const {discount}=await load("src/discount.mjs");const {checkout}=await load("src/checkout.mjs");assert.equal(discount(80,"WELCOME10"),8);assert.equal(discount(80,"OTHER"),0);assert.deepEqual(checkout([{price:15,quantity:2}],"WELCOME10"),{subtotal:30,discount:3,total:27});for(const name of ["discount","checkout"]){const source=fs.readFileSync(new URL("../fixtures/t3-v1/project/src/"+name+".mjs",import.meta.url),"utf8");assert.notEqual(fs.readFileSync(path.join(root,"src/"+name+".mjs"),"utf8"),source);}}
console.log("PASS "+task);
}catch(e){console.error("FAIL "+task+": "+e.message);process.exitCode=1;}
