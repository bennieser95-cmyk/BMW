# Backend-Uebergabe: BAVARIA v1.1

## Status und verbindliche Schnittstellen

Die Anwendung verwendet die vorhandenen Domain-Ports fuer CMS, Authentifizierung,
Konfigurationen und Leads. Hinzu kommen AccountRepositoryPort, AccountIdentityPort
und SecurityPort. Die Domain bleibt unabhaengig von Next.js, Neon und Drizzle.
Die BFF-Komposition liegt in `src/lib/backend/services.ts`; Route Handler greifen
nicht direkt auf Infrastruktur zu.

Der maschinenlesbare Vertrag ist [openapi.json](./openapi.json). Er wird mit
`npm run api:generate` aus den Zod-Eingabe- und Antwortschemas erzeugt. Die
providerinternen Auth-Payloads verbleiben im gepinnten Neon-SDK; diese sind kein
zweiter, selbst implementierter Auth-Vertrag.

## Endpunkt -> Auth -> Schema -> Fehlerfaelle

Alle BFF-Fehler sind RFC 9457, `application/problem+json`, mit `traceId`;
Erfolgs- und Fehlerantworten sind `no-store`. Ungueltiges JSON ergibt 400,
unpassende Medien 415, ungueltige fachliche Eingaben 422, Koerper ueber 16 KiB
413 und nicht erreichbare Abhaengigkeiten 503. Interne Fehlermeldungen, PII
und Stacktraces werden weder ausgegeben noch geloggt.

| Methode / Endpunkt                      | Authentifizierung                                  | Zod-Schema                          | Wesentliche Fehler                                         |
| --------------------------------------- | -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| GET `/api/v1/models`                    | oeffentlich                                        | modelQuerySchema                    | 422 Filter/Pagination/duplizierte Query, 503 CMS           |
| GET `/api/v1/models/{slug}`             | oeffentlich                                        | slugSchema                          | 404 unbekannt, 422 Slug, 503 CMS                           |
| GET `/api/v1/models/{slug}/options`     | oeffentlich                                        | slugSchema                          | 404 unbekannt, 422 Slug, 503 CMS                           |
| POST `/api/v1/configurations/price`     | oeffentlich, ohne Schreibwirkung                   | priceRequestSchema                  | 404 Modell, 422 Optionen/Regeln/manipulierte Preisfelder   |
| GET `/api/v1/dealers`                   | oeffentlich                                        | dealerQuerySchema                   | 422 PLZ/Pagination, 503 CMS                                |
| POST `/api/v1/leads`                    | optional Sitzung; Origin + CSRF                    | leadSchema                          | 403 CSRF, 422 Consent/Honeypot/Referenzen/Datum, 429 Limit |
| GET `/api/v1/me/configurations`         | Sitzung + verifizierte E-Mail                      | paginationSchema.strict             | 401 Gast, 403 nicht verifiziert/in Loeschung               |
| POST `/api/v1/me/configurations`        | Sitzung + verifiziert + Origin/CSRF                | configurationSchema                 | 409 Maximum 20, 422 Code/Modell/Optionen                   |
| GET `/api/v1/me/configurations/{id}`    | Sitzung + verifiziert                              | idSchema                            | 404 fehlend **oder fremder Besitzer**                      |
| PATCH `/api/v1/me/configurations/{id}`  | Sitzung + verifiziert + Origin/CSRF                | idSchema, renameConfigurationSchema | 404 fehlend/fremd, 422 Name                                |
| DELETE `/api/v1/me/configurations/{id}` | Sitzung + verifiziert + Origin/CSRF                | idSchema                            | 404 fehlend/fremd                                          |
| GET `/api/v1/me/export`                 | Sitzung                                            | kein Eingabekoerper                 | 401 Gast, 403 ausstehende Loeschung, 503 DB                |
| DELETE `/api/v1/me`                     | Sitzung + Origin/CSRF, ggf. Passwort beim Provider | deleteAccountSchema                 | 403 erneute Auth erforderlich, 503 DB/Identity-Provider    |
| GET `/api/csrf`                         | oeffentlich, gleicher Ursprung                     | keine Eingabe                       | liefert Token + HttpOnly-Cookie                            |
| POST `/api/revalidate`                  | HMAC + Zeitstempel + persistente Einmaligkeit      | revalidationSchema                  | 401 Signatur/Alter, 409 Replay, 422 Tag                    |
| GET `/api/health`                       | oeffentlich                                        | keine Eingabe                       | 503 bei fehlender Konfiguration/fehlgeschlagenem SELECT 1  |
| GET `/api/cron/purge-leads`             | Bearer CRON_SECRET                                 | keine Eingabe                       | 401 Secret, 503 DB/Konfiguration                           |
| GET/POST `/api/auth/{path}`             | Neon-SDK; POST zusaetzlich Origin                  | Pfad + SDK-eigene Payload-Schemas   | 403 direkte delete-user-Anfrage/Origin; SDK-Authfehler     |

