# Vorlage: VVT-Eintrag – Digital Showroom

**Arbeitsvorlage – vor Nutzung durch Datenschutzbeauftragte/n und
Verantwortliche freigeben.** Keine personenbezogenen Echtdaten in dieser
Vorlage ablegen.

| Feld                                  | Eintrag / offene Entscheidung                                                                                                                                               |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verantwortliche Stelle / Kontakt      | `[Organisation, Anschrift, Datenschutzkontakt]`                                                                                                                             |
| Fachlich Verantwortliche/r            | `[Product Owner / Fachbereich]`                                                                                                                                             |
| Verarbeitungstätigkeit                | Digitaler Showroom, Konfigurationen, optionale Benutzerkonten und Probefahrt-/Kontaktanfragen                                                                               |
| Zweck                                 | `[Zweck je Prozess getrennt konkretisieren]`                                                                                                                                |
| Betroffene Personen                   | Besucher, registrierte Nutzer, Interessenten                                                                                                                                |
| Datenkategorien                       | technische Request-Daten; Consent-Nachweis; Auth-Konto-/Sessiondaten; Konfiguration; Lead-Kontakt- und Anfragefelder. Tatsächliche Felder gegen Implementierung abgleichen. |
| Besondere Kategorien                  | Nicht vorgesehen; tatsächliche Implementierung prüfen                                                                                                                       |
| Rechtsgrundlage                       | `[DPO je Zweck prüfen; keine pauschale Annahme]`                                                                                                                            |
| Empfänger / Auftragsverarbeiter       | Vercel, Neon, E-Mail, Analytics und weitere integrierte Anbieter nach Datenfluss-Inventar                                                                                   |
| Drittlandübermittlung                 | `[Anbieterstandorte, Supportzugriffe, Subprozessoren und Mechanismus prüfen]`                                                                                               |
| Löschfristen                          | Leads 90 Tage; Logs 30 Tage; Auth-/Consent-Daten nach Zweck, Vertrag und DPO-Freigabe konkretisieren                                                                        |
| Technische/organisatorische Maßnahmen | EU-Region-Konfiguration, TLS, rollenbasierter Zugriff, Sensitive-Secrets, Logging ohne PII, Rate Limits, Backup/Restore, Audit                                              |
| Übermittlung / Datenflüsse            | Browser → Vercel `fra1` → Neon AWS `eu-central-1`; E-Mail/Analytics-Flüsse ergänzen                                                                                         |
| Stand / Prüfergebnis                  | `[Datum, Verantwortliche, offene Punkte, Freigabe]`                                                                                                                         |

Vor Produktivnahme Datenfelder, Rechtsgrundlage, Empfänger,
Aufbewahrungsfristen und tatsächliche Anbieter-/Unterauftragsverarbeiter
prüfen. Die Vorlage ist keine Rechtsberatung.
