# Architekturübersicht

Die Anwendung ist ein modularer Monolith auf Next.js 16 mit App Router und React 19. Serverseitige
Komponenten sind der Standard; Client Components bleiben auf interaktive Blattknoten beschränkt.
Öffentliche Seiten sind unter `/de-de` und `/en-gb` erreichbar. Der next-intl-Proxy übernimmt
ausschließlich Locale-Routing und Security-Header; er trifft keine Authentifizierungs- oder
Autorisierungsentscheidungen.

## Schichten und Ablageorte

| Schicht                 | Ablageort                                | Verantwortung                                           |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------- |
| Presentation            | `src/app/`                               | Route-Komposition, Layouts, Metadaten und Route Handler |
| Feature                 | `src/features/<fach>/`                   | Fachmodule, Queries, Actions und Schemas                |
| Shared UI               | `src/components/`                        | Wiederverwendbare Präsentationskomponenten              |
| Domain                  | `src/domain/`                            | Frameworkfreie Regeln, Typen, Fehler und Ports          |
| Infrastructure          | `src/infrastructure/`                    | Adapter, Logging, HTTP und technische Integrationen     |
| Shared application code | `src/lib/`                               | Umgebungsvalidierung, i18n und allgemeine Utilities     |
| Messages / styles       | `src/messages/`, `src/styles/`           | Sprachkataloge und Design-Tokens                        |
| Runtime hooks           | `src/instrumentation.ts`, `src/proxy.ts` | OpenTelemetry sowie Locale- und Header-Verarbeitung     |

`src/app/[locale]/layout.tsx` ist das Root-Layout für lokalisierte Seiten. Die vorhandenen,
nicht lokalisierten Anmeldungs-Platzhalter liegen in der Route-Gruppe `src/app/(auth)/`. Der
Proxy führt für `/api/*` und `/auth/*` kein Locale-Routing aus; Security-Header werden weiterhin
gesetzt.

## Importregeln

- Die App-Schicht darf Features, Components, Domain und Lib komponieren; sie importiert keine
  Infrastructure-Implementierungen.
- Feature-Module importieren einander nicht. Gemeinsame fachliche Verträge liegen in `domain/`;
  Navigation und Ereignisse verwenden URL beziehungsweise Events.
- Domain-Code importiert weder React noch Next.js und enthält keine Framework- oder UI-Abhängigkeit.
- Infrastructure hängt von Domain-Ports ab und implementiert diese. Route- und Feature-Code hängt
  nicht von konkreten Infrastructure-Adaptern ab.
- Relative Imports sind auf das jeweilige Feature begrenzt; fachübergreifende Imports verwenden
  den Alias `@/`.

Dependency-cruiser prüft Zyklen, Layer-Richtung und Frameworkfreiheit der Domain. ESLint flat
config ergänzt die Import- und Feature-Grenzen. Beide Prüfungen laufen mit `npm run arch:check`
beziehungsweise `npm run lint`.

## Erweiterungspunkte

- `domain/auth/auth.port.ts` definiert den technologieunabhängigen Auth-Vertrag. Eine Neon-Auth-
  Implementierung gehört ausschließlich in einen späteren Infrastructure-Adapter.
- Saved-Configuration-, Lead- und CMS-Zugriffe werden über Ports im Domain-Layer abstrahiert.
- `src/infrastructure/http/problem-details.ts` erzeugt RFC-9457-Fehlerantworten.
- Die Health-Route ist ein Verfügbarkeits-Platzhalter; Datenbank-Prüfungen werden später ergänzt.
- Locale-Nachrichten liegen in `src/messages/de.json` und `src/messages/en.json`. Metadaten und
  Sitemap enthalten Locale-Alternativen; neue übersetzte Routen ergänzen ihre eigenen Metadaten.

Details zu den verbindlichen Entscheidungen stehen in `docs/adr/`.
