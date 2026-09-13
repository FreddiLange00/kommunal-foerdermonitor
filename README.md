# Kommunaler Fördermonitor · 0.1.0

Arbeitsfähige erste Version mit echter Datenbank, Belegprüfung, fachlichem Freigabeverfahren, privaten Projekten und persistenter Auftragsverarbeitung. **Eine vollständige fachliche Produktionsabnahme liegt noch nicht vor.** Der tägliche Hintergrunddienst und externe Such-/Extraktionsdienste müssen gesondert eingerichtet werden.

Die vollständige Anleitung steht in [docs/BETRIEB.md](docs/BETRIEB.md) und in der Anwendung unter „Betrieb & Team“.

## Entwickeln und prüfen

Node 24, pnpm gemäß `packageManager`; Python 3.12 für den optionalen PDF-Dienst.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

Die Tests verwenden ausschließlich eine temporäre SQLite-Datenbank, simulierte Netzwerkantworten und ausdrücklich synthetische Förderbedingungen. Sie verändern keine Produktivdaten. Ergebnis: `docs/test-results.json`.

Sites bindet D1 als `DB` und R2 als `BUCKET` gemäß `.openai/hosting.json`; die Migrationen unter `drizzle/` werden mit dem Site-Artefakt bereitgestellt. Lokaler Start benötigt dieselben Bindings und die vom Hosting bereitgestellte Identität. Eine reine statische HTML-Bereitstellung ist nicht ausreichend.

## Aufbau

- `app/monitor.tsx`: deutsche Arbeitsoberfläche, Steckbrief, Prüfansicht, Quellen, Projekte und Chat.
- `app/api/`: authentifizierte APIs und geschützte Downloads.
- `lib/model.ts`, `lib/controls.ts`: Schema, Unsicherheiten, Beleg- und Veröffentlichungskontrollen.
- `lib/repository.ts`: persistente Daten, Revisionen, Freigaben, Zugriffsrechte.
- `lib/research.ts`: Abruf, Suchadapter, Extraktionsadapter, Warteschlange, Budgets und Zeitplan.
- `lib/chat.ts`: deterministische, programmspezifische Belegauskunft.
- `db/`, `drizzle/`: Datenmodell und versionierte Migrationen.
- `worker/`: separater browserunabhängiger Dienst; `worker/pdf/`: optionaler PDF-/OCR-Dienst.
- `docs/prompts/`: vier versionierte Arbeitsanweisungen. Laufzeitdefinition in `lib/prompts.ts`.

Keine API-Schlüssel in Quelltext, Browser oder Repository eintragen. `.env.example` enthält ausschließlich leere Platzhalter.