`userId` ist in keinem fachlichen Eingabeschema erlaubt. Alle Account-Zugriffe
stammen aus `AuthPort.getCurrentUser()`. Listen, Einzelzugriff, Umbenennung und
Loeschung sind nach Besitzer eingegrenzt; fremde IDs liefern keine Auskunft
darueber, ob das Objekt existiert.

### Drahtformate

- JSON: camelCase; Zeitangaben: ISO-8601 UTC; Geld: Ganzzahl-Cent + `currency`.
- Pagination: `page`, `pageSize` (1 bis 50), `totalCount` sowie die fachliche Liste.
- PLZ-Suche: exakter fuenfstelliger Wert; Geo-Koordinaten kommen als `geo.lat/lon`.
- Preisberechnung nimmt **keine Preise vom Browser** entgegen. Sie laedt das
  Modell und die Optionen serverseitig, loest Voraussetzungen auf und ruft die
  vorhandene Domain-Engine auf. Fehlende Voraussetzungen/Excludes sind 422.
- Konfigurationscode: vorhandenes Format `v1.<modelSlug>.<kommagetrennte IDs>`.
- Leads: `leadType`, Kontaktfelder, `consent: true`, `honeypot: ""`; Probefahrten
  brauchen zusaetzlich Modell, Haendler und ein nicht vergangenes ISO-Datum.

## Datenbankschema

Alle Anwendungstabellen liegen getrennt vom verwalteten Auth-Schema. Es gibt
keine Fremdschluessel und keine direkten Queries auf Neon-Auth-Tabellen.

| Tabelle              | Zweck / wichtige Spalten                                                                                               | Schutz                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| saved_configurations | UUID id; text user_id; model_slug; configuration_code; name; created_at timestamptz                                    | Besitzerpraedikate; User-Index; advisory lock + Maximum 20 |
| leads                | UUID id; type; model_slug/dealer_id/user_id optional; contact jsonb; requested_date; consent_at; created_at/updated_at | Type-CHECK; User-/Retention-Index; Loeschung nach 90 Tagen |
| rate_limits          | UUID id; eindeutiger HMAC-key; count; expires_at                                                                       | atomarer Upsert, keine IP im Klartext                      |
| webhook_receipts     | UUID id; eindeutiger digest; expires_at                                                                                | persistenter Replay-Schutz auch bei mehreren Instanzen     |
| account_deletions    | UUID id; eindeutiger HMAC-user_id; created_at; completed_at optional                                                   | Schreibsperre waehrend externer Identity-Loeschung         |

Die saved_configurations-Tabelle uebernimmt bewusst exakt die Referenz aus
Dokument 04 Kap. 7 und hat deshalb kein zusaetzliches updated_at.

Runtime: Neon HTTP fuer Einzelqueries; Neon WebSocket-Pool fuer Transaktionen.
Beide nutzen ausschliesslich den gepoolten DATABASE_URL mit `sslmode=require`.
Migrationen nutzen den direkten DATABASE_URL_UNPOOLED. Ein Pool wird nach jeder
Transaktion geschlossen. Verbindungs-/Query-/HTTP-Timeouts: zehn Sekunden.

