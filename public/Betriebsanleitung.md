# Betriebsanleitung · Version 0.1.0

Stand: 13. September 2026. Diese Version ist eine nutzbare interne Arbeitsanwendung. Eine unabhängige fachliche Abnahme des realen Referenzbestands, ein Live-Test aller externen Adapter und der Nachweis eines dauerhaft laufenden Hintergrunddienstes stehen aus. Bis dahin keine allgemeine Förderberatung auf Grundlage ungeprüfter Angaben.

## Architektur und Kontrollweg

Die deutsche React-Oberfläche ruft authentifizierte Worker-APIs auf. D1 speichert Programme, Dokumentmetadaten, Aussagen, Belege, Prüfungen und Aufträge. R2 speichert Originaldateien sowie getrennte private Uploads. Ein separater Node-Dienst stößt serverseitige Warteschlangenarbeit an. Browser müssen dafür nicht geöffnet sein.

Abruf → unveränderliche Originaldatei/Fingerabdruck → Text-/PDF-Extraktion → Entwurf → technische Validierung → dokumentierte fachliche Freigabe → gefilterte Veröffentlichung und Belegauskunft. Die KI-Extraktion kann ausschließlich Vorschläge einreichen. Sie erhält keine Freigaberechte. Neue Fassungen und korrigierte Extraktionen sperren abhängige Aussagen, bis sie erneut geprüft wurden.

SQL wurde für Beziehungen und atomare Aufträge gewählt, R2 für größere Originaldateien. JSON-Spalten erhalten sämtliche Bedingungen und Metadaten ohne vorgetäuschte Vollständigkeit. React/Vinext nutzt die vorhandene Sites-Umgebung. Die Adapter für Suche und Extraktion sind getrennte Funktionen; ein Anbieterwechsel benötigt derzeit eine Codeänderung. Es besteht kein eingebautes autonomes Agentensystem.

## Zentrale vorläufige Annahmen

`lib/model.ts/defaultConfig` ist die zentrale Ausgangskonfiguration; veränderbare Betriebseinstellungen werden in `settings/config` gespeichert. Die Oberfläche bietet die wesentlichen Ressourcen-, Gebiets- und Zeitplaneinstellungen. Weitere Defaults werden versioniert im Code geändert.

Deutsch; internes Team; Deutschland mit allen 16 Ländern sowie Bund/EU; Städte, Gemeinden und Landkreise. Kommunale Gesellschaften, Eigenbetriebe und Zweckverbände werden als eigene Rechtsformen behandelt. Themen: energetische Sanierung, Klimaschutz, Klimaanpassung, erneuerbare Energien. Zuschuss, Darlehen, Zins-/Tilgungszuschuss und Bürgschaft sind getrennte Instrumente. Diese Produktentscheidungen belegen keine Förderbedingungen.

Zeitplan: täglich 07:00 Europe/Berlin, zunächst deaktiviert, bis der externe Dienst eingerichtet ist. Sommer-/Winterzeit wird durch IANA-Zeitzonenberechnung berücksichtigt. Strenger Freigabemodus; alle veröffentlichten Aussagen benötigen menschliche Freigabe. In-App-Ereignisse; keine automatische E-Mail, Einladung oder Nachricht an Förderstellen.

Budget pro Lauf: maximal 30 bekannte Quellen, 18 Suchaufträge, 5 Treffer je Suche, 8 MB je Dokument, 3 Versuche, 25 Minuten, 10 Modellaufrufe; vorläufige tägliche Kostenreservierung 3 EUR. Konfigurierbare Werte sind keine geprüften Anbieterpreise.

## Datenmodell und Freigabe

Stabile IDs trennen Programm, Modul, Aufruf, Konditionsvariante, Dokument und Dokumentversion. Eine Aussage besitzt einen expliziten Geltungsbereich einschließlich optionaler Region, Rechtsform, Zeit und Einzelfall. Belege referenzieren eine konkrete Version mit URL, Titel, Herausgeber, Fundstelle, Originalzitat, zusammenhängendem Kontext, Prüfzeit und Seitenbezug.

