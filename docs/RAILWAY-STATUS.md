# Railway-Einrichtung – verifizierter Zwischenstand

Projekt: Kommunaler Fördermonitor (`0af1ed2a-b1d7-41a1-93ac-8f05abf37d9a`), Umgebung production (`3fdd2b62-0bac-4d29-a664-a6fd03b69a0b`).

## Eingerichtet

- Vollständiger Anwendungscode im privaten GitHub-Repository FreddiLange00/kommunal-foerdermonitor, Branch main.
- Runner `3dc3850e-cfe9-49ad-ba70-394247ef811e`: Startkonfiguration, Zieladresse sowie beide benötigten Maschinenzugangstoken in Railway hinterlegt. Noch ohne Quellverbindung und ohne laufende Bereitstellung.
- PDF-Dienst `89000783-35b1-479c-b392-a01331ed2d4e`: Repository verbunden, Verzeichnis /worker/pdf, Dockerfile, Port 8080, Healthcheck /health, Neustart ALWAYS. PDF_SERVICE_TOKEN in Railway und Sites als Server-Geheimnis hinterlegt.
- Nach ausdrücklicher Nutzerfreigabe HTTPS-Adresse https://foerdermonitor-pdf-production.up.railway.app erzeugt. Der Extraktionsendpunkt verlangt weiterhin den Zugriffstoken. Eine Adresse belegt noch keinen laufenden Dienst.
- Nach ausdrücklicher Nutzerfreigabe Site-Maschinenzugang erstellt und im Runner gespeichert. RUNNER_TOKEN zusätzlich in Sites hinterlegt. Keine Geheimnisse in Quelltext oder Dokumentation.
- Sites-Konfiguration erfolgreich mit Umgebungsrevision 1 veröffentlicht.
- Python-Syntaxprüfung und tatsächliche lokale Extraktion einer synthetischen Ein-Seiten-PDF bestanden. Noch kein Live-PDF-Test.

## Nachgewiesener Startblocker

Railway meldet für den PDF-Dienst: Auto-Deploy disabled, canEnable false, reason NO_INSTALLATION. Die Repository-Prüfung liefert accessible false und keine Branches. Es fehlt damit die separate Railway-GitHub-App-Freigabe für dieses Repository; eine ChatGPT-GitHub-Verbindung ersetzt diese nicht. GitHub selbst bestätigt, dass das Repository privat ist. Die generische Railway-Fehlermeldung mit dem Wort public wird nicht als Gegenbeleg zur Sichtbarkeit übernommen.

Es bestehen weiterhin keine Railway-Deployments. Benutzer muss die Railway-GitHub-App für genau dieses Repository autorisieren. Danach Zugriff aktualisieren, Source-Branch main prüfen, bestehenden Runner mit derselben Quelle und Root /worker verbinden, beide Dienste starten und Logs prüfen. Keine doppelten Dienste anlegen.

## Weiterhin offen

Live-HTTP- und PDF-/OCR-Tests; dauerhafter Runner; OpenAI- und Brave-Zugang; aktivierter Zeitplan; Nachweis eines Laufs um 07:00 Europe/Berlin. Keine tägliche Recherche oder erfolgreiche Verarbeitung behauptet. Die fachliche Freigabe bleibt unabhängig von der technischen Inbetriebnahme erforderlich.