### Konto-Loeschung und Konsistenz

1. Sitzung ermitteln; niemals eine Benutzerkennung vom Client uebernehmen.
2. Unter demselben transaktionalen User-Lock wie Konfigurations-/Lead-Schreiben
   eine pseudonyme Loeschsperre setzen und zugeordnete Konfigurationen/Leads entfernen.
3. Die verwaltete Identitaet ueber AccountIdentityPort / Neon-SDK loeschen.
4. Erst danach die Sperre als abgeschlossen markieren und Erfolg melden.

Ein Identity-Fehler wird explizit ausgegeben; es gibt keinen falschen Erfolg.
Anwendungsdaten koennen dann bereits geloescht sein. Die Sitzung darf den
Loeschvorgang wiederholen, aber keine neuen Daten anlegen. Nicht abgeschlossene
Sperren werden nicht automatisch entfernt: im Betrieb den Providerstatus
pruefen und den regulären Loeschendpunkt mit der Sitzung erneut ausfuehren.
Abgeschlossene HMAC-Sperren werden nach 24 Stunden durch den Cron entfernt,
um noch laufende authentifizierte Requests abzufangen.

Der Export umfasst die vom AuthPort verfuegbaren Profildaten und alle mit der
Sitzungskennung verknuepften Anwendungskonfigurationen/Leads. Nicht zuordenbare
Gast-Leads unterliegen der 90-Tage-Retention und werden nicht anhand einer
beliebigen, vom Client angegebenen E-Mail-Adresse fremden Accounts zugeordnet.
Providerinterne Sicherheitsdaten sind ueber dessen Datenschutzprozesse zu behandeln.

## Auth-Ablauf und Beta-Einschraenkungen

- Gepinnt: `@neondatabase/auth` **0.7.0-beta**.
- Server: lazy `createNeonAuth` mit Base-URL, Cookie-Secret, SameSite=Lax und
  deaktiviertem Session-Daten-Cache (`sessionDataTtl: 0`).
- Sicherheitskritische Autorisierung laedt die aktuelle Sitzung mit
  `disableCookieCache: true`. Upstream-Ausfaelle werden nicht als Gast maskiert.
- Geschaeftslogik nutzt nur AuthPort; der gesonderte AccountIdentityPort kapselt
  die externe Kontoloeschung und erlaubt spaeter einen Better-Auth-Adapter.
- Auth-Seiten liegen ohne Locale-Praefix unter `/auth/{path}`. Die bestehende
  Route Group `(auth)` bewahrt das separate Layout. Sprache und erlaubtes
  Ruecksprungziel werden serverseitig validiert.
- Sign-up -> E-Mail-OTP bestaetigen -> Konto. Der sechsstellige OTP entspricht
  der Standardkonfiguration des neu angelegten Neon-Auth-Projekts.
- Sign-in -> erlaubtes lokales Ruecksprungziel; nicht verifizierte Accounts
  werden im Konto-Layout und in jedem Account-Service erneut abgewiesen.
- Passwort vergessen -> generische Bestaetigung -> Reset-Link -> neues Passwort.
- Der Header liest den Status clientseitig; oeffentliche Marketing-Seiten
  laden keine Sitzung zum Rendern. Das Konto-Layout ist force-dynamic/Node.js.
- SDK-Cookies verwenden gemaess installierter Implementierung Secure, HttpOnly
  und SameSite=Lax; CSRF-Cookies sind HttpOnly, SameSite=Strict, unter HTTPS
  Secure mit __Host-Praefix. Keine Secrets werden an Client Components gegeben.

Die Beta liefert unvollstaendige generierte Typen fuer emailOtp-Methoden.
Die beiden OTP-Helper verwenden deshalb den dokumentierten SDK-Transport
`authClient.$fetch<unknown>` mit expliziten Pfaden und Zod-Pruefung der Antworten;
es gibt keinen unsicheren `any`-Cast und keinen eigenen Auth-HTTP-Client.

