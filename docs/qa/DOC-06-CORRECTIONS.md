# Korrekturen zu BAV-QA-006

Dokument 06 (BAV-QA-006, Version 1.0 vom 21.10.2026) beschreibt teilweise noch
die überholte Docker-/Kubernetes-Zielplattform. Für Delivery, Tests und Betrieb
gelten vorrangig BAV-DO-005, BAV-PM-001 und BAV-AR-003, jeweils Version 1.1
vom 28.10.2026. Diese Tabelle ersetzt die betroffenen Aussagen; sie ist
zusammen mit den übrigen, nicht widersprüchlichen Qualitätsvorgaben aus Dok. 06
zu lesen.

| Stelle in Dok. 06 → überholt weil → neue Vorgabe |
|---|
| Kapitel 2.1, Integrationstests mit „Testcontainers“ → die Ziel-Datenbank ist Neon Postgres und im Betrieb gibt es keine Containerplattform → Tests laufen gegen einen isolierten Neon-Branch mit synthetischen/anonymisierten Daten oder gegen lokales Postgres. |
| Kapitel 3, „500 req/s je Pod“ → Pods und deren Skalierung entfallen; Vercel liefert gecachte Seiten über CDN und skaliert Functions plattformseitig → Lastziel: 500 req/s auf gecachten Seiten. Vor Lasttests sind die geltenden Anbietervorgaben und das vereinbarte Testfenster zu prüfen. |
| Kapitel 6.1, A02/A03 und Kapitel 6.3, „gehärtete Container“, Pod Security Standards, kube-bench, Container-Ausbruch, Non-root/Seccomp, Image-Scan und signierte Images → es gibt keine produktiven Container oder Kubernetes-Pods → Plattformschutz durch Vercel-WAF, Deployment Protection, Skew Protection sowie Vercel-Teamrollen mit verpflichtendem 2FA/SSO; Anwendung/Lieferkette mit CodeQL, SCA, Secrets-Scan, CycloneDX-SBOM und auf Commit-SHAs gepinnten GitHub Actions absichern. |
| Kapitel 6.1 A03, Image-Signaturen und Image-Scan → kein eigenes Betriebs-Image wird gebaut oder ausgerollt → Lockfile, SCA, Lizenzprüfung, SBOM je Release und gepinnte Actions sind die relevanten Lieferketten-Gates. |
| Kapitel 6.1 A04 und Sicherheitskapitel, „Secrets im Vault“ → die freigegebene Konfigurationsquelle ist Vercel → Geheimnisse ausschließlich als Vercel Environment Variables mit Kennzeichnung „Sensitive“ pflegen; pro Umgebung eigene Werte, niemals `NEXT_PUBLIC_*`, nie im Repository und Rotation alle 90 Tage. |
| Kapitel 6.1 A05, parametrisierte Queries mit „Prisma“ → die Architekturentscheidung ADR-0008 setzt Drizzle ORM statt Prisma fest → Eingaben an jeder Grenze validieren und parametrisierte Datenbankabfragen über Drizzle verwenden. |
| Kapitel 6.1 A07, „OIDC statt Eigenbau“ → Authentifizierung ist auf Neon Auth (verwaltetes Better Auth, Beta) festgelegt → Neon Auth je Branch/Umgebung aktivieren, SDK-Version pinnen und Updates nur nach PR mit vollständiger Auth-E2E-Suite. Serverseitige Autorisierung bleibt erforderlich. |
| Kapitel 6.3, Elevation of Privilege durch „Container-Ausbruch“ → Container sind keine Komponente der Zielarchitektur → STRIDE auf Vercel, Neon, GitHub und deren Vertrauensgrenzen ausrichten; Least-Privilege-Rollen, geschützte Deployments, getrennte Datenbankprojekte und geschützte Secrets prüfen. |
| Kapitel 6.1/6.3, Container-Härtung als Sicherheitsnachweis → die Anwendungs- und Plattformgrenzen haben sich mit Vercel/Neon geändert → Sicherheitsnachweise an der tatsächlichen Implementierung und Plattform erheben, nicht an nicht eingesetzten Containern. |
| Kapitel 2.1, Datenbanktests ausschließlich mit Container-Testumgebung → Produktion verwendet Neon; lokale Container sind nur optional für Offline-Entwicklung → Integrationstests gegen Neon-Branches oder lokales Postgres ausführen; Preview- und Staging-Datenbanken dürfen ausschließlich synthetische/anonymisierte Daten enthalten. |

Die Fehlerklassifizierung S1–S4, Datenschutzvorgaben, Performance-Budgets,
Testpyramide, Smoke-Journeys und Go-Live-Prüfpunkte aus Dok. 06 bleiben gültig,
sofern sie den neueren Vorgaben nicht widersprechen.
