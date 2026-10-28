# Checkliste: Auftragsverarbeitung und Drittlandtransfer

Vor Produktivbetrieb je Dienstleister durch Datenschutz/Einkauf/Legal
ausfüllen. EU-Rechenzentrumsregion allein belegt weder vollständige
Datenresidenz noch das Fehlen von Drittlandzugriffen.

| Anbieter / Kategorie | Region laut Zielarchitektur | AV-Vertrag / DPA | Subprozessoren | Drittland-/Supportzugriff | Transfermechanismus/TIA | Freigabe |
|---|---|---|---|---|---|---|
| Vercel Hosting/CDN/Functions | Function-Region `fra1` | Offen – Anbieter prüfen | Offen – aktuelle Liste prüfen | Offen – Zugriff/Support prüfen | Offen – Legal bewerten | Offen |
| Neon Postgres/Neon Auth | AWS `eu-central-1` | Offen – Anbieter prüfen | Offen – aktuelle Liste prüfen | Offen – Zugriff/Support prüfen | Offen – Legal bewerten | Offen |
| E-Mail-Anbieter | Anbieter/Region festzulegen | Offen | Offen | Offen | Offen | Offen |
| Analytics/RUM/Sentry | Anbieter/Region festzulegen; nur nach Consent sofern erforderlich | Offen | Offen | Offen | Offen | Offen |

Prüfen: Vertragspartei und Rollen, Datenarten/Zwecke, TOMs,
Vertraulichkeit, Weisungen, Unterstützung bei Betroffenenrechten/Incidents,
Löschung/Rückgabe, Unterauftragsverarbeiter, Audit-/Nachweisrechte,
Verarbeitungsorte, Supportzugriffe, Standardvertragsklauseln/TIA und
Änderungsbenachrichtigungen. Keine Freigabe allein aufgrund der
Regionseinstellung.
