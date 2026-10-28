# Runbook: fehlerhaftes Release / Vercel-Rollback

**Ziel:** Produktionsdienst stabilisieren; Rollback-Ziel-RTO < 5 Minuten.
**Alarm:** Uptime `/api/health` P1, 5xx > 2 % P1, p95/Timeout P2 oder
LCP p75 > 2,5 s P3.

1. Incident-Verantwortliche/n übernehmen lassen, Startzeit und betroffene
   Deployment-URL notieren. Keine Secrets oder PII in den Incident-Kanal
   kopieren.
2. Vercel Observability/Sentry und letzten Promote-Zeitpunkt prüfen.
   Verfügbarkeit der öffentlichen Seite und `/api/health` bestätigen.
3. Bei klarer Release-Korrelation das vorherige stabile Deployment über
   Vercel CLI/Dashboard zurücksetzen:

   ```sh
   vercel rollback <deployment-url>
   ```

4. `/api/health`, öffentliche Einstiegsseite und Error-Rate prüfen. Ergebnis
   und RTO protokollieren; Stakeholder und On-Call informieren.
5. Ursache klassifizieren, betroffenen Tag/Commit blockieren und Fix als PR
   bereitstellen. Kein direkter Hotfix ohne Review und Pipeline.

**Wichtig:** App-Rollback setzt die Datenbank nicht zurück. Migrationen müssen
Expand-Contract und rückwärtskompatibel sein. Bei Datenfehlern separates
[`restore-neon-branch.md`](./restore-neon-branch.md) starten; keine
Rückwärtsmigration ausführen.