Der feste Steckbrief umfasst Identität, Zweck, Gebiet, Antragsteller/Ausschlüsse, Maßnahmen/Ausschlüsse, Instrument, Höhe, Bezugsgröße, Kosten, Finanzierung, Darlehen, Richtliniengültigkeit, Antragsfristen, Zugang, Mittel, Verfahren, Unterlagen, Beginn, Bündelung, Kombination und weitere Pflichten. Fehlende Angaben erscheinen leer mit Erklärung. Das System setzt sie nicht auf 0 oder false.

Informationsstatus: Belegt; Nicht gefunden; Mehrdeutig; Widersprüchlich; Quelle nicht prüfbar; Projektangabe fehlt; Nicht anwendbar. Davon unabhängig: aktuell geprüft / erneut zu prüfen / veraltet sowie Entwurf / automatisch geprüft / fachlich freigegeben. „Automatisch geprüft“ ist kein menschliches Urteil.

Code prüft Schema, Referenzen, Dokumentzuordnung, Zitat- und Kontextexistenz, ausgewählte Zahlen-/Einheiten-/Schwellenfehler, Ausnahmen und Aktualität. Allgemeine inhaltliche Tragfähigkeit lässt sich damit nicht vollständig beweisen. Die Fachprüfung muss Originalkontext, Geltungsbereich, referenzierte Unterlagen, Ausnahmen und gegebenenfalls das visuelle Original bestätigen und begründen. Die vier Bestätigungen sind nicht vorausgewählt. Bearbeiter und Zeitpunkt werden gespeichert. Es besteht kein organisatorisches Vier-Augen-Prinzip: eine berechtigte Person kann den eigenen Entwurf prüfen. Falls gewünscht, muss dies zusätzlich durchgesetzt werden.

Korrekturen erstellen neue Aussagenrevisionen. Konfliktverdacht sperrt die betroffene Schlussfolgerung; die einfache Konflikterkennung erkennt nicht jeden semantischen Widerspruch. Die Dokumentkorrektur bewahrt die Originaldatei und archiviert die vorherige Extraktion im Prüfereignis. Richtliniengültigkeit wird niemals automatisch zur Antragsfrist. Datumssuche und 30-Tage-Fristenliste berücksichtigen nur ausdrücklich als ISO-Datum erfasste Fristwerte; komplexe Fristregeln bleiben im Steckbrief. Ungeklärte Einträge lassen sich einschließen.

## Erster echter Arbeitsbestand

Drei echte Programme und 23 verifizierte Quellenadressen sind als Recherchebestand hinterlegt. Landesquellen decken als Einstiege alle 16 Länder ab; daraus folgt keine vollständige Programmabdeckung. Die tatsächlich bei der Einrichtung gelesenen kurzen Originalauszüge sind ausdrücklich partielle, ungeprüfte Dokumentstände. Für sie wird keine vollständige Originaldatei oder erfolgreich abgeschlossene Sachprüfung behauptet.

- Kommunalrichtlinie: https://www.klimaschutz.de/de/foerderung-der-nki/foerderprogramme/kommunalrichtlinie
- ELENA: https://www.eib.org/de/products/advisory-services/elena/index
- NRW.BANK.Kommunal Invest: https://www.nrwbank.de/de/foerderung/foerderprodukte/15198/nrwbank-kommunal-invest.html
- Einstieg des Bundes: https://www.foerderdatenbank.de/FDB/DE/Home/home.html

Die exakten URLs, Herausgeber und Quelle-Programm-Zuordnungen stehen in `lib/seed.ts` und im Quellenverzeichnis. Bei der Einrichtung gab es auch fehlgeschlagene Zugriffe, unter anderem auf einen BayernLabo-Einstieg, einen ILB-Aufruf und einen direkten EIB-Abruf aus der Laufzeit. Diese wurden nicht als erfolgreiche Prüfungen gespeichert. Ein erfolgreiches Lesen über die Rechercheumgebung garantiert keinen erfolgreichen Abruf aus dem späteren Hosting-Netz.

Alle sechs vorerfassten Aussagen bleiben Entwürfe. Es wurde keine menschliche fachliche Freigabe realer Förderbedingungen simuliert. Die Prüfliste enthält konkrete Lücken. Erst nach Beschaffung der notwendigen Originalunterlagen und tatsächlicher Prüfung darf die berechtigte Fachperson Teilangaben freigeben.

## Arbeitsablauf

