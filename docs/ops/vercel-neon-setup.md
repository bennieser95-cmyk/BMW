# Vercel- und Neon-Setup

## Vercel-Projekt

`vercel.json` ist die verbindliche Projektkonfiguration: Next.js, `npm ci`,
`npm run build:vercel`, Function-Region `fra1`, automatische Git-Deployments
für `main` deaktiviert und Cron `/api/cron/purge-leads` täglich um 03:00 UTC.
`build:vercel` migriert ausschließlich Nicht-Produktions-Branches vor dem Build.
Die Produktionsmigration läuft separat im Tag-Release vor dem Build und ist
Expand-Contract/forward-only. Der Anwendungscode muss `build:vercel`,
`db:migrate` und den normalen `build`-Befehl bereitstellen.

Im Vercel-Dashboard einzurichten und nachzuweisen:

1. Framework Preset **Next.js**, Node.js `22.x` passend zu [`.nvmrc`](../../.nvmrc).
2. **Deployment Protection** für Preview und Custom Environment `staging`;
   Automation verwendet ausschließlich das jeweilige GitHub-Secret für den
   Vercel-Bypass-Header.
3. Custom Environment mit exakt dem Namen `staging`; Verfügbarkeit im
   gebuchten Plan beim Anbieter prüfen.
4. Produktions-Hauptdomain, `staging.<domain>` und automatische Preview-URLs.
   Die konkrete Domain darf nicht mit einer geschützten Drittmarke verwechselt
   werden.
5. Skew Protection aktivieren. Vercel-Teamrollen nach Least Privilege,
   verpflichtendes 2FA/SSO und regelmäßige Rezertifizierung.
6. WAF-Regeln mit Rate Limits für `/api/auth` und `/api/v1/leads`, Bot-Schutz
   auf Formularen und dokumentiertem Incident-Kontakt.
7. `main` nicht direkt durch die Git-Integration deployen. Staging und
   Produktion werden durch die freigegebenen Workflows gesteuert.

### Umgebungsvariablen-Matrix

Alle Werte in der Tabelle sind Platzhalter für die Konfiguration in Vercel;
keine Zugangsdaten oder Beispiel-Secrets ins Repository übernehmen. Vertrauliche
Werte in Vercel als **Sensitive** markieren. Es gibt keine `NEXT_PUBLIC_*`
Secrets. Jeder geheime Wert ist pro Umgebung eigenständig und wird nicht
wiederverwendet.

| Variable                        | LOCAL                                  | PREVIEW                   | STAGING                  | PRODUCTION                  |
| ------------------------------- | -------------------------------------- | ------------------------- | ------------------------ | --------------------------- |
| `DATABASE_URL` (gepoolt)        | Non-Prod `dev`                         | Non-Prod `preview/*`      | Non-Prod `staging`       | Prod-Projekt `main`         |
| `DATABASE_URL_UNPOOLED`         | Non-Prod `dev`                         | Non-Prod `preview/*`      | Non-Prod `staging`       | Prod-Projekt `main`         |
| `NEON_AUTH_BASE_URL`            | Auth `dev`                             | Auth des Preview-Branches | Auth `staging`           | Auth Prod `main`            |
| `NEON_AUTH_COOKIE_SECRET`       | eigener Sensitive-Wert                 | eigener Sensitive-Wert    | eigener Sensitive-Wert   | eigener Sensitive-Wert      |
| `CMS_API_URL` / `CMS_API_TOKEN` | Sandbox                                | Sandbox                   | Sandbox                  | Live, nur nach Freigabe     |
| `CRON_SECRET`                   | nicht gesetzt                          | nicht gesetzt             | eigener Sensitive-Wert   | eigener Sensitive-Wert      |
| `REVALIDATE_SECRET`             | eigener Sensitive-Wert, sofern genutzt | eigener Sensitive-Wert    | eigener Sensitive-Wert   | eigener Sensitive-Wert      |
| `SENTRY_DSN`                    | aus                                    | Preview-Projekt/Umgebung  | Staging-Projekt/Umgebung | Production-Projekt/Umgebung |
| `APP_BASE_URL`                  | `http://localhost:3000`                | Preview-Domain            | Staging-Domain           | Produktionsdomain           |
| `NEXT_PUBLIC_DEFAULT_LOCALE`    | `de-de`                                | `de-de`                   | `de-de`                  | `de-de`                     |

`DATABASE_URL` zeigt auf den Neon-Pooler; direkte Verbindungen sind auf
Migration/Wartung begrenzt. Werte werden über Vercel gepflegt und lokal mit
`vercel env pull .env.local` bezogen. `.env.local` ist ignoriert und darf nie
committet werden. Vercel CLI-Zugangsdaten für CI sowie der Neon-API-Key für das
manuell ausgelöste Setup liegen ausschließlich in den dafür vorgesehenen
GitHub Secrets bzw. der lokalen Secret-Verwaltung; sie sind keine
Anwendungskonfiguration. Die CI-Zielprüfung benötigt einen separaten
`VERCEL_READ_TOKEN` mit Leserechten sowie `VERCEL_ORG_ID` und
`VERCEL_PROJECT_ID`; diese Variablen müssen exakt zum Vercel-Projekt passen.
Das `VERCEL_TOKEN` für Releases bleibt getrennt und erhält nur die für
Deployment/Migration erforderlichen Rechte.

