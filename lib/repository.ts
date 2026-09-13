import {defaultConfig,FIELDS,unknownClaim,type User,type Claim,type Doc,type Program,type Question} from './model';
import {seedPrograms,seedSources,seedRecords,seedDate} from './seed';
import {can,publishable,currentStatus,reviewErrors,validateClaim,detectConflicts,projectAccess} from './controls';
export const uid=()=>crypto.randomUUID();
export const iso=()=>new Date().toISOString();
export class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
export const json=(v:unknown)=>JSON.stringify(v);
export class Repository{
 constructor(public db:D1Database,public bucket:R2Bucket){}
 async rows(sql:string,...args:any[]){return (await this.db.prepare(sql).bind(...args).all<any>()).results??[];}
 async one(sql:string,...args:any[]){return this.db.prepare(sql).bind(...args).first<any>();}
 async exec(sql:string,...args:any[]){return this.db.prepare(sql).bind(...args).run();}
 async setting(key:string,fallback:any=null){const r=await this.one('SELECT data FROM settings WHERE key=?',key);return r?JSON.parse(r.data):fallback;}
 async config(){return {...defaultConfig,...await this.setting('config',{})};}
 async identify(identity:{id:string;email:string;name:string}):Promise<User>{
  const found=await this.one('SELECT * FROM members WHERE id=? OR email=?',identity.id,identity.email.toLowerCase());
  if(found){if(found.id.startsWith('pending:'))await this.exec('UPDATE members SET id=?,name=? WHERE id=?',identity.id,identity.name,found.id);return {...identity,role:found.role};}
  // First bootstrap is only safe behind the owner-private Sites access policy.
  await this.exec('INSERT OR IGNORE INTO members (id,email,name,role,created_at) SELECT ?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM members)',identity.id,identity.email.toLowerCase(),identity.name,'admin',iso());
  const user=await this.one('SELECT * FROM members WHERE id=?',identity.id);if(!user)throw new HttpError(403,'Für dieses Team besteht keine Berechtigung.');return {...identity,role:user.role};
 }
 require(u:User,action:string){if(!can(u.role,action))throw new HttpError(403,'Diese Aktion ist mit Ihrer Rolle nicht erlaubt.');}
 async seed(){
  if(await this.setting('seed-v1'))return;
  const {docs,claims}=await seedRecords();const statements:D1PreparedStatement[]=[];
  for(const p of seedPrograms)statements.push(this.db.prepare('INSERT OR IGNORE INTO programs(id,data,revision) VALUES(?,?,1)').bind(p.id,json(p)));
  for(const s of seedSources)statements.push(this.db.prepare('INSERT OR IGNORE INTO sources(id,program_id,url,data,last_fetch) VALUES(?,?,?,?,?)').bind(s.id,s.programId,s.url,json({...s,scope:null,enabled:true,verificationNote:'Offizielle Webpräsenz während der Einrichtung identifiziert; keine vollumfängliche inhaltliche Prüfung.',discoveredAt:seedDate}),null));
  for(const d of docs)statements.push(this.db.prepare('INSERT OR IGNORE INTO versions(id,document_id,source_id,program_id,hash,current,data) VALUES(?,?,?,?,?,1,?)').bind(d.versionId,d.id,d.sourceId,d.programId,d.hash,json(d)));
  for(const c of claims){statements.push(this.db.prepare('INSERT OR IGNORE INTO claims(id,program_id,field,data) VALUES(?,?,?,?)').bind(c.id,c.scope.programId,c.key,json(c)));for(const e of c.evidence)statements.push(this.db.prepare('INSERT OR IGNORE INTO evidence(id,claim_id,version_id,data) VALUES(?,?,?,?)').bind(e.id,c.id,e.versionId,json(e)));}
  for(const p of seedPrograms){const q:Question={id:`initial-${p.id}`,programId:p.id,claimIds:claims.filter(c=>c.scope.programId===p.id).map(c=>c.id),question:'Welche Bedingungen gelten im konkreten Modul / Aufruf und ist die Antragstellung aktuell möglich?',reason:'Bisher sind nur gekürzte Originalauszüge im Arbeitsbestand. Vollständige Dokumente und aktuelle Mitteilungen sind noch nicht vollständig ausgewertet.',impact:'Keine aktuelle Fallzusage, keine bestätigte Frist und keine vollständige Förderhöhe.',documents:docs.filter(d=>d.programId===p.id).map(d=>d.versionId),nextStep:'Verknüpfte Originalunterlagen abrufen, Geltungsbereich zuordnen und jede kritische Aussage fachlich prüfen.',kind:'Nachrecherche',status:'offen',createdAt:iso()};statements.push(this.db.prepare('INSERT OR IGNORE INTO questions(id,program_id,data) VALUES(?,?,?)').bind(q.id,p.id,json(q)));}
  statements.push(this.db.prepare('INSERT OR IGNORE INTO settings(key,data) VALUES(?,?)').bind('seed-v1',json({at:iso(),humanReviewed:false})));await this.db.batch(statements);
 }
 async event(kind:string,programId:string|null,data:any){await this.exec('INSERT INTO events(id,program_id,kind,at,data) VALUES(?,?,?,?,?)',uid(),programId,kind,iso(),json(data));}
 async data(programId?:string){
  const [pr,cr,dr,qr]=await Promise.all([this.rows('SELECT * FROM programs'),this.rows('SELECT data FROM claims WHERE active=1'+(programId?' AND program_id=?':''),...(programId?[programId]:[])),this.rows('SELECT v.data,v.current,s.last_attempt,s.last_check,s.error FROM versions v JOIN sources s ON s.id=v.source_id'+(programId?' WHERE v.program_id=?':''),...(programId?[programId]:[])),this.rows('SELECT data FROM questions'+(programId?' WHERE program_id=?':''),...(programId?[programId]:[]))]);
  return {programs:pr.map(x=>({...JSON.parse(x.data),revision:x.revision})) as Program[],claims:cr.map(x=>JSON.parse(x.data)) as Claim[],docs:dr.map(x=>({...JSON.parse(x.data),current:!!x.current,lastAttempt:x.last_attempt??JSON.parse(x.data).lastAttempt,sourceError:x.error,lastSuccess:x.last_check??JSON.parse(x.data).lastSuccess})) as Doc[],questions:qr.map(x=>JSON.parse(x.data)) as Question[]};
 }
 async snapshot(u:User){
  const d=await this.data();const [sources,runs,events,members,projects,config,candidates,searches,heartbeat]=await Promise.all([this.rows('SELECT * FROM sources'),this.rows('SELECT * FROM runs ORDER BY started_at DESC LIMIT 30'),this.rows('SELECT * FROM events ORDER BY at DESC LIMIT 120'),u.role==='admin'?this.rows('SELECT id,email,name,role FROM members'):[],this.rows('SELECT * FROM projects WHERE owner_id=?',u.id),this.config(),this.rows('SELECT * FROM candidates ORDER BY rowid DESC LIMIT 100'),this.rows('SELECT * FROM searches ORDER BY rowid DESC LIMIT 300'),this.setting('runner-heartbeat')]);
  const allowed=u.role==='reader'?d.claims.filter(c=>publishable(c,d.docs)):d.claims;
  return {...d,claims:allowed.map(c=>({...c,freshness:currentStatus(c,d.docs),validationErrors:validateClaim(c,d.docs)})),docs:d.docs.map(({text,...v})=>({...v,text:text.slice(0,100000),displayTruncated:text.length>100000})),user:u,config,sources:sources.map(s=>({...JSON.parse(s.data),id:s.id,lastAttempt:s.last_attempt,lastFetch:s.last_fetch,lastCheck:s.last_check,error:s.error})),runs:runs.map(x=>({...x,data:JSON.parse(x.data)})),events:events.filter(e=>u.role!=='reader'||['neu freigegeben','bestätigte Änderung','Rechercheausfall'].includes(e.kind)).map(x=>{const event=JSON.parse(x.data);if(event.after&&!d.claims.some(c=>c.id===event.after.id&&publishable(c,d.docs))){event.after=null;event.note='Historisches Prüfereignis; die Aussage ist aktuell erneut zu prüfen und wird hier nicht wiedergegeben.';}return {...x,data:event};}),members,projects:projects.map(x=>({...x,data:JSON.parse(x.data)})),candidates:candidates.map(x=>({...x,data:JSON.parse(x.data)})),searches:searches.map(x=>({...x,data:JSON.parse(x.data)})),heartbeat};
 }
 async propose(c:Claim,u:User){
  this.require(u,'edit');const {docs,claims}=await this.data(c.scope.programId);c.id=uid();c.approval='Entwurf';c.freshness='erneut zu prüfen';c.checkedAt=null;
  const errors=validateClaim(c,docs);if(errors.length)throw new HttpError(422,errors.join(' '));
  if(c.supersedes&&!claims.some(x=>x.id===c.supersedes&&x.key===c.key&&x.scope.programId===c.scope.programId))throw new HttpError(422,'Zu ersetzende Aussage gehört nicht zu diesem Feld.');
  c.approval='automatisch geprüft';c.evidence=c.evidence.map(e=>({...e,id:uid()}));const stm=[this.db.prepare('INSERT INTO claims(id,program_id,field,data) VALUES(?,?,?,?)').bind(c.id,c.scope.programId,c.key,json(c)),...c.evidence.map(e=>{return this.db.prepare('INSERT INTO evidence(id,claim_id,version_id,data) VALUES(?,?,?,?)').bind(e.id,c.id,e.versionId,json(e));})];
  // Superseded claims cease publication immediately; history stays intact.
  if(c.supersedes)stm.push(this.db.prepare('UPDATE claims SET active=0 WHERE id=?').bind(c.supersedes));
  stm.push(this.db.prepare('UPDATE programs SET revision=revision+1 WHERE id=?').bind(c.scope.programId));await this.db.batch(stm);
  const conflicts=detectConflicts([...claims.filter(x=>x.id!==c.supersedes),c]);
  for(const pair of conflicts){for(const v of pair){const blocked={...v,value:null,information:'Widersprüchlich',freshness:'erneut zu prüfen',approval:'Entwurf',reason:'Widersprüchliche Aussagen: '+pair.map(p=>String(p.value)).join(' / ')};await this.exec('UPDATE claims SET data=? WHERE id=?',json(blocked),v.id);}await this.addQuestion(c.scope.programId,{question:`Widerspruch bei ${FIELDS[c.key].label}: ${pair.map(p=>String(p.value)).join(' / ')}`,reason:'Mehrere nicht aufgelöste Originalaussagen im gleichen Geltungsbereich.',claimIds:pair.map(p=>p.id),documents:pair.flatMap(p=>p.evidence.map(e=>e.versionId)),kind:'Fachprüfung',nextStep:'Beide Quellen und deren Regelungsfunktion vergleichen; Auflösung begründen.'});}
  await this.event('neuer Prüffall',c.scope.programId,{claimId:c.id,actor:u.id});return c;
 }
 async addQuestion(programId:string,body:any){const q={id:uid(),programId,claimIds:[],documents:[],impact:'Betroffene Auskunft bleibt offen.',status:'offen',createdAt:iso(),...body};await this.exec('INSERT INTO questions(id,program_id,data) VALUES(?,?,?)',q.id,programId,json(q));return q;}
 async review(claimId:string,u:User,action:string,reason:string,attest:any){
  this.require(u,'review');const r=await this.one('SELECT * FROM claims WHERE id=? AND active=1',claimId);if(!r)throw new HttpError(404,'Aussage nicht gefunden.');const c:Claim=JSON.parse(r.data);const {docs}=await this.data(c.scope.programId);
  if(action==='approve'){const errors=reviewErrors(c,docs,attest??{},reason);if(errors.length)throw new HttpError(422,errors.join(' '));}
  else if(action!=='return'||reason.trim().length<12)throw new HttpError(422,'Rückgabe benötigt einen nachvollziehbaren Grund.');
  const at=iso();const old={...c};c.approval=action==='approve'?'fachlich freigegeben':'Entwurf';c.freshness=action==='approve'?'aktuell geprüft':'erneut zu prüfen';c.checkedAt=action==='approve'?at:c.checkedAt;c.reason=reason;
  const reviewId=uid();
  const guards=c.evidence.map(()=>"EXISTS(SELECT 1 FROM versions WHERE id=? AND current=1 AND json_extract(data,'$.text')=?)").join(' AND ');
  const guardArgs=c.evidence.flatMap(e=>[e.versionId,docs.find(d=>d.versionId===e.versionId)!.text]);
  const stm=[this.db.prepare(`INSERT INTO reviews(id,claim_id,actor,at,action,reason,data) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM claims WHERE id=? AND active=1 AND data=?)${guards?' AND '+guards:''}`).bind(reviewId,c.id,u.id,at,action,reason,json({before:old,after:c,attest}),c.id,r.data,...guardArgs),this.db.prepare('UPDATE claims SET data=? WHERE id=? AND EXISTS(SELECT 1 FROM reviews WHERE id=?)').bind(json(c),c.id,reviewId),this.db.prepare('UPDATE programs SET revision=revision+1 WHERE id=? AND EXISTS(SELECT 1 FROM reviews WHERE id=?)').bind(c.scope.programId,reviewId)];
  if(action==='approve')for(const e of c.evidence){const d=docs.find(d=>d.versionId===e.versionId)!;d.reviewedAt=at;d.lastSuccess=at;stm.push(this.db.prepare('UPDATE versions SET data=? WHERE id=? AND current=1 AND EXISTS(SELECT 1 FROM reviews WHERE id=?)').bind(json(d),d.versionId,reviewId));stm.push(this.db.prepare('UPDATE sources SET last_check=?,error=NULL WHERE id=? AND EXISTS(SELECT 1 FROM reviews WHERE id=?)').bind(at,d.sourceId,reviewId));}
  const result=await this.db.batch(stm);if(!result[0].meta.changes)throw new HttpError(409,'Aussage oder Quelle wurde während der Prüfung geändert. Bitte neu laden.');if(action==='return')await this.addQuestion(c.scope.programId,{question:`Nachprüfung: ${FIELDS[c.key].label}`,reason,claimIds:[c.id],documents:c.evidence.map(e=>e.versionId),kind:'Nachrecherche',nextStep:'Begründung prüfen und korrigierte Aussage als neue Revision einreichen.'});
  await this.event(action==='approve'?(c.supersedes?'bestätigte Änderung':'neu freigegeben'):'neuer Prüffall',c.scope.programId,{claimId:c.id,actor:u.name,reason,before:old,after:c});return c;
 }
 async project(id:string,u:User){const p=await this.one('SELECT * FROM projects WHERE id=? AND owner_id=?',id,u.id);if(!p||!projectAccess(p.owner_id,u.id))throw new HttpError(404,'Projekt nicht gefunden.');return {...p,data:JSON.parse(p.data)};}
 async history(programId:string){const [claims,reviews,events]=await Promise.all([this.rows('SELECT data,active FROM claims WHERE program_id=?',programId),this.rows('SELECT r.* FROM reviews r JOIN claims c ON c.id=r.claim_id WHERE c.program_id=? ORDER BY at DESC',programId),this.rows('SELECT * FROM events WHERE program_id=? ORDER BY at DESC',programId)]);return {claims:claims.map(c=>({...JSON.parse(c.data),active:!!c.active})),reviews:reviews.map(x=>({...x,data:JSON.parse(x.data)})),events:events.map(x=>({...x,data:JSON.parse(x.data)}))};}
 async correctExtraction(versionId:string,u:User,input:{text:string;pages:any[];publishedAt:string|null;validFrom:string|null;validTo:string|null;versionLabel:string|null;reason:string;originalVerified:boolean}){
  this.require(u,'review');if(!input.originalVerified||input.reason.length<15)throw new HttpError(422,'Die Korrektur benötigt eine begründete Prüfung am Original.');
  const r=await this.one('SELECT data FROM versions WHERE id=? AND current=1',versionId);if(!r)throw new HttpError(404,'Aktuelle Fassung fehlt.');const d:Doc=JSON.parse(r.data);const before={text:d.text,pageData:d.pageData,quality:d.quality,publishedAt:d.publishedAt};
  d.text=input.text;d.pageData=input.pages;d.quality='reliable';d.publishedAt=input.publishedAt;d.validFrom=input.validFrom;d.validTo=input.validTo;d.versionLabel=input.versionLabel;d.reviewedAt=null;d.lastSuccess=null;d.method+='; Extraktion am Original korrigiert durch '+u.name;
  const deps=await this.rows('SELECT DISTINCT c.* FROM claims c JOIN evidence e ON e.claim_id=c.id WHERE e.version_id=? AND c.active=1',versionId);
  const stm=[this.db.prepare('UPDATE versions SET data=? WHERE id=? AND data=?').bind(json(d),versionId,r.data),this.db.prepare('UPDATE sources SET last_check=NULL WHERE id=?').bind(d.sourceId),this.db.prepare('UPDATE programs SET revision=revision+1 WHERE id=?').bind(d.programId)];
  for(const row of deps){const c:Claim=JSON.parse(row.data);c.freshness='erneut zu prüfen';c.approval='Entwurf';stm.push(this.db.prepare('UPDATE claims SET data=? WHERE id=?').bind(json(c),c.id));}
  const changed=await this.db.batch(stm);if(!changed[0].meta.changes)throw new HttpError(409,'Die Dokumentextraktion wurde zwischenzeitlich geändert.');await this.event('Extraktion korrigiert',d.programId,{versionId,before,after:{text:d.text,pageData:d.pageData,quality:d.quality},actor:u.id,reason:input.reason,originalHash:d.hash});return {saved:true};
 }
}
