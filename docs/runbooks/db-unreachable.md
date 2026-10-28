# Runbook: Neon-Datenbank nicht erreichbar

**Alarm:** `/api/health` > 2 Minuten (P1), p95 > 800 ms/Timeouts (P2),
Verbindungen > 80 % oder `purge-leads` fehlgeschlagen (P3).

1. Zeit, betroffene Vercel-Umgebung und Deployment-ID festhalten. Prüfen, ob
   Fehler nur Production oder auch Staging/Non-Prod betreffen.
2. Neon-Status/Projekt/Branch und Compute-Zustand im Neon-Dashboard prüfen.
   Geplante Wartung und Anbieterstatus abgleichen.
3. Prüfen, dass `DATABASE_URL` auf den Pooler der richtigen Umgebung zeigt,
   `DATABASE_URL_UNPOOLED` nur für Migration/Wartung genutzt wird und
   `sslmode=require` gilt. Keine Connection-Strings in Logs/Tickets kopieren.
4. Connection-Auslastung, Limits, CPU, Query-Latenz und letzte Migration
   auswerten. Bei > 80 % Pool/Compute-Last nicht mit parallelen manuellen
   Wiederholungen verstärken.
5. Wenn Deployment-korreliert, nach
   [`bad-release-rollback.md`](./bad-release-rollback.md) App-Rollback
   ausführen; Datenbank nicht zurückrollen.
6. Nur nach Freigabe und dokumentierter Ursache Neustart/Compute-Änderung
   durch zuständige Operatoren vornehmen. Bei möglicher Datenkorruption
   Restore-Runbook eskalieren.
7. Health, Query-Latenz und Fehlerquote beobachten; Incident schließen, wenn
   stabil. Ursache, Dauer und Folgemaßnahmen dokumentieren.
