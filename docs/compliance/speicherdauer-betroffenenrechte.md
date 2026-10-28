# Speicherdauer und Betroffenenrechte

## Speicher- und Löschfristen

| Datenart                   | Zielvorgabe                                   | Technischer Nachweis / Owner                                                                           |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Leads / Probefahrtanfragen | Automatische Löschung nach 90 Tagen           | Cron `/api/cron/purge-leads`, Alarm bei Fehlschlag; Fachbereich/DPO bestätigt Berechnung und Ausnahmen |
| Anwendungs-/Zugriffslogs   | 30 Tage                                       | Vercel-/Sentry-/Log-Drain-Aufbewahrung je Anbieter verifizieren; PII vermeiden                         |
| Auth-Konten und Sessions   | Nach Zweck, Löschanfrage und Anbieterfunktion | Neon Auth-/Neon-Konsole und Löschpfad prüfen; Product/Datenschutz                                      |
| Consent-Nachweise          | Dauer nach freigegebenem Nachweiszweck        | DPO-Freigabe und minimal erforderliche Felder                                                          |
| Backups/Restore-Branches   | Anbieterfenster/planabhängig                  | Plan-/Restore-Fenster verifizieren; Ablauf/Überschreibung dokumentieren                                |

Löschung in Primärsystem, abgeleiteten Systemen und Ablauf von Backups getrennt
nachweisen. Preview-/Staging-Daten sind synthetisch/anonymisiert.

## Prozessvorlage Art. 15–17

1. Anfrage über den freigegebenen Kontaktkanal aufnehmen; Eingangsdatum und
   angefragte Rechte dokumentieren.
2. Identität risikogerecht prüfen, aber keine zusätzlichen Daten ohne Bedarf
   sammeln. Zugang und Anfrageinhalte beschränken.
3. Fachlich zuordnen: Konto/Auth, Leads, Consent, Logs und Empfänger/
   Auftragsverarbeiter. Datenquellen inventarisieren.
4. Auskunft, Berichtigung oder Löschung prüfen; gesetzliche Ausnahmen und
   Fristen durch Datenschutz/Legal bewerten. Keine eigenständige Rechts-
   interpretation durch Delivery.
5. Entscheidung/Freigabe dokumentieren, Maßnahme ausführen, betroffene
   Auftragsverarbeiter einbeziehen und Ergebnis sicher beantworten.
6. Bearbeitungsdauer, Ablehnungsgrund/Teilantwort und Nachweis protokollieren;
   anschließend Arbeitskopien sicher löschen.

**Fall-ID (pseudonym):** `[ ]` · **Eingang:** `[ ]` · **Zuständig:** `[ ]` ·
**Frist durch DPO bestätigt:** `[ ]` · **Abschluss/Nachweis:** `[ ]`