Die mitgelieferten Better-Auth-Abhaengigkeiten wurden auf **1.7.14** und Zod auf
**4.6.7** festgesetzt, um die bei der Installation gemeldeten High-/Critical-
Advisories zu vermeiden. Diese Overrides sind bei SDK-Upgrades mit AuthPort-
Contract-Tests und den realen Sign-in-/OTP-/Reset-/Delete-Flows zu pruefen.
Peer-Warnungen der Beta bleiben zu beobachten.

Die verwaltete Konfiguration muss im Neon-Dashboard geprueft werden:
Trusted Origins pro Umgebung, Verifikation bei Sign-up/Sign-in, Versand,
OTP-Laenge sechs und Ablauf, Passwort-Reset, Kontoloeschung und ggf. deaktivierte
ungenutzte OAuth-Anbieter. Ein standardmaessig vorhandener gemeinsamer
Google-Anbieter ist **kein** freigegebener Produktiv-Login.
Die App erzwingt verifizierte E-Mail unabhaengig von Provider-Defaults.

## Sicherheit und Betrieb

### CSRF

Vor schreibenden Custom-BFF-Requests `GET /api/csrf` aufrufen. Den JSON-Wert
`csrfToken` als `x-csrf-token` senden; Cookie wird same-origin automatisch
mitgesendet. Zusaetzlich muss der Origin exakt zu APP_BASE_URL passen.
Die Lead-Server-Action prueft den Origin und nutzt dieselbe Persistenz/
Rate-Limit-Pipeline; Next.js schuetzt die Action-Transportebene zusaetzlich.

### Rate Limit

Leads: fuenf Versuche pro zehn Minuten. Die DB entscheidet atomar; ein Ausfall
laesst keine unlimitierten Schreibvorgaenge zu. Nur auf Vercel wird dessen
ueberschriebener x-forwarded-for vertraut. Auf anderen Hosts teilen sich
Clients konservativ einen Bucket; fuer andere Proxys erst einen explizit
vertrauenswuerdigen, getesteten Adressadapter einfuehren.

### Revalidierung

`x-revalidate-timestamp`: Unixsekunden. `x-revalidate-signature`: Hex-HMAC-SHA256
ueber `<timestamp>.<unveraenderte JSON-Bytes>` mit REVALIDATE_SECRET.
Toleranz: plus/minus fuenf Minuten. Nach gueltiger Payload-Pruefung wird der
Digest fuer zehn Minuten einmalig in Postgres reserviert. Erlaubte Tags:
`content`, `models`, `model:<slug>`. Vergleich erfolgt zeitkonstant.
CMS-Fetches sind mit diesen Tags verknuepft.

### Retention

GET `/api/cron/purge-leads`, Header `Authorization: Bearer <CRON_SECRET>`.
Loescht Leads mit created_at **vor** jetzt minus 90 Tagen sowie abgelaufene
Rate-/Replay-Datensaetze und abgeschlossene Loeschsperren nach 24 Stunden.
Den Cron regelmaessig planen; seine Konfiguration gehoert Agent 5.

## Hinweise fuer Agent 4

- Unveraenderte reine Domain-Engine: applySelection, calculateTotalPrice;
  Optionen/Regeln werden nicht im BFF dupliziert.
- `catalog.models`, `model`, `options`, `price` stehen serverseitig zur Verfuegung.
- `accounts.list/find/create/rename/remove/exportData/deleteAccount` ermitteln
  ihre Identitaet selbst; keine userId-Parameter aus UI/Requests durchreichen.
- Browserzugriffe nutzen die oben beschriebenen BFF-Routen; keine DB-/Server-
  Imports in Client Components.
- Die bestehende Lead-Server-Action persistiert tatsaechlich; sie liefert keine
  simulierte Erfolgsantwort mehr.
