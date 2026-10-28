# Annahmen und Abgrenzungen

## Laufzeit und Routing

- Die lokalisierten Routen bilden mit `src/app/[locale]/layout.tsx` den Next.js-Root-Layout. Das
  Middleware-Proxy leitet `/` anhand der next-intl-Konfiguration auf die Standardsprache um.
- Die bereits vorhandenen, nicht lokalisierten Anmeldungs-Platzhalter liegen in einer eigenen
  Route-Gruppe mit separatem Root-Layout. Sie enthalten keine Authentifizierungslogik.
- Optionale Umgebungsvariablen dürfen in `.env.local` leer sein. Leere Werte werden wie nicht
  gesetzte Werte behandelt, damit Entwickler ohne Neon-, CMS- oder Sentry-Zugang starten können.
- `APP_BASE_URL` fällt lokal auf `http://localhost:3000` zurück; die Standardsprache ist `de-de`.

## Infrastruktur und vorhandene Arbeit

- Die im Arbeitsverzeichnis bereits vorhandenen Routen, UI-Elemente, Mock-Daten und Plattformdateien
  bleiben erhalten. Das Grundgerüst ergänzt sie, statt bestehende Feature-Arbeit zu ersetzen.
- Die Health-Route prüft ausschließlich die Erreichbarkeit der Anwendung. Ein Datenbank-Check,
  Migrationsschema, Neon-Auth-Adapter und Seed-Daten bleiben dem Backend-Agent vorbehalten.
- `db:*`-Befehle sind als Werkzeuge eingerichtet; produktive Datenbankoperationen sind ohne
  freigegebene Verbindungsvariablen und Backend-Schema nicht ausführbar.
- Die vorhandene Schriftdeklaration verwendet Inter, sofern die Laufzeitumgebung die Schrift
  bereitstellt. Eine Schriftdatei wird wegen der vorgegebenen Lizenz-Allowlist nicht eingebettet.
- Die Kartenanbieter-Entscheidung bleibt gemäß ADR-0007 offen.

## Dokumentations- und Lieferumfang

- ADR-0001 bis ADR-0010 übernehmen Entscheidungen und Status aus BAV-AR-003 v1.1. ADR-0007 bleibt
  ausdrücklich offen.
- Deployment-Workflows und Vercel-/Neon-Betriebsdateien, die bereits vorhanden waren, werden nicht
  neu erzeugt oder fachlich umgebaut.
- Docker und Kubernetes werden nicht als Laufzeit- oder CI-Plattform eingeführt.

## Feature-Integration und Stubs

- Zu Beginn der Feature-Arbeit enthielt das Repository nur `LICENSE`. Parallel gelieferte Foundation-
  Dateien (next-intl, CMS-Port/Mock, Plattformkonfiguration und Auth-Layout) wurden anschließend
  übernommen und nicht ersetzt.
- Da kein Backend-Schema, Neon-Zugang oder Neon-Auth-Adapter vorhanden ist, arbeiten Modelle,
  Händler, Leads und Preise mit synthetischen Adapterdaten. Die Konto-Route leitet zur klar
  gekennzeichneten Anmeldungs-Platzhalterseite weiter; eine lokale Kontodemo wird nicht als
  nutzergebundene Speicherung ausgegeben. Lead-Einsendungen werden nicht persistiert und es wird
  keine E-Mail versendet.
- Der Händlerkartenbereich ist eine synchronisierte Platzhalterkarte. OP-01 bleibt offen; bis zur
  Freigabe wird MapLibre mit OpenStreetMap als Zielannahme geführt, ohne Kartenbibliothek oder
  echte Geokoordinaten einzubinden.
- Die Fahrzeugillustrationen unter `public/media/` sind selbst erstellte SVGs. Es werden keine
  Originalmarken-Assets, Herstellerdaten oder Drittanbieterbilder verwendet.
- Das Hero nutzt ein priorisiertes statisches SVG. Ein Video-Asset liegt nicht vor; FR-HOME-002 ist
  deshalb offen und wird nicht durch ein leeres oder nicht abspielbares Video vorgetäuscht.
- Consent speichert notwendige/Statistik/Marketing-Auswahl für 183 Tage. Eine externe Analytics-
  Integration ist nicht konfiguriert; `track()` prüft Zustimmung und gibt ausschließlich erlaubte,
  nicht personenbezogene Parameter als lokales Event aus.
- Der Preis-Route-Handler verifiziert synthetische Optionspreise und Regelkompatibilität serverseitig.
  Für den Produktivbetrieb muss die Preisquelle aus der freigegebenen Fahrzeug-/Options-API kommen.
- Die Implementierungsabdeckung und bekannte Abweichungen sind in `docs/TRACEABILITY.md`
  dokumentiert. Keine Drizzle-Schemata oder Migrationen wurden geändert.

## Offene Projektentscheidungen

- OP-01: Kartenanbieter bleibt offen; MapLibre/OSM ist die dokumentierte Annahme.
- OP-02: Mock-Umfang ist auf acht Fantasiemodelle begrenzt; PO-Freigabe/Variantenliste ausstehend.
- OP-03: Analytics-/Consent-Management-Anbieter nicht festgelegt; nur lokaler Consent- und Tracking-
  Stub vorhanden.
- OP-04: Neon Auth Beta, Social Login, MFA und E-Mail-Absender sind nicht konfiguriert.
- OP-05: CMS-SaaS vs. JSON-Mock ist nicht entschieden; aktueller Adapter liefert synthetische Daten.
