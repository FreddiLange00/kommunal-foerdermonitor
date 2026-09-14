import {Repository,iso,json,uid} from './repository';
import type {RuntimeSecrets} from './research';
export const PROBE_QUOTE='This is a synthetic connectivity test, not a funding rule.';
export async function checkProviders(repo:Repository,secrets:RuntimeSecrets,reserve:(kind:'search'|'model')=>Promise<void>){
 if(secrets.PROVIDER_ACTIVATION!=='true')return null;
 const input=[secrets.OPENAI_API_KEY??'',secrets.OPENAI_MODEL??'',secrets.BRAVE_SEARCH_API_KEY??'',secrets.BRAVE_STORAGE_RIGHTS??'',secrets.PROVIDER_CHECK_REVISION??''].join('\0');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const key='provider-check:'+hash,prior=await repo.setting(key);
 if(prior)return prior;
 const at=iso(),claim=await repo.exec('INSERT OR IGNORE INTO settings(key,data) VALUES(?,?)',key,json({status:'läuft',startedAt:at,model:secrets.OPENAI_MODEL??null}));
 if(!claim.meta.changes)return await repo.setting(key);
 const report:any={status:'fehlgeschlagen',startedAt:at,model:secrets.OPENAI_MODEL??null,search:{ok:false},extraction:{ok:false},note:'Technischer Verbindungstest; keine fachliche Programmfreigabe.'};
 try{
  if(!secrets.BRAVE_SEARCH_API_KEY||secrets.BRAVE_STORAGE_RIGHTS!=='true')report.search.reason='Suchschlüssel oder bestätigte Speicherrechte fehlen.';
  else {await reserve('search');const query='site:foerderdatenbank.de Klimaschutz Förderung Kommunen';const u=new URL('https://api.search.brave.com/res/v1/web/search');u.searchParams.set('q',query);u.searchParams.set('count','1');u.searchParams.set('country','DE');const r=await fetch(u,{headers:{'X-Subscription-Token':secrets.BRAVE_SEARCH_API_KEY},redirect:'error',signal:AbortSignal.timeout(15000)});const d:any=await r.json().catch(()=>({}));report.search={ok:r.ok&&Array.isArray(d.web?.results)&&d.web.results.length>0,http:r.status,query,checkedAt:iso(),resultCount:Array.isArray(d.web?.results)?d.web.results.length:0};if(!report.search.ok)report.search.reason='Suchanbieter liefert keinen erfolgreichen Suchnachweis.';}
 }catch{report.search.reason='Suchanfrage fehlgeschlagen oder Ressourcenbudget erreicht.';}
 try{
  if(!secrets.OPENAI_API_KEY||!secrets.OPENAI_MODEL)report.extraction.reason='API-Schlüssel oder Modell-ID fehlt.';
  else{await reserve('model');const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),headers:{Authorization:`Bearer ${secrets.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:json({model:secrets.OPENAI_MODEL,store:false,max_completion_tokens:512,response_format:{type:'json_object'},messages:[{role:'system',content:'Return JSON with one key quote, containing the user text unchanged. This is a synthetic connectivity test. Do not infer funding conditions.'},{role:'user',content:PROBE_QUOTE}]})});const d:any=await r.json().catch(()=>({}));let quote=null;try{quote=JSON.parse(d.choices?.[0]?.message?.content??'').quote;}catch{}
   report.extraction={ok:r.ok&&quote===PROBE_QUOTE,http:r.status,checkedAt:iso(),quoteMatched:quote===PROBE_QUOTE};if(!report.extraction.ok){report.extraction.reason='Modellaufruf oder unveränderte JSON-Extraktion fehlgeschlagen.';const code=d.error?.code;if(['model_not_found','invalid_api_key','insufficient_quota','rate_limit_exceeded','unsupported_parameter'].includes(code))report.extraction.code=code;}
  }
 }catch{report.extraction.reason='Modellaufruf fehlgeschlagen oder Ressourcenbudget erreicht.';}
 report.status=report.search.ok&&report.extraction.ok?'erfolgreich':'fehlgeschlagen';report.finishedAt=iso();
 const currentConfig=await repo.config();
 // Fail closed: only this explicit operator activation may enable the existing daily scheduler.
 if(report.status==='erfolgreich'){await repo.exec('INSERT INTO settings(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data','config',json({...currentConfig,scheduleEnabled:true}));report.scheduleEnabled=true;}
 await repo.exec('UPDATE settings SET data=? WHERE key=?',json(report),key);
 await repo.exec('INSERT INTO settings(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data','provider-check-latest',json(report));
 await repo.event('Anbieter-Verbindungstest',null,report);return report;
}