- Acht synthetische Fantasiemodelle und drei Haendler liegen hinter CmsPort.
  Variantenzuordnungen und requires/excludes kommen aus den vorhandenen
  Domain-Optionen, ohne neue Preisregeln zu erfinden.

## Hinweise fuer Agent 5

### Umgebungsvariablen

Siehe [.env.example](../.env.example). Benoetigt:

- APP_BASE_URL: exakter Ursprung der Umgebung, wichtig fuer Origin-Pruefung.
- DATABASE_URL: gepoolte Runtime-Verbindung, DML-only Runtime-Rolle,
  `sslmode=require`.
- DATABASE_URL_UNPOOLED: direkter Endpunkt, getrennte Migrationsrolle mit DDL.
- NEON_AUTH_BASE_URL: branch-/datenbankspezifische Auth-URL.
- NEON_AUTH_COOKIE_SECRET: zufaellig, mindestens 32 Zeichen.
- RATE_LIMIT_SECRET: zufaellig, mindestens 32 Zeichen; stabil halten, da es
  Rate-Buckets und Loeschsperren pseudonymisiert.
- REVALIDATE_SECRET: HMAC-Webhook-Secret (nicht REVALIDATION_SECRET).
- CRON_SECRET: zufaelliges Bearer-Secret fuer Retention.
- Optional: CMS_API_URL/CMS_API_TOKEN, SENTRY_DSN, NEXT_PUBLIC_DEFAULT_LOCALE.

Secrets nur im Secret Store bzw. ignorierter lokaler .env.local speichern,
nicht in Dokumentation, Logs oder Chat kopieren.

### Migrationen und Seed

1. `npm run db:generate -- --name <beschreibung>`.
2. SQL und Snapshot-/Journal-Kette pruefen; nur vorwaerts, Expand-Contract.
3. `npm run db:migrate` mit direktem Migrationszugang.
4. `npm run db:seed` nur in Nicht-Produktion; ausschliesslich synthetische Daten.
5. `npm run lint`, `npm run typecheck`, `npm test` und Integrationschecks ausfuehren.

Die DB-Kommandos laden lokale .env/.env.local explizit ueber Node; bereits
gesetzte Prozessvariablen haben Vorrang. Node >=22.9 ist fuer diese
--env-file-if-exists-Kommandos erforderlich (empfohlen: aktuelle Node22/24).
`scripts/build-vercel.mjs` migriert Nicht-Produktion vor dem Build.
Produktionsmigrationen erfolgen gemaess bestehendem Release-Verfahren **vor**
dem Deploy, nicht als implizite destruktive Build-Aufgabe.

Anfangsmigration: 0000_add_showroom_persistence; additive Erweiterung:
0001_retain_deletion_guard (completed_at). Keine Anwendungsmigration veraendert
verwaltete Auth-Tabellen.

### Angelegte Entwicklungsumgebung

Mit ausdruecklicher Freigabe wurde `bavaria-showroom-dev`
(`young-night-35814714`) in Frankfurt, aws-eu-central-1, PostgreSQL17 angelegt.
Branch: `br-falling-feather-ba1io4g5`, Datenbank: `showroom`.
Auth-URL:
`https://ep-dark-hill-ba3ny13x.neonauth.c-8.eu-central-1.aws.neon.tech/showroom/auth`.

Beide Migrationen wurden auf diesem Branch ueber die interne Neon-Verbindung
transaktional angewendet. Das Drizzle-Journal enthaelt die SHA-256-Hashes der
unveraenderten lokalen SQL-Dateien und die lokalen Journal-Zeitstempel. Ein
spaeterer normaler `db:migrate`-Lauf kann diese Eintraege erkennen.
`showroom_runtime` ist als getrennte LOGIN-Rolle mit ausschliesslich
SELECT/INSERT/UPDATE/DELETE auf den fuenf Anwendungstabellen angelegt; CREATE
auf public ist nachweislich nicht erlaubt. Ein Passwort wurde nicht in SQL
gesetzt oder ausgegeben. Vor Runtime-Verwendung die Rollen-Credentials im
Neon-Dashboard einrichten und den gepoolten DATABASE_URL damit konfigurieren.

