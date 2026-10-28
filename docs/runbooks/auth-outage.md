# Runbook: Neon-Auth-Ausfall

**Alarm:** deutlicher Anstieg von Auth-401/5xx (P2).

1. Betroffene Umgebung und Neon-Auth-Branch bestimmen. Dashboard-/Statusseite,
   Auth-Konfiguration, Domain-/Redirect-Allowlist und kürzliche Changes prüfen.
2. Verifizieren, dass `NEON_AUTH_BASE_URL` auf denselben Branch zeigt wie die
   Anwendung und `NEON_AUTH_COOKIE_SECRET` nur der passenden Umgebung
   zugeordnet ist. Secret-Werte nie ausgeben.
3. Öffentliche, nicht authentifizierte Seiten und `/api/health` unabhängig
   prüfen. Sie sollen ohne Auth erreichbar bleiben.
4. Konto-Bereich gemäß Produktverhalten auf Wartungshinweis setzen/halten;
   keine neue Auth-Abhängigkeit in öffentliche Seiten einführen.
5. Bei Secret- oder Redirect-Änderung kontrolliert rotieren/aktualisieren und
   Auth-E2E ausschließlich in Non-Prod durchführen. Keine Testkonten in
   Production anlegen.
6. Bei Release-Korrelation Vercel-Rollback nach
   [`bad-release-rollback.md`](./bad-release-rollback.md); Auth-/DB-Zustand
   nicht durch App-Rollback zurücksetzen.
7. Nach Wiederherstellung Login, Session, Logout und Recovery in Non-Prod
   testen, betroffene Nutzerkommunikation mit Product/Support abstimmen und
   Incident-/Beta-Risiko dokumentieren.
