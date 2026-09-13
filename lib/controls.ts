import {claimSchema,FIELDS,type Claim,type Doc,type Scope,type Role} from './model';
export const normalize=(s:string)=>s.normalize('NFKC').replace(/\s+/g,' ').trim();
export function scopeMatches(a:Scope,b:Scope){return a.programId===b.programId&&a.moduleId===b.moduleId&&a.callId===b.callId&&a.variantId===b.variantId&&a.caseId===b.caseId;}
export function validateClaim(candidate:unknown,docs:Doc[]):string[]{
 const parsed=claimSchema.safeParse(candidate);if(!parsed.success)return parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`);
 const c=parsed.data,errors:string[]=[];
 if(c.value===null&&c.information==='Belegt')errors.push('Belegt benötigt einen tatsächlichen Wert.');
 if(c.value!==null&&!['Belegt','Nicht anwendbar'].includes(c.information))errors.push('Ungeklärte Felder müssen null bleiben; Alternativen gehören ins Konfliktregister.');
 if(c.value!==null&&!c.evidence.length)errors.push('Feldbezogener Beleg fehlt.');
 for(const e of c.evidence){const d=docs.find(x=>x.id===e.documentId&&x.versionId===e.versionId);
  if(!d){errors.push('Dokumentversion fehlt.');continue;}
  if(d.scope.programId!==c.scope.programId||d.scope.caseId!==c.scope.caseId||(['moduleId','callId','variantId'] as const).some(k=>d.scope[k]!==null&&d.scope[k]!==c.scope[k]))errors.push('Beleg gehört zu einem anderen Programm / Modul / Aufruf / Fall.');
  if(e.url!==d.url||e.title!==d.title||e.publisher!==d.publisher)errors.push('Herkunftsmetadaten stimmen nicht.');
  if(!normalize(d.text).includes(normalize(e.quote)))errors.push('Originalzitat kommt in dieser Dokumentversion nicht vor.');
  if(!normalize(d.text).includes(normalize(e.context))||!normalize(e.context).includes(normalize(e.quote)))errors.push('Belegkontext fehlt oder enthält das Zitat nicht.');
  if(e.pageIndex!==null&&!d.pageData.some(p=>p.pageIndex===e.pageIndex&&normalize(p.text).includes(normalize(e.quote))))errors.push('PDF-Seitenbezug stimmt nicht.');
  if(d.quality==='ambiguous'||d.quality==='ocr_pending')errors.push('PDF / OCR nicht zuverlässig: visuelle Prüfung und Korrektur erforderlich.');
  if(!d.current)errors.push('Dokumentversion wurde ersetzt.');
 }
 if(typeof c.value==='number'&&(!Number.isFinite(c.value)||!c.unit||!c.basis))errors.push('Zahl benötigt gültiges Format, Einheit und Bezugsgröße.');
 if(c.scope.validFrom&&c.scope.validTo&&c.scope.validFrom>c.scope.validTo)errors.push('Geltungszeitraum ist ungültig.');
 if(c.key==='deadline'&&c.value&&!c.conditions.some(x=>/Antrag|Skizze|Vollantrag|Umsetzung|Bewilligung/i.test(x)))errors.push('Fristtyp muss ausdrücklich belegt sein; Richtlinienlaufzeit genügt nicht.');
 errors.push(...checkLiteralSupport(c));
 return errors;
}
// Conservative checks can reject known semantic defects; they cannot establish general semantic entailment.
export function checkLiteralSupport(c:Claim){
 const out:string[]=[];if(c.value===null)return out;const text=normalize(String(c.value)),support=normalize(c.evidence.map(e=>e.quote).join(' ')),all=normalize(text+' '+c.conditions.join(' '));
 const numbers:string[]=text.match(/\d+(?:[.,]\d+)?/g)??[];const supportedNumbers:string[]=support.match(/\d+(?:[.,]\d+)?/g)??[];
 for(const n of numbers)if(!supportedNumbers.includes(n))out.push('Zahlenwert wird vom Originalauszug nicht getragen.');
 if(/bis zu|höchstens|maximal|maximum|up to/i.test(support)&&!(/bis zu|höchstens|maximal|maximum|up to|Obergrenze/i.test(all)))out.push('Belegte Obergrenze darf nicht als fester Förderwert erscheinen.');
 if(/je Antrag|pro Antrag/i.test(support)&&/je Gebäude|pro Gebäude/i.test(text)&&!/je Gebäude|pro Gebäude/i.test(support))out.push('Bezugsgröße je Antrag wurde unzulässig auf Gebäude übertragen.');
 if(/unter\s+\d/i.test(support)&&/bis einschließlich/i.test(text))out.push('Strenger Schwellenwert darf die Grenze nicht einschließen.');
 if(/kommunale[nr]? Gesellschaft|kommunale[srn]? Unternehmen/i.test(text)&&!/Gesellschaft|Unternehmen|rechtlich selbstständig/i.test(support))out.push('Berechtigung einer kommunalen Gesellschaft ist nicht durch kommunale Berechtigung belegt.');
 const conditional=support.match(/(?:wenn|sofern|vorausgesetzt)\s+[^.!?]+/i)?.[0];if(conditional&&!normalize(all).includes(normalize(conditional)))out.push('Eine im Original genannte Bedingung fehlt in der Aussage.');
 return out;
}
export function currentStatus(c:Claim,docs:Doc[],now=new Date(),hours=24):string{
 if(c.freshness==='veraltet')return 'veraltet';
 if(c.evidence.some(e=>!docs.find(d=>d.versionId===e.versionId)?.current))return 'erneut zu prüfen';
 if(!c.checkedAt||c.freshness!=='aktuell geprüft')return 'erneut zu prüfen';
 if(c.evidence.some(e=>{const d=docs.find(d=>d.versionId===e.versionId);return !d||!!d.sourceError||!d.lastSuccess||(d.lastAttempt!==null&&d.lastAttempt>d.lastSuccess);}))return 'erneut zu prüfen';
 if(now.getTime()-Date.parse(c.checkedAt)>(FIELDS[c.key]?.volatile?hours:720)*3600000)return 'erneut zu prüfen';
 return 'aktuell geprüft';
}
export function publishable(c:Claim,docs:Doc[],now=new Date(),hours=24){return c.information==='Belegt'&&c.value!==null&&c.approval==='fachlich freigegeben'&&currentStatus(c,docs,now,hours)==='aktuell geprüft'&&validateClaim(c,docs).length===0;}
export function reviewErrors(c:Claim,docs:Doc[],attest:{context:boolean;scope:boolean;exceptions:boolean;visual:boolean},reason:string){
 const errors=validateClaim(c,docs);
 if(!attest.context||!attest.scope||!attest.exceptions)errors.push('Tragfähigkeit, Geltungsbereich und Ausnahmen müssen fachlich bestätigt werden.');
 if(reason.trim().length<12)errors.push('Eine nachvollziehbare Prüfbegründung ist erforderlich.');
 if(c.evidence.some(e=>{const d=docs.find(x=>x.versionId===e.versionId);return d&&(d.quality==='partial'||d.pageData.length>0);})&&!attest.visual)errors.push('Vollständiger Kontext muss am Original geprüft werden.');
 if(!['Belegt','Nicht anwendbar'].includes(c.information)||!c.evidence.length)errors.push('Ungeklärte Aussagen können nicht freigegeben werden.');
 return errors;
}
export function can(role:Role,action:string){return role==='admin'||({reader:['read','chat','project'],researcher:['read','chat','project','research','edit'],reviewer:['read','chat','project','review']}[role]??[]).includes(action);}
export function projectAccess(owner:string,user:string){return owner===user;}
export function safeTarget(raw:string,hosts:string[]){const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||(u.port&&u.port!=='443')||!hosts.includes(u.hostname.toLowerCase())||/^(localhost|.*\.local|.*\.internal|\[|\d)/.test(u.hostname))throw Error('Abrufziel ist nicht freigegeben.');return u.href;}
export function threshold(amount:number,limit:number,operator:'lt'|'lte'|'gt'|'gte'){if(!Number.isFinite(amount)||!Number.isFinite(limit))throw Error('Ungültiger Betrag');return {lt:amount<limit,lte:amount<=limit,gt:amount>limit,gte:amount>=limit}[operator];}
export function calculateGrant(costCents:number,rateBasisPoints:number,maxCents:number|null,basis:string){
 if(!Number.isSafeInteger(costCents)||costCents<0||!Number.isSafeInteger(rateBasisPoints)||rateBasisPoints<0||rateBasisPoints>10000||!basis)throw Error('Ungültige Berechnungsgrundlage');
 const a=(BigInt(costCents)*BigInt(rateBasisPoints)+5000n)/10000n;if(maxCents!==null&&(!Number.isSafeInteger(maxCents)||maxCents<0))throw Error('Ungültige Obergrenze');
 const result=maxCents===null?a:(a>BigInt(maxCents)?BigInt(maxCents):a);if(result>BigInt(Number.MAX_SAFE_INTEGER))throw Error('Berechnung zu groß');
 return {resultCents:Number(result),inputs:{costCents,rateBasisPoints,maxCents,basis},formula:'min(förderfähige Kosten × Fördersatz, belegte Obergrenze falls vorhanden)',unit:'EUR',rounding:'kaufmännisch auf Cent',kind:'Berechnung; keine Bewilligungszusage'};
}
export function detectConflicts(claims:Claim[]){const result:Claim[][]=[];for(let i=0;i<claims.length;i++)for(let j=i+1;j<claims.length;j++){const a=claims[i],b=claims[j];if(a.key===b.key&&a.value!==null&&b.value!==null&&a.value!==b.value&&scopeMatches(a.scope,b.scope)&&a.scope.applicant===b.scope.applicant&&a.scope.region===b.scope.region&&a.scope.validFrom===b.scope.validFrom&&a.scope.validTo===b.scope.validTo&&!a.supersedes&&!b.supersedes)result.push([a,b]);}return result;}
export function berlinParts(now:Date){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);const m=Object.fromEntries(p.map(x=>[x.type,x.value]));return {day:`${m.year}-${m.month}-${m.day}`,hour:Number(m.hour),minute:Number(m.minute)};}
export function scheduleDue(now:Date,lastDay:string|null,hour=7,minute=0){const p=berlinParts(now);return p.day!==lastDay&&(p.hour>hour||p.hour===hour&&p.minute>=minute);}

/** Only an explicitly recorded ISO deadline is machine-filterable. Scope validity is never a deadline. */
export function deadlineDate(c:Claim):string|null { return c.key==='deadline' && typeof c.value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(c.value) && !Number.isNaN(Date.parse(c.value)) ? c.value : null; }
