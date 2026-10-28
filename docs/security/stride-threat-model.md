# STRIDE-Threat-Model – Vercel und Neon

## Vertrauensgrenzen

Browser/Nutzer → Vercel CDN/WAF/Deployment Protection → Vercel Functions
(Next.js/BFF) → Neon Auth und Neon Postgres; zusätzlich GitHub Actions →
Vercel Deploy API/Neon Migration sowie CMS/E-Mail/Analytics als externe
Dienstleister. Preview/Staging sind getrennte, nicht-produktive Umgebungen und
dürfen keine Produktionsdaten oder Produktionssecrets erhalten.

| STRIDE | Bedrohung im Zielbetrieb | Gegenmaßnahme und Nachweis |
|---|---|---|
| Spoofing | Gestohlene/gefälschte Session, missbrauchter Deployment- oder CMS-Webhook | Neon Auth, sichere Cookies, Domain-/Redirect-Allowlist, HMAC plus Replay-Schutz wo Webhooks eingesetzt werden; Auth-E2E und Webhook-Tests |
| Tampering | Manipulierte Preis-/Lead-/Konfigurationsdaten oder veränderte Produktionsmigration | Serverberechnung und Zod-Grenzvalidierung; Drizzle-parametrisierte Queries; geschützte Tags, Code-Review, forward-only Expand-Contract; Migration vor Deployment |
| Repudiation | Deployment, Migration oder Consent-Aktion kann nicht nachvollzogen werden | GitHub-/Vercel-/Neon-Audit-Nachweise nach Planverfügbarkeit prüfen; Consent-Version/-Zeitpunkt ohne unnötige PII; Alarm-/Incident-Timeline |
| Information Disclosure | Produktionsdaten in Previews, PII in Logs, offengelegte Secrets | Neon-Integration ausschließlich im Non-Prod-Projekt; Vercel Sensitive-Variablen je Umgebung; synthetische Seeds; Log-Maskierung; Gitleaks |
| Denial of Service | Missbrauch von Auth-/Lead-Routen, kostenintensive DB-Queries oder Cache-Bypass | Vercel-WAF/Bot-Schutz und Rate Limits `/api/auth`, `/api/v1/leads`; Request-Limits, CDN/ISR, Pooler, Metrik-/Kostenalarme |
| Elevation of Privilege | Überprivilegierter Vercel-/Neon-Operator oder GitHub-Job mit Produktionszugriff | Least Privilege, 2FA/SSO, getrennte Projekte/Rollen; Production-Environment mit Required Reviewers; geschützte Tags; Laufzeitrolle ohne DDL, Migration separat |

## Restrisiken / Nachweise

- Vercel WAF, Deployment Protection, Skew Protection, Team-2FA/SSO und
  Environment-Freigaben in der Konsole aktivieren und screenshot-/auditfähig
  dokumentieren.
- Neon Produktions- und Non-Prod-Projekte getrennt verifizieren. Preview-
  Datenbankverbindung darf technisch nicht auf das Prod-Projekt zeigen.
- GitHub `production` Environment und Tag-Ruleset konfigurieren, bevor ein
  Tag-Release zugelassen wird.
- Vercel/Neon-Vertrags-, Support-, Audit- und Datenstandortdetails im
  [`plan-check.md`](../ops/plan-check.md) mit Anbieterunterlagen abschließen.
