# Qualitäts-Gates und Teststrategie

## Pipeline-Gates

| Bereich           | Gate                                                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Statische Prüfung | ESLint, TypeScript `strict`, Architekturregeln (`dependency-cruiser`/ESLint-Boundaries)                                           |
| Testabdeckung     | Mindestens 80 % neuer Code, 70 % gesamt und 90 % Domain-Logik                                                                     |
| SonarQube         | Maintainability Rating A, Duplikation < 3 %, zyklomatische Komplexität ≤ 10; Quality Gate muss erfolgreich sein                   |
| Abhängigkeiten    | `npm audit` ohne kritische/hohe Schwachstellen; Renovate-PRs mit Lockfile                                                         |
| Lizenz            | Je Release ausschließlich MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause oder ISC; unbekannte/nicht freigegebene Lizenzen blockieren |
| Barrierefreiheit  | axe in E2E ohne kritische Findings; manuelle WCAG-2.2-AA-Prüfung je Sprint                                                        |
| Lighthouse mobil  | Performance ≥ 90; LCP ≤ 2,5 s; INP ≤ 200 ms; CLS ≤ 0,1; TTFB ≤ 600 ms                                                             |
| Budgets           | JavaScript initial ≤ 170 KB gzip je Route; Hero-Bild ≤ 200 KB; Bundle-Analyzer-Report pro Release prüfen                          |
| Teststabilität    | Flaky-Quote < 1 %; keine festen `sleep`-Zeiten; Wiederholungen dürfen Fehler nicht verdecken                                      |

Die maschinenlesbaren Lighthouse-Budgets liegen in
[`lighthouserc.cjs`](../../lighthouserc.cjs) und
[`lighthouse-budget.json`](../../lighthouse-budget.json). Die Grenzwerte für
SonarQube sind im SonarQube-Projekt als Quality Gate anzulegen und vor Merge
gegen einen realen Scan zu verifizieren. JavaScript gzip je Route und die Größe
des einzelnen Hero-Assets werden zusätzlich mit dem Next.js Bundle-Analyzer
bzw. im Build-Report geprüft; beide Werte dürfen nicht aus einem Gesamtbudget
abgeleitet werden.

## Testpyramide

Orientierungsverteilung: 60 % Unit-Tests (Vitest), 30 % Komponenten- und
Integrationstests (Testing Library, MSW; Datenbank gegen Neon-Branch oder
lokales Postgres), 10 % E2E/UI (Playwright). Der Contract-Test prüft OpenAPI
und/oder Pact für CMS- und Fachsystemgrenzen. Testdaten sind synthetisch oder
anonymisiert.

Playwright läuft in Chromium, Firefox und WebKit. PR-Preview prüft eine
Chromium-Smoke-Suite; Staging führt die vollständige E2E-, axe- und
Visual-Regression-Suite aus. Auth-E2E bleibt offen, bis Neon Auth samt
Non-Prod-Branch durch die Anwendungsteams integriert ist. Sie darf nur gegen
Non-Prod laufen und muss Testkonten eindeutig anlegen und bereinigen. Tests
verwenden Rollen-/Label-Selektoren vor
`data-testid`, eindeutige Testkonten und räumen Nutzer, Sitzungen und Daten
nach dem Test auf. Auth-Testkonten dürfen ausschließlich im Non-Prod-Projekt
angelegt werden. Neon Auth ist Beta: SDK-Updates nur über PR und vollständige
Auth-E2E-Suite.

Die sechs verpflichtenden Smoke-Journeys (Dok. 06, Kap. 2.1) sind:

1. Startseite laden und Hauptmenü öffnen; Modell auswählen.
2. Modelle filtern/sortieren, URL teilen und Zustand wiederherstellen.
3. Fahrzeug mit Motor, Farbe und Felgen konfigurieren; Preis prüfen und
   Konfiguration teilen.
4. Händler finden und Probefahrt anfragen; Happy Path und Validierungsfehler.
5. Cookie-Einwilligung ablehnen und nachweisen, dass keine Tracking-Requests
   ausgelöst werden.
6. Zwischen de-DE und en-GB wechseln; hreflang und Canonical prüfen.

Visual Regression speichert Baselines nur aus freigegebenen Staging-Builds;
Änderungen an Baselines benötigen Review. Flaky-Tests werden als Findings
klassifiziert, nicht durch feste Wartezeiten oder unbegrenzte Retries kaschiert.

## Last- und Performanceprüfung

Das k6-Skript [`cached-pages.js`](../../scripts/performance/cached-pages.js)
zielt auf 500 Requests/s für eine ausdrücklich konfigurierte, CDN-gecachte
Seite; damit wird kein Pod-Durchsatz simuliert. Lasttests laufen ausschließlich
gegen Staging. Vor Aktivierung des CI-Gates muss QA/DevOps die aktuellen
Lasttest-, Zeitfenster- und Kosten-Vorgaben von Vercel und Neon bestätigen und
`LOAD_TEST_AUTHORIZED=true` setzen. Ohne Anbieterfreigabe bleibt dieses Gate
bewusst deaktiviert.

## Release-Nachweise

Pro Release werden Lizenzreport, CycloneDX-SBOM, SonarQube-Status,
Lighthouse-Bericht, Playwright-Berichte, Security-Scans und das Ergebnis der
Smoke-Journeys als Artefakte aufbewahrt. `npm run analyze` (Next.js
Bundle-Analyzer) wird für das Release-Review benötigt; die Anwendung und ihre
Build-Skripte sind im aktuellen Repository noch nicht vollständig vorhanden.

## Integrationsstatus

Das Repository enthält derzeit noch keine vollständige Test- und
API-Spezifikation. Die Pipeline-Aufrufe sind daher Integrationsschnittstellen
und müssen mit den Scripts und Testfällen der Anwendung verbunden und
erfolgreich ausgeführt werden. OpenAPI-/Pact-Contract-Tests sind noch nicht
ausführbar, da keine API-Verträge vorliegen; die Anwendungsteams müssen sie
nach Bereitstellung der Verträge in CI verdrahten. Dieses Infrastrukturpaket
ändert keine Produkt-, Schema-, Auth- oder UI-Implementierung.

Lokale Prüfung dieses Stands: TypeScript und Architekturprüfung bestehen; die
7 vorhandenen Domain-Tests laufen, erreichen aber die Coverage-Schwellen nicht
(6,48 % Gesamt-Coverage; 76,08 % Domain-Line-Coverage). Der vollständige
ESLint-Lauf bleibt wegen Import-/Typimport-Verstößen in App- und
Anwendungstestdateien offen; die neuen E2E-, Infrastruktur- und Skriptdateien
bestehen den gezielten ESLint-Lauf. `npm audit --audit-level=high` besteht;
vier moderate Findings in der Drizzle-Kit-Entwicklungsabhängigkeit sind in der
[`OWASP-Matrix`](../security/owasp-matrix.md) erfasst. Playwright-Testsuche
findet 27 Fälle, die Browser-E2E-Ausführung und freigegebene Visual-Baselines
benötigen weiterhin Staging-Zugang und Browserinstallation.