1. Unter „Betrieb & Team“ Rechte vergeben. Leser sehen veröffentlichbare Aussagen; Recherche darf Quellenarbeit und Entwürfe bearbeiten; Prüfung darf freigeben. Die erstmalige Initialisierung weist dem ersten authentifizierten Besucher die Administration zu. Daher muss die Site bis zur Initialisierung ausschließlich dem Eigentümer zugänglich bleiben. Zusätzliche Personen benötigen sowohl Site-Zugang als auch eine Anwendungsrolle. Es werden keine Einladungen versandt.
2. Unter „Quellen & Suchraster“ Herausgeber und Zuständigkeit am Original verifizieren. Nur ausdrücklich registrierte HTTPS-Hosts sind für Dokumentabrufe zulässig. Neue Suchtreffer sind Hinweise; ihre Aufnahme als Quelle benötigt Prüfung. Region/Thema des Programmarbeitsbestands sind Suchzuordnungen, keine Bestätigung einer Berechtigung.
3. Einen Lauf anlegen und Aufträge verarbeiten. Ohne Hintergrunddienst ist Verarbeitung nur bei ausdrücklich ausgelöstem manuellen Tick möglich. Fehlende Such-/Modellkonfigurationen werden als Ausfälle protokolliert.
4. Im Programm Originaldokumente öffnen. PDFs mit Tabellen oder OCR bleiben bis zur visuellen Prüfung gesperrt. Seitenindex beginnt bei 0. Eine PDF-Seitenbezeichnung ist nicht automatisch die aufgedruckte Seitenzahl. Die vollständige Extraktion lässt sich getrennt prüfen und korrigieren.
5. Aussage, Originalzitat, Kontext, Fundstelle, Bedingungen und Geltungsbereich erfassen. Zahlen dürfen nicht ohne Bezugsgröße freigegeben werden. Fehlende Anhänge und Ausnahmen als offenen Punkt erfassen.
6. In der Prüfansicht die vollständige Originalstelle mit der Aussage abgleichen, bestätigen und begründen. Alternativ mit konkretem Grund zur Recherche zurückgeben. Die Freigabe betrifft die einzelne Aussage, nicht pauschal das ganze Programm.
7. Chat fragt nur das gewählte Programm und den gewählten Geltungsbereich ab. Freigegebene Teilantworten enthalten ihre Belege. Ungeklärte Aspekte werden benannt. Private Projektangaben bleiben gekennzeichnete Nutzerdaten.

## Chat, Projekte und Berechnungen

Die Auskunft ist deterministisch: regelbasierte Erkennung von Fragen zu Berechtigung, Maßnahmen, Beträgen, Fristen, Zugang, Unterlagen usw.; unveränderte freigegebene Aussagen mit Bedingungen und Belegen. Sie erzeugt keine freien Förderbedingungen aus Modellwissen. Neue Fallauslegungen werden nicht positiv beantwortet. Die Erkennung natürlicher Formulierungen ist begrenzt; ein nicht erkanntes Anliegen erhält eine gezielte Eingrenzungsfrage. Der Chat liest derzeit keinen vollständigen Dokumentkorpus bei jeder Frage erneut; der notwendige Kontext muss bei der fachlichen Freigabe geprüft werden. Dies ist eine bewusste Funktionsgrenze gegenüber dem gesamten Pflichtenheft.

Historische Antworten sind nur bei ausdrücklich hinterlegten, fachlich freigegebenen Geltungszeiträumen und passenden gespeicherten Fassungen möglich. Frühere Chatantworten werden nie als Quelle verwendet; nach Versionsänderungen sind gespeicherte Antworten als überholt markiert und müssen neu abgefragt werden.

Projekte und PDF-/Text-Uploads gehören ausschließlich ihrem Eigentümer. Auch andere Administratoren erhalten über diese APIs keinen Zugriff. Uploads werden gespeichert und geschützt heruntergeladen, aber noch nicht automatisch extrahiert oder in den Chat übernommen. Fallbezogene schriftliche Auskünfte sind getrennte, private Korrespondenz; keine automatische allgemeine Programmregel. Es gibt keine externe Kontaktaufnahme.

Ein deterministischer Cent-Rechner und strikte Schwellenwertvergleiche sind implementiert und getestet. Ein fachlich freigegebener Rechenadapter für konkrete reale Programme samt Oberfläche ist noch nicht vorhanden. Daher gibt die Anwendung keine automatisch berechnete konkrete Fördersumme aus.

## Hintergrundbetrieb einrichten

