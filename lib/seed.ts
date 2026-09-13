import {blankScope,unknownClaim,type Program,type Doc,type Claim} from './model';
export const seedDate='2026-09-13T14:52:26.000Z';
export const seedPrograms:Program[]=[
 {id:'de-krl',name:'Kommunalrichtlinie',shortName:'KRL',region:'Bund',themes:['Klimaschutz','Energetische Sanierung'],instrument:null,discoveryNote:'Originalseite und verlinkte Richtlinie identifiziert. Konditionen der einzelnen Förderschwerpunkte getrennt prüfen.',createdAt:seedDate,revision:1},
 {id:'eu-elena',name:'ELENA – Technische Hilfe für Energie- und Verkehrsprojekte',shortName:'ELENA',region:'EU',themes:['Energetische Sanierung','Erneuerbare Energien'],instrument:null,discoveryNote:'Originalseite der Europäischen Investitionsbank abgerufen. FAQ und Antragsunterlagen sind gesondert auszuwerten.',createdAt:seedDate,revision:1},
 {id:'nrw-kommunal-invest',name:'NRW.BANK.Kommunal Invest',shortName:'Kommunal Invest',region:'Nordrhein-Westfalen',themes:['Klimaschutz','Erneuerbare Energien'],instrument:null,discoveryNote:'Originalseite der NRW.BANK abgerufen. Die Hinweise zu Plus und Klimaschutz dürfen nicht auf das Hauptprogramm übertragen werden.',createdAt:seedDate,revision:1}
];
export const seedSources=[
{"id": "by-min", "programId": null, "url": "https://www.stmb.bayern.de/", "publisher": "Bayerisches Staatsministerium für Wohnen, Bau und Verkehr", "region": "Bayern", "type": "Einstieg", "verified": true},
{"id": "ibb", "programId": null, "url": "https://www.ibb.de/de/startseite/startseite.html", "publisher": "Investitionsbank Berlin", "region": "Berlin", "type": "Einstieg", "verified": true},
{"id": "brandenburg", "programId": null, "url": "https://zukunftspaket.brandenburg.de/start/", "publisher": "Landesregierung Brandenburg – Zukunftspaket", "region": "Brandenburg", "type": "Einstieg", "verified": true},
{"id": "bab", "programId": null, "url": "https://www.bab-bremen.de/de/page/startseite", "publisher": "BAB – Bremer Aufbau-Bank", "region": "Bremen", "type": "Einstieg", "verified": true},
{"id": "ifb", "programId": null, "url": "https://www.ifbhh.de/", "publisher": "IFB Hamburg", "region": "Hamburg", "type": "Einstieg", "verified": true},
{"id": "wibank", "programId": null, "url": "https://www.wibank.de/wibank/", "publisher": "Wirtschafts- und Infrastrukturbank Hessen", "region": "Hessen", "type": "Einstieg", "verified": true},
{"id": "lfi", "programId": null, "url": "https://www.lfi-mv.de/", "publisher": "Landesförderinstitut Mecklenburg-Vorpommern", "region": "Mecklenburg-Vorpommern", "type": "Einstieg", "verified": true},
{"id": "nbank", "programId": null, "url": "https://www.nbank.de/", "publisher": "NBank", "region": "Niedersachsen", "type": "Einstieg", "verified": true},
{"id": "sikb", "programId": null, "url": "https://www.sikb.de/", "publisher": "Saarländische Investitionskreditbank", "region": "Saarland", "type": "Einstieg", "verified": true},
{"id": "sab", "programId": null, "url": "https://www.sab.sachsen.de/", "publisher": "Sächsische Aufbaubank", "region": "Sachsen", "type": "Einstieg", "verified": true},
{"id": "ibsa", "programId": null, "url": "https://www.ib-sachsen-anhalt.de/de/", "publisher": "Investitionsbank Sachsen-Anhalt", "region": "Sachsen-Anhalt", "type": "Einstieg", "verified": true},
{"id": "tab", "programId": null, "url": "https://www.aufbaubank.de/", "publisher": "Thüringer Aufbaubank", "region": "Thüringen", "type": "Einstieg", "verified": true},
 {id:'fdb',programId:null,url:'https://www.foerderdatenbank.de/FDB/DE/Home/home.html',publisher:'Förderdatenbank des Bundes',region:'Bund',type:'Einstieg',verified:true},
 {id:'krl-web',programId:'de-krl',url:'https://www.klimaschutz.de/de/foerderung-der-nki/foerderprogramme/kommunalrichtlinie',publisher:'Bundesministerium für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit',region:'Bund',type:'Programmseite',verified:true},
 {id:'krl-richtlinie',programId:'de-krl',url:'https://www.klimaschutz.de/sites/default/files/mediathek/dokumente/241111%20KRL2024_bf_nach%20BAnz.pdf',publisher:'Bundesministerium für Wirtschaft und Klimaschutz',region:'Bund',type:'Richtlinie',verified:true},
 {id:'krl-annex',programId:'de-krl',url:'https://www.klimaschutz.de/sites/default/files/mediathek/dokumente/241111%20TA%20KRL%202024_bf_nach%20BAnz.pdf',publisher:'Bundesministerium für Wirtschaft und Klimaschutz',region:'Bund',type:'Technischer Anhang',verified:true},
 {id:'elena-web',programId:'eu-elena',url:'https://www.eib.org/de/products/advisory-services/elena/index',publisher:'Europäische Investitionsbank',region:'EU',type:'Programmseite',verified:true},
 {id:'elena-faq',programId:'eu-elena',url:'https://www.eib.org/files/documents/elena_faq_en.pdf',publisher:'Europäische Investitionsbank',region:'EU',type:'FAQ',verified:true},
 {id:'nrw-web',programId:'nrw-kommunal-invest',url:'https://www.nrwbank.de/de/foerderung/foerderprodukte/15198/nrwbank-kommunal-invest.html',publisher:'NRW.BANK',region:'Nordrhein-Westfalen',type:'Programmseite',verified:true},
 {id:'nrw-min',programId:null,url:'https://www.wirtschaft.nrw/foerderung-im-energiebereich',publisher:'Ministerium für Wirtschaft, Industrie, Klimaschutz und Energie NRW',region:'Nordrhein-Westfalen',type:'Einstieg',verified:true},
 {id:'lbank',programId:null,url:'https://www.l-bank.de/',publisher:'L-Bank',region:'Baden-Württemberg',type:'Einstieg',verified:true},
 {id:'ibsh',programId:null,url:'https://www.ib-sh.de/',publisher:'Investitionsbank Schleswig-Holstein',region:'Schleswig-Holstein',type:'Einstieg',verified:true},
 {id:'isb',programId:null,url:'https://isb.rlp.de/',publisher:'Investitions- und Strukturbank Rheinland-Pfalz',region:'Rheinland-Pfalz',type:'Einstieg',verified:true}
];
const passages=[
 {source:'krl-web',title:'Kommunalrichtlinie',pieces:[['region','Bundesweit','Programminformationen → Förderregion'],['agency','Zukunft – Umwelt – Gesellschaft (ZUG) gGmbH','Programminformationen → Projektträger']]},
 {source:'elena-web',title:'ELENA – Technische Hilfe für Energie- und Verkehrsprojekte',pieces:[['applicants','regionale und kommunale Behörden','Förderkriterien → Öffentlicher Sektor'],['amount','bis zu 90 Prozent der Kosten öffentlicher und privater Einrichtungen für die Projektvorbereitung','Unser Angebot → technische Hilfe']]},
 {source:'nrw-web',title:'NRW.BANK.Kommunal Invest',pieces:[['applicants','kommunale Gebietskörperschaften','Wer wird gefördert?'],['measures','Energieeinsparung und Umstellung auf umweltfreundliche Energieträger','Was wird gefördert?']]}
];
export async function seedRecords(){const docs:Doc[]=[],claims:Claim[]=[];
 for(const p of passages){const s=seedSources.find(s=>s.id===p.source)!;const text=p.pieces.map(x=>x[1]).join('\n\n');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
 const d:Doc={id:`doc-${s.id}`,sourceId:s.id,programId:s.programId!,versionId:`excerpt-${s.id}-20260913`,title:p.title,publisher:s.publisher,url:s.url,retrievedAt:seedDate,publishedAt:null,versionLabel:null,validFrom:null,validTo:null,hash,text,quality:'partial',originalKey:null,pageData:[],scope:blankScope(s.programId!),current:true,lastAttempt:seedDate,lastSuccess:null,reviewedAt:null,method:'Bei der Erstellung über Webrecherche abgerufener, gekürzter Originalauszug. Kein vollständiger Archivsnapshot; Abruf zur Einrichtung dokumentiert.',references:seedSources.filter(x=>x.programId===s.programId&&x.id!==s.id).map(x=>x.url)};docs.push(d);
 for(const [key,quote,locator] of p.pieces){const c=unknownClaim(s.programId!,key);Object.assign(c,{id:`seed-${s.id}-${key}`,value:key==='amount'?'Für technische Hilfe zur Projektvorbereitung: maximal 90 % der betreffenden Kosten; weitere Bedingungen sind zu prüfen.':quote,information:'Belegt',reason:'Originalauszug vorhanden. Tragfähigkeit im vollständigen Dokument und zeitliche Anwendbarkeit noch fachlich zu prüfen.',conditions:key==='amount'?['Ausschließlich technische Hilfe zur Projektvorbereitung; keine Investitionsförderquote.','Weitere Bedingungen, Kostenabgrenzung und aktueller Zugang ungeprüft.']:['Keine pauschale Förderzusage; weitere Bedingungen offen.'],requiredProjectFields:key==='applicants'?['Rechtsform']:[],evidence:[{id:`ev-${s.id}-${key}`,documentId:d.id,versionId:d.versionId,url:d.url,title:d.title,publisher:d.publisher,locator,quote,context:quote,checkedAt:seedDate,pageIndex:null,printedPage:null}]});claims.push(c);}
 }
 return {docs,claims};
}
