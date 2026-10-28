# Runbook: Kostenalarm bei 80 % des Monatsbudgets

**Alarm:** Vercel- oder Neon-Verbrauch erreicht 80 % des genehmigten
Monatsbudgets (P3).

1. Zeitraum, Produkt/Projekt und Trend im Anbieter-Dashboard feststellen;
   Alarmwert und prognostizierten Monatsendstand dokumentieren.
2. Ungeplante Preview-Branches, fehlerhafte Cron-Wiederholungen, Traffic-
   Spitzen, Cache-Miss-Rate und Compute-Auslastung untersuchen.
3. Laufende Lasttests sofort stoppen, falls keine aktive Freigabe vorliegt.
   Neue Lasttests bleiben bis zur Freigabe durch QA/DevOps und Anbieter
   deaktiviert.
4. Keine Production-Compute-/WAF-/Retention-Einstellung ohne Freigabe
   reduzieren. Auswirkungen auf SLO, Restore-Fenster und Sicherheit vor
   Änderungen bewerten.
5. Delivery Lead und Verantwortliche informieren; Plan-/Limit-Fragen im
   [`plan-check.md`](../ops/plan-check.md) mit Anbieter prüfen.
6. Nach Maßnahme Verbrauch, SLO und Trend mindestens einen vereinbarten
   Beobachtungszeitraum kontrollieren; Entscheidung und Owner protokollieren.
