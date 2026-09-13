import {readFile} from 'node:fs/promises';
try{const h=JSON.parse(await readFile((process.env.RUNNER_STATE_DIR??'/state')+'/health.json','utf8'));if(!h.ok||Date.now()-Date.parse(h.at)>150000)process.exit(1);}catch{process.exit(1);}