Die Integrationsschnittstelle redigiert Verbindungs-Credentials; lokale Werte
muessen deshalb aus dem Dashboard in .env.local uebernommen werden.
Die Accountstufe erlaubte keine Aenderung des Suspend-Intervalls; Compute kann
aktiv bleiben und Kosten erzeugen. Projekt-/Compute-Lebenszyklus ueberwachen.

## Verifikation und verbleibende Freigaben

Abschliessend erfolgreich ausgefuehrt:

- `npm run api:generate`: 15 Pfade, 19 Operationen.
- `npm run lint`, `npm run typecheck`.
- `npm test -- --maxWorkers=2`: **142 Tests in 35 Dateien bestanden**.
- `npm run arch:check`: keine Architekturverletzungen.
- `npm run build`: optimierter Next.js-Produktionsbuild erfolgreich.
- Produktionsserver-Smoke: Katalog/Pagination, serverseitiger Preis,
  Ablehnung manipulierter Preisfelder, CSRF-Cookie, expliziter Health-503 ohne
  lokale DB-Konfiguration und alle fuenf Auth-Seiten.
- Browser-Smoke: OTP-Eingabefeld und lokalisierte Bestaetigung nach simuliertem
  SDK-Versanderfolg; kein echter Mailversand.
- `npm audit --omit=dev --audit-level=moderate`: kein Moderate/High/Critical;
  sieben Low-Meldungen in der transitiven, hier nicht verwendeten Auth-UI/
  E-Mail-Rendering-Abhaengigkeitskette bleiben dokumentiert. Kein unkontrolliertes
  `npm audit fix --force` angewendet.

Der nur fuer die Smoke-Pruefung gestartete Produktionsserver wurde beendet.

Automatisierte Tests liegen neben den Services/Adaptern: AuthPort-Contract,
IDOR auf Service- und SQL-Praedikatsebene, Maximum20 unter Transaktions-Lock,
strikte Validierung, CSRF, HMAC/Alter/Replay, Rate-Limit-Grenze, Konto-Loeschung
mit Providerfehler/Retry, Health-/Cron-/BFF-Routen und MSW-CMS-Integration.

Diese isolierten Tests ersetzen keine providerseitige Abnahme: vor Produktion
echte Neon-Migration/HTTP-/WebSocket-Transaktion, Rollenrechte, Cookie-Attribute,
Mailzustellung, Sign-in, OTP, Reset, Reauthentifizierung/Kontoloeschung und
vollstaendigen Datenschutzexport gegen die reale Umgebung pruefen.

Zusaetzlich bestanden reale SQL-Checks im freigegebenen Entwicklungsbranch:
Besitzerpraedikate beim Lesen/Aendern/Loeschen, atomarer Lead-/Konfigurations-
Loeschablauf unter User-Lock, Erhalt fremder Daten, persistenter Rate-Zaehler
bis zum sechsten Versuch, doppelte Replay-Reservierung sowie 90-Tage-Retention.
Alle dabei angelegten synthetischen Testdaten wurden innerhalb derselben
Transaktion gezielt entfernt; die abschliessenden Restzaehler waren null.
Diese Checks liefen mit der Migrationsrolle, da die Runtime-Rolle noch keine
lokal verfuegbaren Credentials hat. Sie pruefen SQL/Persistenz, **nicht** den
lokalen Neon-HTTP-/WebSocket-Treiber oder reale Auth-Mail-Flows.

Die vom Nutzer genannte .env.local war bei der Shell-Pruefung nicht vorhanden;
es wurden keine Secrets in Ausgaben uebernommen. Die vollstaendige lokale
App-/Auth-Live-Abnahme bleibt deshalb bis zur tatsaechlich verfuegbaren
Umgebungskonfiguration offen.
