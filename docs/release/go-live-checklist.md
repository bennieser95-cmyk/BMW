# Go-Live-Checkliste – Release Readiness

Status gilt für den aktuell vorliegenden Repository-Stand. `Offen` bedeutet,
dass ein Dokument oder eine Konfiguration allein den erforderlichen
Produktionsnachweis nicht ersetzt.

| Nr. | Prüfpunkt (Dok. 06, Kap. 8)                                                 | Verantwortlich | Ist-Status                                                                                                         | Nachweis-Link                                                             |
| --: | --------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
|   1 | Alle MUST-Anforderungen abgenommen; keine offenen S1/S2-Fehler              | PO, QA         | **Offen** – Anwendung, Abnahme und vollständiger Fehlerbestand fehlen; Workflow-S1 erfordert GitHub-Freigaberegeln | [`OWASP-Matrix`](../security/owasp-matrix.md)                             |
|   2 | Lighthouse-/Web-Vitals-Budgets auf Staging erreicht                         | Tech Lead      | **Offen** – Budgets konfiguriert, echter Staging-Lauf fehlt                                                        | [`Qualitäts-Gates`](../qa/quality-gates.md)                               |
|   3 | A11y-Audit abgeschlossen und Erklärung zur Barrierefreiheit erstellt        | QA, UX         | **Offen** – Template liegt vor, manuelle Prüfung/Erklärung fehlen                                                  | [`Barrierefreiheit`](../compliance/barrierefreiheit.md)                   |
|   4 | Security-Scans ohne kritische/hohe Funde; Penetrationstest-Findings behoben | Security       | **Offen** – Workflow/Matrizen vorhanden, Scanresultate und Penetrationstestnachweis fehlen                         | [`OWASP-Matrix`](../security/owasp-matrix.md)                             |
|   5 | Lasttest bestanden (NFR-SCL-001: 500 req/s auf gecachten Seiten)            | DevOps         | **Offen** – vor Aktivierung Anbieterfreigabe und dokumentiertes Testfenster nötig                                  | [`Plan-Check`](../ops/plan-check.md)                                      |
|   6 | Monitoring, Alarme, Runbooks und On-Call-Plan aktiv                         | DevOps         | **Offen** – Runbooks/Alarmkatalog vorhanden, Plattformalarme und On-Call nicht nachgewiesen                        | [`Observability`](../ops/observability.md)                                |
|   7 | Backup/Restore getestet und Rollback geübt                                  | DevOps         | **Offen** – Runbook vorhanden, Restore-Test und Rollback-Übung mit Zeitwerten fehlen                               | [`Restore-Runbook`](../runbooks/restore-neon-branch.md)                   |
|   8 | Datenschutz: Consent, Datenschutzerklärung und AV-Verträge geprüft          | DPO            | **Offen** – Templates vorhanden, DPO-/Legal-Freigabe fehlt                                                         | [`Compliance-Artefakte`](../compliance/av-vertraege-drittlandtransfer.md) |
|   9 | Dokumentation und Übergabe-Workshop abgeschlossen                           | Delivery Lead  | **Offen** – Infrastruktur-/Betriebsdokumentation erstellt, Workshop/Übergabeprotokoll ausstehend                   | [`Vercel-/Neon-Setup`](../ops/vercel-neon-setup.md)                       |
|  10 | Formale Abnahme unterzeichnet                                               | PO, Sponsor    | **Offen** – Unterschrift/Abnahmeprotokoll ausstehend                                                               | `[Abnahmeprotokoll nachtragen]`                                           |

## Fehlerklassifizierung

| Stufe       | Definition                                   | Reaktion                 | Behebung         |
| ----------- | -------------------------------------------- | ------------------------ | ---------------- |
| S1 Kritisch | Ausfall, Datenverlust oder Sicherheitslücke  | Sofort, Incident-Prozess | Hotfix ≤ 24 h    |
| S2 Hoch     | Kernfunktion eingeschränkt, kein Workaround  | ≤ 4 h                    | Aktueller Sprint |
| S3 Mittel   | Funktion eingeschränkt, Workaround vorhanden | ≤ 1 Arbeitstag           | Nächster Sprint  |
| S4 Niedrig  | Kosmetisch, geringe Auswirkung               | Planung im Refinement    | Backlog          |

Keine Go-Live-Freigabe, solange offene S1/S2-Findings, fehlende
Umgebungsfreigaben, ungeprüfte Datenschutz-/Vertragsfragen oder nicht
nachgewiesene Restore-/Rollback-Fähigkeit bestehen.
