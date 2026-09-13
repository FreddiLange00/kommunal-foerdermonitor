# Railway-Betrieb – verifizierter Stand 2026-09-13, 22:07 UTC

Projekt Kommunaler Fördermonitor: `0af1ed2a-b1d7-41a1-93ac-8f05abf37d9a`; production `3fdd2b62-0bac-4d29-a664-a6fd03b69a0b`.

## Tatsächlich laufende Dienste

- Runner `3dc3850e-cfe9-49ad-ba70-394247ef811e`, Deployment `6ef6ec0e-b3fc-47b4-9925-f36f862da353`: SUCCESS. Quelle FreddiLange00/kommunal-foerdermonitor, Branch main, Root /worker. Wiederholte erfolgreiche Verbindungen zur privaten Site sind in Runtime-Logs bestätigt (ok true, idle true). Prozess läuft unabhängig von einem geöffneten Browser; ein mehrtägiger Betriebsnachweis steht aus.
- PDF-Dienst `89000783-35b1-479c-b392-a01331ed2d4e`, Deployment `1d9974ba-1a91-4007-9295-cc799e8cc5a3`: SUCCESS. Root /worker/pdf, Dockerfile, Port 8080, Healthcheck /health, Neustart ALWAYS. HTTPS-Adresse https://foerdermonitor-pdf-production.up.railway.app. Extraktion benötigt Zugriffstoken.
- Beide Dienste verwenden explizit den Branch main. Das Bestätigen der vorbereiteten Quellkonfiguration startete die erfolgreichen Builds. Repository-Zugriff ist bestätigt. Automatische Deployments bei GitHub-Pushes meldeten vor diesem manuellen Start weiterhin NO_INSTALLATION; deren Funktion ist daher nicht nachgewiesen. Dies ist unabhängig vom laufenden Hintergrundprozess.
- Deploymentregion bei Inbetriebnahme: sfo (US West). Die Live-Tests verwendeten ausschließlich synthetische PDF-Inhalte. Private Nutzeruploads werden nicht automatisch an den Dienst übertragen.
- RUNNER_TOKEN, SITES_GATE_TOKEN und PDF_SERVICE_TOKEN sind in den jeweiligen Serverkonfigurationen gespeichert, nicht im Repository. Sites-Umgebungsrevision 1 erfolgreich veröffentlicht.

## Ausgeführter Live-Test des PDF-Dienstes

1. GET /health → HTTP 200.
2. POST /extract ohne Zugriffstoken → HTTP 403.
3. Autorisierter POST mit synthetischer dreiseitiger PDF → HTTP 200, drei Seiten erhalten.
4. Native Textseite: Zahlenwortlaut 200000 erhalten.
5. Tabellenseite: Tabelle erkannt; requiresVisual true.
6. Gescannte Seite: OCR ausgeführt, Zahlenwortlaut 200000 erkannt; requiresVisual true.

Der Test belegt diese gezielten Fälle, keine allgemeine Fehlerfreiheit. Es wurde keine echte Förderbedingung freigegeben. Frühere 36 synthetische Anwendungstests bleiben ein separater Nachweis.

## Weiterhin offen

OpenAI-API-Schlüssel und Modell sowie Brave-Suchzugang sind noch nicht eingerichtet. Der tägliche Zeitplan bleibt vorerst deaktiviert. Der laufende Runner kann bereits angelegte Aufträge bearbeiten, ist aber kein Nachweis einer vollständigen täglichen Internetrecherche. Nach Einrichtung der Anbieter: einen vollständigen Lauf prüfen, Zeitplan für 07:00 Europe/Berlin aktivieren und mindestens einen automatisch gestarteten Tageslauf nachweisen. Fachliche Freigabe und unabhängiger realer Referenzbestand bleiben erforderlich.