Die unterstützte Sites-Manifestkonfiguration bietet hier keinen aktivierten Cron-Trigger. Der mitgelieferte Node-Dienst ist die erforderliche externe Komponente. Die Bereitstellung der Site allein aktiviert ihn nicht.

Benötigte sichere Serverkonfiguration:

| Variable | Verwendung |
| --- | --- |
| `BRAVE_SEARCH_API_KEY` | Suchadapter; zusätzlich muss die gebuchte Lizenz die Speicherung gestatten |
| `BRAVE_STORAGE_RIGHTS=true` | explizite Bestätigung dieser Berechtigung; vorher keine Suchspeicherung |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | optionale KI-Entwürfe über Chat Completions; Modell muss kompatibel sein |
| `PDF_SERVICE_URL`, `PDF_SERVICE_TOKEN` | eigener HTTPS-PDF-/OCR-Dienst |
| `RUNNER_TOKEN` | langes zufälliges Geheimnis, identisch auf Site und Runner |

API-Schlüssel ausschließlich als Server-Secrets konfigurieren; keine davon sind hinterlegt. Im Runner zusätzlich `MONITOR_ORIGIN` und `SITES_GATE_TOKEN`. Der letzte Wert ist ein separat autorisierter Maschinenzugang durch das private Sites-Gateway. Ein normaler Anwendungstoken umgeht die Site-Zugriffsregel nicht. Ein solcher Gateway-Zugang wurde nicht erstellt. Seine dauerhafte Verfügbarkeit und zulässige Nutzungsdauer müssen mit dem Hosting geklärt werden. Ist kein geeigneter Maschinenzugang möglich, ist ein Hosting mit eigenem authentifizierten Scheduler-Endpunkt erforderlich; eine solche alternative Bereitstellung wurde nicht vorgenommen.

Auf einem eigenen Docker-Host nach Einrichtung der Zugänge:

```sh
cp worker/.env.example worker/.env
# Werte lokal eintragen, Datei nicht committen.
docker compose -f worker/compose.yaml up -d --build
docker compose -f worker/compose.yaml logs --tail 100
```

Der Runner fragt alle 10 Sekunden Arbeit ab; Zustand, Aufträge, Wiederholungen und Tagesdeduplizierung liegen in D1. Ein Dienstabsturz verliert damit keine Queue. Abgelaufene Leases werden wieder aufgenommen oder nach dem Versuchslimit abgeschlossen. Der Docker-Healthcheck prüft das letzte Lebenszeichen. Ein externer Infrastrukturmonitor muss Containerstillstand melden: eine ausgefallene Anwendung kann selbst keine zuverlässige Meldung zustellen. Die Oberfläche zeigt fehlende Lebenszeichen und Läufe; externe Alarmierung ist nicht konfiguriert.

Erst nach einem erfolgreichen manuellen Lauf Zeitplan aktivieren. Danach einen Lauf über 07:00 Europe/Berlin mit geschlossenem Browser beobachten und als Betriebsnachweis dokumentieren. Solch ein Langzeittest wurde hier nicht ausgeführt. Nach Ausfall erfolgt am gleichen Tag eine nachgeholte Planung; verpasste historische Tage werden nicht als nachträglich erfolgreich recherchiert ausgegeben.

Das Suchraster enthält Fördergebiet × Thema × Synonymvarianten, insgesamt im Default 144 Aufträge. Der Tagesbudget-Ausschnitt rotiert. Protokolle zeigen tatsächlich ausgeführte Suchaufträge, geplante Zellen, Ausfälle und Quellenanzahlen. Ein Lauf kann teilweise erfolgreich sein. Verzeichnisabrufe ohne Sachprüfung werden nicht als geprüfte Förderbedingungen gezählt. „Keine neuen Treffer“ sagt nichts über nicht geprüfte Quellen aus.

## PDF, Originaldateien und Abrufschutz

`worker/pdf` enthält einen getrennten Python-Dienst mit pdfplumber, pypdf, Poppler und Tesseract (Deutsch). Er hat Größen-, Seiten-, Laufzeit- und Speichergrenzen. Docker-Image und Live-Anbindung wurden in dieser Umgebung nicht ausgeführt. Betrieb nur isoliert und mit HTTPS sowie Token, ohne Zugriff auf interne Netze oder Geheimnisse.

