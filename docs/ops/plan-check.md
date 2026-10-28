# Anbieter- und Plan-Check

**Status:** offen. Keine Preise, Limits oder SLA-Zusagen werden angenommen.
Die folgenden Punkte sind vor Produktivfreigabe anhand der jeweils aktuellen
Anbieterunterlagen und des konkreten Kontos zu verifizieren und im
Entscheidungsprotokoll zu dokumentieren.

| Anbieter / Bereich | Offene Frage gemäß BAV-DO-005, Kap. 10                                                                  | Verantwortlich             | Status/Nachweis                       |
| ------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------- |
| Vercel             | Reicht Pro oder ist Enterprise erforderlich? Custom Environment `staging` verfügbar?                    | Delivery Lead, DevOps      | **Beim Anbieter prüfen**              |
| Vercel             | Funktionslaufzeit/-speicher, Bandbreite, WAF-/Rate-Limit-Funktionen und Spend-Limits für erwartete Last | DevOps                     | **Beim Anbieter prüfen**              |
| Vercel             | Rolling Releases verfügbar und erforderlich?                                                            | Delivery Lead, DevOps      | **Beim Anbieter prüfen**              |
| Vercel             | Log-Aufbewahrung und Audit-Funktionen für Deployments/Environment-Variablen                             | DevOps, Datenschutz        | **Beim Anbieter prüfen**              |
| Neon               | Geeigneter Plan, Compute-Größe und Autoscaling-Bereich für `fra1` ↔ `eu-central-1`                      | Delivery Lead, DevOps      | **Beim Anbieter prüfen**              |
| Neon               | PITR/Restore-Fenster mindestens 7 Tage? Erfüllt es RPO ≤ 15 min und RTO ≤ 60 min?                       | DevOps                     | **Beim Anbieter prüfen**              |
| Neon               | Scale-to-Zero im Produktionsbranch deaktivierbar und gewünschte Latenz ohne Cold Start erreichbar?      | Solution Architect, DevOps | **Beim Anbieter prüfen**              |
| Neon               | Verbindungs-/Compute-Limits, Anzahl/Retention automatischer Preview-Branches und Datenvolumen           | DevOps                     | **Beim Anbieter prüfen**              |
| Neon Auth          | Beta-Reifegrad, Nutzerlimits, Social Login/MFA, E-Mail-Anpassung und belastbare SLA-Aussagen            | Solution Architect         | **Beim Anbieter prüfen**              |
| Lasttest           | Zulässigkeit, Rate/Zeitraum, Kostenrahmen und Vorankündigung für 500 req/s auf gecachten Seiten         | QA Lead, DevOps            | **Vor Ausführung schriftlich prüfen** |
| Verträge           | AV-Vertrag, Drittlandtransfer, Support- und SLA-Stufen von Vercel, Neon, E-Mail und Analytics           | Datenschutz, Einkauf       | **Vor Produktivfreigabe prüfen**      |

Ergebnisse dürfen erst nach Anbieterbestätigung aktualisiert werden. Der
Lasttestjob bleibt bis zur dokumentierten Freigabe deaktiviert. Fragen zu
Limits, Restore-Zielen, WAF, Custom Environments oder Audit-/Log-Funktionen
bleiben bis zum Nachweis offen; es werden keine Werte aus einem fremden Plan
übertragen.
