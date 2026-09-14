import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {Repository,HttpError,uid,iso,json} from '@/lib/repository';
import {enqueueRun,tick,extractVersion,type RuntimeSecrets} from '@/lib/research';
import {blankScope,claimSchema,scopeSchema,REGIONS,THEMES,type User} from '@/lib/model';
import {answerQuestion} from '@/lib/chat';
import {publishable,safeTarget} from '@/lib/controls';
import {z} from 'zod';
import {saveProviders,providerSecrets} from '@/lib/provider-vault';
export const dynamic='force-dynamic';
const reply=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function runtime(){const e=env as unknown as RuntimeSecrets&{DB:D1Database;BUCKET:R2Bucket;PROVIDER_VAULT_KEY?:string};if(!e.DB||!e.BUCKET)throw new HttpError(503,'Datenbank oder Dateispeicher ist derzeit nicht erreichbar.');return {...e};}
async function authenticate(repo:Repository){const identity=await getChatGPTUser();if(!identity)throw new HttpError(401,'Bitte mit ChatGPT anmelden.');return repo.identify({id:identity.userId,email:identity.email,name:identity.displayName});}
function failure(e:unknown){if(e instanceof HttpError)return reply({error:e.message},e.status);if(e instanceof z.ZodError)return reply({error:e.issues.map(i=>i.path.join('.')+': '+i.message).join('; ')},422);console.error('monitor operation failed',e instanceof Error?e.name:'Error');return reply({error:'Der Vorgang konnte nicht abgeschlossen werden. Eingaben bleiben erhalten; bitte erneut versuchen.'},500);}
export async function GET(req:Request){try{const e=runtime(),repo=new Repository(e.DB,e.BUCKET),u=await authenticate(repo);await repo.seed();const q=new URL(req.url).searchParams;
 if(q.get('view')==='document'){repo.require(u,'read');const row=await repo.one('SELECT data FROM versions WHERE id=?',q.get('versionId'));if(!row)throw new HttpError(404,'Dokument fehlt.');return reply(JSON.parse(row.data));}
 if(q.get('view')==='history'){repo.require(u,'read');return reply(await repo.history(q.get('programId')??''));}
 if(q.get('view')==='entities'){const programId=q.get('programId');return reply({modules:await repo.rows('SELECT * FROM modules WHERE program_id=?',programId),calls:await repo.rows('SELECT * FROM calls WHERE program_id=?',programId),variants:await repo.rows('SELECT * FROM variants WHERE program_id=?',programId)});}
 if(q.get('view')==='project'){const project=await repo.project(q.get('id')??'',u);return reply({project,uploads:(await repo.rows('SELECT id,data FROM uploads WHERE project_id=? AND owner_id=?',project.id,u.id)).map(x=>({id:x.id,...JSON.parse(x.data)})),correspondence:(await repo.rows('SELECT * FROM correspondence WHERE project_id=? AND owner_id=?',project.id,u.id)).map(x=>({...x,data:JSON.parse(x.data)}))});}
 if(q.get('view')==='chats'){const d=await repo.data(q.get('programId')??'');const p=d.programs.find(p=>p.id===q.get('programId'));return reply((await repo.rows('SELECT * FROM chats WHERE owner_id=? AND program_id=? ORDER BY at DESC LIMIT 20',u.id,q.get('programId'))).map(x=>({id:x.id,at:x.at,question:JSON.parse(x.data).question,invalidated:x.revision!==p?.revision,notice:'Frühere Antworten sind Verlauf, keine Quellen. Für den aktuellen Stand erneut fragen.'})));}
 if(q.get('view')==='export'){const d=await repo.data(q.get('programId')??undefined);const claims=d.claims.filter(c=>publishable(c,d.docs));return new Response(json({exportedAt:iso(),programs:d.programs.filter(p=>!q.get('programId')||p.id===q.get('programId')),claims,questions:d.questions,documents:d.docs.map(({text,...x})=>x),note:'Nur fachlich freigegebene aktuelle Aussagen; offene Punkte bleiben erhalten.'}),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="foerdermonitor-export.json"','Cache-Control':'no-store'}});}
 const providers=await providerSecrets(repo,e);const result=await repo.snapshot(u);return reply({...result,providerModel:providers.OPENAI_MODEL??'',providerStorageRights:providers.BRAVE_STORAGE_RIGHTS==='true',capabilities:{vaultReady:!!e.PROVIDER_VAULT_KEY,webSearch:!!providers.BRAVE_SEARCH_API_KEY&&providers.BRAVE_STORAGE_RIGHTS==='true',aiExtraction:!!providers.OPENAI_API_KEY&&!!providers.OPENAI_MODEL,pdfExtraction:!!e.PDF_SERVICE_URL&&!!e.PDF_SERVICE_TOKEN,runnerCredential:!!e.RUNNER_TOKEN,schedulerHosted:false}});
 }catch(e){return failure(e);}}
export async function POST(req:Request){try{const e=runtime(),repo=new Repository(e.DB,e.BUCKET);if(Number(req.headers.get('content-length')??0)>1_200_000)throw new HttpError(413,'Eingabe zu groß.');const raw=await req.text();if(raw.length>1_200_000)throw new HttpError(413,'Eingabe zu groß.');const body=JSON.parse(raw);const action=z.string().parse(body.action);
 // The private Sites gateway still applies. A service token does not bypass it.
 const runner=action==='tick'&&e.RUNNER_TOKEN&&req.headers.get('authorization')===`Bearer ${e.RUNNER_TOKEN}`;
 if(runner)return reply(await tick(repo,await providerSecrets(repo,e),true));
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new HttpError(403,'Ungültiger Anforderungsursprung.');const u=await authenticate(repo);await repo.seed();
 if(action==='save_providers'){if(origin!==new URL(req.url).origin)throw new HttpError(403,'Schlüsseleingabe nur aus der Anwendung zulässig.');return reply(await saveProviders(repo,u,body.providers,e.PROVIDER_VAULT_KEY));}
 if(action==='run'){repo.require(u,'research');return reply(await enqueueRun(repo));}
 if(action==='tick'){repo.require(u,'research');return reply(await tick(repo,await providerSecrets(repo,e)));}
 if(action==='extract'){repo.require(u,'edit');return reply(await extractVersion(repo,z.string().parse(body.versionId),await providerSecrets(repo,e),u));}
 if(action==='propose')return reply(await repo.propose(claimSchema.parse(body.claim),u));
 if(action==='document_review')return reply(await repo.correctExtraction(z.string().parse(body.versionId),u,z.object({text:z.string().min(10).max(500000),pages:z.array(z.object({pageIndex:z.number().int().nonnegative(),printedPage:z.string().nullable(),text:z.string(),tables:z.array(z.unknown()).optional()}).passthrough()).max(150),publishedAt:z.string().nullable(),validFrom:z.string().nullable(),validTo:z.string().nullable(),versionLabel:z.string().nullable(),reason:z.string().min(15),originalVerified:z.literal(true)}).parse(body.document)));
 if(action==='review'){return reply(await repo.review(z.string().parse(body.claimId),u,z.enum(['approve','return']).parse(body.decision),z.string().parse(body.reason),z.object({context:z.boolean(),scope:z.boolean(),exceptions:z.boolean(),visual:z.boolean()}).parse(body.attest)));}
 if(action==='chat'){
  repo.require(u,'chat');const question=z.string().min(3).max(3000).parse(body.question),scope=scopeSchema.parse(body.scope);const d=await repo.data(scope.programId);if(!d.programs.some(p=>p.id===scope.programId))throw new HttpError(404,'Programm fehlt.');
  let project:Record<string,string>={};if(body.projectId){const p=await repo.project(body.projectId,u);if(p.program_id!==scope.programId)throw new HttpError(422,'Projekt gehört zu einem anderen Programm.');project=p.data.facts??{};}
  const asOf=body.asOf?z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(body.asOf):undefined;
  const answer=answerQuestion({question,scope,claims:d.claims,docs:d.docs,project,asOf,versionIds:body.versionIds?z.array(z.string()).max(30).parse(body.versionIds):undefined});
  await repo.exec('INSERT INTO chats(id,owner_id,program_id,at,revision,data) VALUES(?,?,?,?,?,?)',uid(),u.id,scope.programId,iso(),d.programs.find(p=>p.id===scope.programId)!.revision,json({question,answer}));return reply(answer);
 }
 if(action==='save_config'){
  repo.require(u,'admin');const config=z.object({maxSources:z.number().int().min(1).max(200),maxSearches:z.number().int().min(1).max(144),maxAttempts:z.number().int().min(1).max(5),maxDailyEuro:z.number().positive().max(100),hour:z.number().int().min(0).max(23),minute:z.number().int().min(0).max(59),scheduleEnabled:z.boolean(),regions:z.array(z.enum(REGIONS as [string,...string[]])).min(1),themes:z.array(z.enum(THEMES as [string,...string[]])).min(1)}).strict().parse(body.config);
  await repo.exec('INSERT INTO settings(key,data) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data','config',json({...await repo.config(),...config}));await repo.event('Konfiguration geändert',null,{actor:u.id,config});return reply({saved:true});
 }
 if(action==='member'){
  repo.require(u,'admin');const email=z.string().email().parse(body.email).toLowerCase(),role=z.enum(['reader','researcher','reviewer']).parse(body.role);if(email===u.email.toLowerCase())throw new HttpError(422,'Die eigene Administrationsrolle bleibt erhalten.');await repo.exec('INSERT INTO members(id,email,name,role,created_at) VALUES(?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET role=excluded.role',`pending:${uid()}`,email,email,role,iso());await repo.event('Teamrechte geändert',null,{actor:u.id,email,role});return reply({saved:true,note:'Rolle gespeichert. Keine Einladung versendet. Der Site-Zugang muss separat für diese Person freigegeben sein.'});
 }
 if(action==='source'){
  repo.require(u,'admin');const source=z.object({url:z.string().url(),publisher:z.string().min(3),title:z.string().min(3),region:z.string(),programId:z.string().nullable(),type:z.string(),verified:z.literal(true),verificationNote:z.string().min(12),scope:scopeSchema.nullable()}).parse(body.source);safeTarget(source.url,[new URL(source.url).hostname]);
  if(source.programId&&!await repo.one('SELECT id FROM programs WHERE id=?',source.programId))throw new HttpError(404,'Programm fehlt.');
  await repo.exec('INSERT INTO sources(id,program_id,url,data) VALUES(?,?,?,?)',uid(),source.programId,source.url,json({...source,enabled:true,discoveredAt:iso(),verifiedBy:u.id}));await repo.event('Quelle aufgenommen',source.programId,{url:source.url,actor:u.id,verificationNote:source.verificationNote});return reply({saved:true});
 }
 if(action==='candidate'){
  repo.require(u,'edit');const c=await repo.one('SELECT * FROM candidates WHERE id=?',body.id);if(!c)throw new HttpError(404,'Treffer fehlt.');const candidate=JSON.parse(c.data);const id=uid(),name=z.string().min(4).max(300).parse(body.name);await repo.exec('INSERT INTO programs(id,data,revision) VALUES(?,?,1)',id,json({id,name,shortName:name,region:candidate.region??'Ungeklärt',themes:candidate.theme?[candidate.theme]:[],instrument:null,discoveryNote:'Suchhinweis; Antragsberechtigung und Originalquellen ungeklärt.',createdAt:iso(),revision:1}));await repo.exec('UPDATE candidates SET status=? WHERE id=?','als Prüffall erfasst',c.id);await repo.addQuestion(id,{question:'Ist das Programm für kommunale Antragsteller relevant?',reason:'Bislang nur ein Suchhinweis.',documents:[],kind:'Nachrecherche',nextStep:`Originalquelle und Herausgeber zu ${c.url} prüfen.`});return reply({id});
 }
 if(action==='entity'){
  repo.require(u,'edit');const type=z.enum(['module','call','variant']).parse(body.type),programId=z.string().parse(body.programId),name=z.string().min(3).parse(body.name),id=uid();if(!await repo.one('SELECT id FROM programs WHERE id=?',programId))throw new HttpError(404,'Programm fehlt.');
  if(type==='module')await repo.exec('INSERT INTO modules(id,program_id,data) VALUES(?,?,?)',id,programId,json({name}));
  if(type==='call')await repo.exec('INSERT INTO calls(id,program_id,module_id,data) VALUES(?,?,?,?)',id,programId,null,json({name}));
  if(type==='variant')await repo.exec('INSERT INTO variants(id,program_id,call_id,data) VALUES(?,?,?,?)',id,programId,null,json({name}));return reply({id,name});
 }
 if(action==='question'){
  repo.require(u,'edit');const q=z.object({programId:z.string(),question:z.string().min(10),reason:z.string().min(10),nextStep:z.string().min(10),kind:z.enum(['Nachrecherche','Nutzerangabe','Fachprüfung','Förderstelle'])}).parse(body.question);return reply(await repo.addQuestion(q.programId,q));
 }
 if(action==='resolve_question'){
  repo.require(u,'review');const r=await repo.one('SELECT * FROM questions WHERE id=?',body.id);if(!r)throw new HttpError(404,'Prüfpunkt fehlt.');const q=JSON.parse(r.data);q.status='geklärt';q.resolution=z.string().min(15).parse(body.reason);q.resolvedBy=u.id;q.resolvedAt=iso();await repo.exec('UPDATE questions SET data=? WHERE id=?',json(q),r.id);await repo.event('Prüfpunkt geklärt',r.program_id,q);return reply(q);
 }
 if(action==='project'){
  repo.require(u,'project');const name=z.string().min(2).max(200).parse(body.name),programId=z.string().parse(body.programId),facts=z.record(z.string().max(2000)).parse(body.facts),id=body.id??uid();if(body.id)await repo.project(id,u);if(!await repo.one('SELECT id FROM programs WHERE id=?',programId))throw new HttpError(404,'Programm fehlt.');await repo.exec('INSERT INTO projects(id,owner_id,program_id,data) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',id,u.id,programId,json({name,facts,updatedAt:iso()}));return reply({id});
 }
 if(action==='correspondence'){
  const p=await repo.project(body.projectId,u);const data=z.object({sender:z.string().min(3),date:z.string(),text:z.string().min(10).max(50000),scope:z.string().min(10)}).parse(body.data);await repo.exec('INSERT INTO correspondence(id,owner_id,project_id,data) VALUES(?,?,?,?)',uid(),u.id,p.id,json({...data,status:'Entwurf',origin:'Einzelfallauskunft; nicht als allgemeine Programmregel zugelassen',recordedAt:iso()}));return reply({saved:true});
 }
 throw new HttpError(400,'Unbekannte Aktion.');
 }catch(e){return failure(e);}}