Native PDF-Tabellen, Layouttext und Seitenbezüge werden extrahiert; Scan-Seiten durch OCR. Alle erkannten Tabellen/OCR-Fälle verlangen visuelle Prüfung. Unsichere Zahlen werden nicht automatisch freigegeben. HTML-Extraktion ist konservativ als partiell markiert. Referenzierte Unterlagen werden als Kandidaten/Lücken erfasst, nicht grenzenlos automatisch verfolgt. Zugriffsbeschränkte Portale benötigen einen zulässigen gesonderten Zugang und sind nicht implementiert.

Abrufe verwenden HTTPS, exakte erlaubte Hosts, Größen-/Zeitlimits, kontrollierte Weiterleitungen und einen einfachen konservativen robots.txt-Abgleich. Dieser ist kein vollständiger Standard-Crawler. Neu verifizierte Hosts sind eine administrative Vertrauensentscheidung. Suchtreffer können nie selbst beliebige Ziele freischalten. Heruntergeladene Inhalte sind Daten; keine darin enthaltenen Befehle werden ausgeführt.

## Aktualität, Datenpflege und Wiederherstellung

Letzter Abrufversuch, erfolgreiche Sachprüfung und fachliche Freigabe sind verschiedene Zeitpunkte. Abruffehler setzen keine erfolgreiche Prüfung. Unveränderte Original-Fingerabdrücke können bereits geprüfte Aussagen auffrischen; geänderte Fingerabdrücke sperren abhängige Angaben konservativ, auch wenn noch keine fachliche Bedeutung festgestellt ist. Ein Dokumentwechsel wird nicht automatisch als geänderte Förderbedingung bezeichnet.

Zugang, Mittel, Fristen und veränderliche Konditionen veralten nach 24 Stunden. Andere Aussagen nutzen vorläufig 720 Stunden. Freigegebene Ansichten, Chat und Exporte prüfen diesen Status bei der Ausgabe. Alte Ereignisse mit inzwischen überholten Aussagen werden nicht als heutiger bestätigter Stand ausgegeben.

D1 und R2 sind produktive Speicherdienste. Automatische unabhängige Backups, Aufbewahrungs-/Löschfristen und eine Wiederherstellungsprobe sind noch nicht eingerichtet. Vor Team-Produktivbetrieb Sicherung beider Speicher sowie Zugriff auf Export-/Restore-Werkzeuge des Hostingbetreibers organisieren. Der JSON-Export enthält freigegebene Aussagen, Belege, Dokumentmetadaten und offene Punkte, aber ist kein vollständiges Datenbank-/Originaldateibackup. Originalversionen und Prüfereignisse nicht manuell löschen. Migrationen versionieren und vor Anwendung sichern.

## Ausgeführte Abnahmetests und Grenzen

Die maschinenlesbaren Einzelresultate einschließlich Ausführungszeit stehen in `test-results.json` bzw. in der Oberfläche unter „Abnahmetests“. 40 Tests decken die ausdrücklich geforderten Fehlerklassen ab: fehlende Frist, Antragsstopp, Modul-/Bezugsgrößen-/Rechtsformtrennung, erhöhte Quote, Schwellenwerte, Kumulation, PDF-Unklarheit, unpassende Belege, Konflikte, Abruffehler, neue Fassungen, Programmisolation, fehlende Falldaten, Dokumentanweisungen, private Daten, DST, Centrechnung sowie Queue-/Lease-Wiederaufnahme. Ein synthetischer vollständiger Ablauf prüft Abruf → Speicherung → Entwurf → ausdrückliche simulierte Fachfreigabe → belegbare Teilantwort.

Diese Prüfungen verwenden synthetische Quellen und simuliertes Netzwerk. Sie belegen nicht die Richtigkeit der sechs realen Entwürfe. Nicht durchgeführt: unabhängige fachliche Abnahme eines repräsentativen realen Referenzbestands, Live-Brave-/OpenAI-/PDF-Integration, Dauerbetrieb, Browser-Interaktionstest, Accessibility-Audit, Lasttest, Sicherheitsreview und Wiederherstellungsprobe.

