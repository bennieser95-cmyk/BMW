# Runbook: Secret-Rotation (alle 90 Tage)

**Owner:** Cloud/DevOps Engineer. Bei Kompromittierungsverdacht sofortige
Rotation als Incident, nicht bis zum 90-Tage-Termin warten.

1. Secret-Inventar und Umgebungen festlegen (`DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, `NEON_AUTH_COOKIE_SECRET`, `CMS_API_TOKEN`,
   `CRON_SECRET`, `REVALIDATE_SECRET`, Vercel-/Neon-Operatorzugänge).
2. Zuständige Service-Owner benachrichtigen und Wartungs-/Rollback-Plan
   abstimmen. Neue Werte pro Umgebung erzeugen; keine Werte wiederverwenden.
3. Neon-Auth-Cookie-Secrets pro Environment unabhängig erzeugen:

   ```sh
   openssl rand -base64 32
   ```

4. Neue Werte ausschließlich in der jeweiligen Vercel Environment als
   **Sensitive** pflegen. Nicht in GitHub Logs, Shell-Historie, Chat oder
   Repository ausgeben.
5. Kontrolliertes Deployment/Restart auslösen und Health-, Login-, Cron-,
   Revalidation- und DB-Verbindungen der betroffenen Umgebung prüfen.
6. Nach erfolgreicher Prüfung alte Credentials beim jeweiligen Anbieter
   widerrufen/rotieren. Bei Ausfall neuen Wert zurücksetzen, bevor alter
   widerrufen wird; bei Kompromittierung keinen kompromittierten Wert
   reaktivieren.
7. Datum, Owner, betroffene Umgebungen, Widerruf und Testergebnis im
   zugriffsbeschränkten Secret-Inventar dokumentieren, niemals den Secret-Wert.
