# Railway-Einrichtung – verifizierter Zwischenstand

Projekt: Kommunaler Fördermonitor (`0af1ed2a-b1d7-41a1-93ac-8f05abf37d9a`), Umgebung production (`3fdd2b62-0bac-4d29-a664-a6fd03b69a0b`).

- Runner: `3dc3850e-cfe9-49ad-ba70-394247ef811e`, vorbereitet, ohne laufende Bereitstellung und ohne Quellverbindung.
- PDF-Dienst: `89000783-35b1-479c-b392-a01331ed2d4e`, Quelle FreddiLange00/kommunal-foerdermonitor, Verzeichnis `/worker/pdf`, Dockerfile `Dockerfile`, Port 8080, Healthcheck `/health`, Neustart ALWAYS. Ein Zugriffstoken ist ausschließlich als Railway-Variable gespeichert.
- Vollständiger Anwendungscode nach GitHub übertragen; README-Initialisierung in der Historie erhalten.
- Python-Syntaxprüfung erfolgreich. Tatsächlicher PDF-Parser mit synthetischer Ein-Seiten-PDF lokal getestet: Text, Zahlenwortlaut und Seitenindex erhalten. Kein Live-Diensttest.
- Trotz positiver Antwort auf das Anlegen der GitHub-Bereitstellung zeigt Railway keine Deployments. Ein erneuter Bereitstellungsversuch meldet: kein früheres Deployment vorhanden. Ein nachfolgender Push des PDF-Dienstes hat bisher ebenfalls keinen Build ergeben. Ursache nicht abschließend geklärt. In Railway GitHub-Verbindung, Zugriff auf dieses Repository und verbundenen Branch main prüfen; die ChatGPT-GitHub-Verbindung allein bestätigt diesen Zugang nicht.
- Eine öffentlich erreichbare Railway-Domain wurde durch automatische Sicherheitsprüfung abgelehnt. Es wurde keine Domain erzeugt und kein alternativer Weg zur Veröffentlichung benutzt. Für die HTTPS-Anbindung an die private Site ist eine ausdrückliche Freigabe erforderlich; Extraktion bleibt zusätzlich durch Token geschützt.
- Der Site-Maschinenzugang ist nicht erstellt. OpenAI, Brave-Suche und täglicher Zeitplan sind nicht aktiviert. Es wird kein erfolgreicher Tageslauf behauptet.

Nächster Betriebsnachweis: tatsächlicher Build und Start, autorisierte und unautorisierte HTTP-Anfragen prüfen, PDF einschließlich Tabelle/Scan testen, erst danach Site-Verbindung und Tagesbetrieb aktivieren. Geheimnisse niemals in dieses Repository aufnehmen.