| Geforderte Kennzahl | Tatsächlicher Nachweis |
| --- | --- |
| Kritische Felder / Belegtragfähigkeit | gezielte synthetische Fehlerfälle; keine gemessene reale Genauigkeit |
| Erkennung relevanter Programme | Suchraster implementiert; Recall im realen Referenzbestand nicht gemessen |
| Änderungs-/Konflikterkennung | Fingerabdruck- und ausgewählte Konflikttests; fachliche Vollständigkeit nicht gemessen |
| Korrektes Offenlassen | gezielte Tests bestanden; keine allgemeine Fehlerquote ermittelt |
| Nutzbarkeit belegbarer Antworten | positiver synthetischer Teilantworttest bestanden; Nutzertest ausstehend |

Bekannte Abnahmelücken blockieren den betroffenen Umfang: freie fallbezogene Förderauslegung, automatische programmbezogene Berechnung, vollautomatische Uploadauswertung und behauptete flächendeckende Recherche sind nicht freigegeben. Die vorhandene manuelle Recherche-/Prüfarbeit kann genutzt werden. Fehlerfreiheit wird nicht versprochen.

## Kostenabschätzung mit offengelegten Annahmen

Es wurden keine kostenpflichtigen API-Aufrufe dieser Anwendung ausgeführt. Anbieter, Modell, Lizenz, Hostingtarif und Dokumentvolumen sind noch nicht verbindlich gewählt. Folgende Werte sind Rechenannahmen, keine aktuellen Angebote:

- 30 Tage × 18 Suchanfragen × angenommene 0,01 EUR = 5,40 EUR/Monat.
- 30 Tage × höchstens 10 Extraktionen × angenommene 0,10 EUR = 30,00 EUR/Monat.
- Angenommener externer kleiner Diensthost inklusive PDF = 15 EUR/Monat.
- Summe dieses Beispiels: 50,40 EUR/Monat, zusätzlich tatsächliche Sites-/D1-/R2-Kosten, Speicher/Traffic, gegebenenfalls Lizenzaufschläge, Umsatzsteuer und fachliche Prüfzeit.

Die 3-EUR-Tagesreservierung begrenzt geschätzte Such-/Modellkosten anhand der konfigurierten Einheitspreise, nicht die tatsächliche Anbieterrechnung. Für ein verbindliches Kostenlimit korrekte Tarife hinterlegen und Anbieterlimits setzen. Die manuelle Prüfung dürfte je nach Dokumentenkomplexität den größten Betriebsaufwand verursachen; ohne gemessene Bearbeitungszeiten wird kein Personalbudget erfunden.

## Versionierte Arbeitsanweisungen

`docs/prompts/recherche.v1.0.0.md`, `extraktion.v1.0.0.md`, `aussagenpruefung.v1.0.0.md`, `chat.v1.0.0.md` trennen die Phasen. Nur der Extraktionsprompt wird derzeit tatsächlich an ein optionales Sprachmodell gesendet. Die übrigen Regeln werden durch deterministische Verarbeitung und Fachprüfung unterstützt; ihre Existenz bedeutet keinen implementierten zweiten KI-Prüfer.

## Nachtrag: vorhandene API-Schlüssel eingeben

Administration: Unter Betrieb & Team → API-Schlüssel sicher hinterlegen die vorhandenen OpenAI- und Brave-Schlüssel eintragen. Sie werden mit AES-256-GCM, zufälliger Nonce und Anbieterbindung verschlüsselt in D1 gespeichert. PROVIDER_VAULT_KEY liegt getrennt als Sites-Servergeheimnis. Nur autorisierte Serververarbeitung entschlüsselt; Antworten und Ereignisse enthalten keine Schlüssel. Verschlüsselung schützt nicht vor vollständiger Kompromittierung des laufenden Servers. Für Wiederherstellung werden Datenbank und separat gesicherter Masterschlüssel benötigt. Masterschlüssel nicht unkoordiniert rotieren.

Leere Schlüsselfelder erhalten bestehende Werte. Die Eingabe ersetzt nur ausdrücklich übermittelte Schlüssel. OpenAI-Modell-ID gesondert erfassen; Speicherrechte der Brave-Suche ausdrücklich bestätigen. Speichern ist kein erfolgreicher Anbieterfunktionstest und startet noch keinen täglichen Zeitplan. Neue Runtime-Aufträge lesen die gespeicherten Zugänge ohne erneutes Deployment. Bereits als Server-Umgebungsvariable konfigurierte API-Schlüssel bleiben Fallback, soweit kein verschlüsselter Wert hinterlegt ist.
