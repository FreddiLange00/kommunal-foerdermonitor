/** External process. No browser is required. Queue, leases, retries and daily deduplication live in D1. */
import {mkdir,writeFile,rename} from 'node:fs/promises';
const base=process.env.MONITOR_ORIGIN,token=process.env.RUNNER_TOKEN,gate=process.env.SITES_GATE_TOKEN;
if(!base||!token||!gate){console.error('Set MONITOR_ORIGIN, RUNNER_TOKEN and the separately authorized SITES_GATE_TOKEN. The private Sites gateway must permit machine requests.');process.exit(1);}
const origin=new URL(base);if(origin.protocol!=='https:'||origin.pathname!=='/'||origin.username||origin.password)throw Error('MONITOR_ORIGIN must be an HTTPS origin.');
let stop=false;process.on('SIGTERM',()=>stop=true);process.on('SIGINT',()=>stop=true);
const dir=process.env.RUNNER_STATE_DIR??'/state';await mkdir(dir,{recursive:true});
while(!stop){const at=new Date().toISOString();try{
 const r=await fetch(new URL('/api/monitor',origin),{method:'POST',redirect:'error',signal:AbortSignal.timeout(90000),headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`,'OAI-Sites-Authorization':`Bearer ${gate}`},body:JSON.stringify({action:'tick'})});
 if(!r.ok)throw Error(`Monitor returned HTTP ${r.status}; inspect access policy and runtime logs.`);const result=await r.json();
 await writeFile(dir+'/health.tmp',JSON.stringify({at,ok:true,idle:!!result.idle,runId:result.runId??null,status:result.status??null}));await rename(dir+'/health.tmp',dir+'/health.json');console.log(JSON.stringify({at,ok:true,idle:!!result.idle,status:result.status??null}));
 }catch(e){console.error(JSON.stringify({at,ok:false,error:e.message}));await writeFile(dir+'/health.json',JSON.stringify({at,ok:false}));}
 await new Promise(resolve=>setTimeout(resolve,10000));
}