Für Deployment-Protection-Automation separate GitHub Secrets
`VERCEL_AUTOMATION_BYPASS_SECRET` (Preview),
`STAGING_AUTOMATION_BYPASS_SECRET` (Staging) und
`PRODUCTION_AUTOMATION_BYPASS_SECRET` (Production) einrichten. Nicht zwischen
Umgebungen wiederverwenden. Vor jedem Einsatz wird die Ziel-URL gegen den
erwarteten Projektslug bzw. Staging-Host und über die Vercel-API gegen
`VERCEL_PROJECT_ID` geprüft. Der hierfür verwendete Vercel-Token erhält nur
die erforderlichen Leserechte für Projekt/Deployment.
Browser-Gates setzen den Bypass-Header ausschließlich für Requests an den
validierten Ziel-Origin und verwenden anschließend das Vercel-Bypass-Cookie;
der Header darf nicht als globaler Browser- oder Lighthouse-Header an
Drittanbieter-Hosts weitergereicht werden.

## Neon-Projekte und Branches

- **Prod-Projekt:** Default-Branch `main`; enthält ausschließlich
  Produktionsdaten.
- **Non-Prod-Projekt:** Default-Branch `main` wird einmalig mit ausschließlich
  synthetischen/anonymisierten Seed-Daten befüllt. Daraus entstehen `dev`,
  `staging` und automatische `preview/*`-Branches.
- Neon-Vercel-Integration ausschließlich mit dem **Non-Prod-Projekt**
  verbinden (ADR-0010). Für Produktions-Branches/Datenbank-URLs darf die
  Integration keine automatische Preview-Verknüpfung bereitstellen.
- Produktions-`DATABASE_URL` und `DATABASE_URL_UNPOOLED` manuell der Vercel
  Production-Umgebung aus dem Prod-Projekt zuordnen. Diese Zuordnung vor dem
  ersten Release durch zwei Personen gegenprüfen.
- Preview-Branches werden mit ihrem Deployment isoliert und automatisch
  bereinigt; konkrete Lösch-/Aufbewahrungseinstellungen beim Anbieter prüfen.
- [`setup-nonprod-branches.sh`](../../scripts/neon/setup-nonprod-branches.sh)
  prüft `dev` und `staging` im Non-Prod-Projekt und kann diese nach explizitem
  `CREATE_BRANCHES=true` aus dessen Default-Branch anlegen. Das Skript nie mit
  der Prod-Projekt-ID ausführen.

## Neon Auth

Neon Auth im Neon-Dashboard für `dev`, `staging`, Prod `main` und die
automatisch erzeugten Preview-Branches getrennt aktivieren und
Provider-/Redirect-Domains der jeweiligen Umgebung eintragen. Prüfen, dass
Preview-Branches nur isolierte Non-Prod-Nutzer enthalten. Die Integration
liefert `NEON_AUTH_BASE_URL`; Cookie-Geheimnisse werden unabhängig generiert:

```sh
openssl rand -base64 32
```

Jeden Aufruf einzeln pro Umgebung ausführen, Ausgabe direkt als Sensitive
Environment Variable `NEON_AUTH_COOKIE_SECRET` in Vercel speichern und danach
nicht in Shell-Historie, Ticket oder Repo kopieren. Neon Auth ist Beta:
SDK-Version pinnen, Release Notes prüfen und Aktualisierungen nur über PR mit
vollständiger Auth-E2E-Suite. Testkonten ausschließlich in Non-Prod anlegen,
mit eindeutiger Test-ID versehen und nach dem Test löschen.

## Datenbankmigration und Rollback

Schemaänderungen folgen Expand-Contract: zunächst rückwärtskompatibel
hinzufügen, alte/neue Anwendungsversion gemeinsam unterstützen, erst später
ungenutzte Spalten/Strukturen entfernen. Produktionsmigrationen sind
forward-only und laufen vor dem Build/Deployment. Keine automatische oder
manuelle Rückwärtsmigration im App-Rollback. Ein Vercel-Rollback ändert die
Datenbank nicht; Datenwiederherstellung ausschließlich über den dokumentierten
Neon-Restore-Prozess.

## Secrets und Rotation

Alle Anwendungssecrets in Vercel als Sensitive, pro Umgebung getrennt,
niemals im Repository oder unter `NEXT_PUBLIC_*`. Vercel-/Neon-Operatorzugänge
auf minimale Rechte beschränken. Rotation alle 90 Tage nach
[`secret-rotation.md`](../runbooks/secret-rotation.md); Rotation mit
Smoke-Test und Widerruf des alten Werts abschließen.
