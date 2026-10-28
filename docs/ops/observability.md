# Observability, SLO und Alarmierung

## Service Level Objectives

- Verfügbarkeit: **99,9 %**.
- p95-TTFB: **< 800 ms**.
- Error-Budget-Burn-Rate-Alarme: Fast-Burn 14,4× über 5 Minuten und 1 Stunde;
  Slow-Burn 6× über 30 Minuten und 6 Stunden. Fenster und Berechnung vor
  Aktivierung mit dem SLO-Messsystem verifizieren.
- Web-Vitals werden nur nach wirksamer Einwilligung erfasst. Logs enthalten
  strukturierte `traceId`/`requestId`, aber keine Leads, Zugangsdaten,
  Session-Cookies oder sonstige unnötige personenbezogene Inhalte.

Metriken: Vercel Observability/Functions/CDN, Neon-Verbindungen/CPU/Query-
Latenz, OpenTelemetry (`@vercel/otel`), Sentry und Web Vitals/RUM. Konkrete
Aufbewahrung, Export und Kosten beim Anbieter prüfen. Monitoring und Alarme in
der Plattformkonsole aktivieren; dieses Dokument allein erzeugt keine Alarme.

## Alarmkatalog

| Signal | Bedingung | Stufe | Runbook |
|---|---|---|---|
| Uptime `/api/health` | Ausfall > 2 Minuten | P1 | [`bad-release-rollback.md`](../runbooks/bad-release-rollback.md), danach [`db-unreachable.md`](../runbooks/db-unreachable.md) |
| HTTP 5xx | > 2 % über 5 Minuten | P1 | [`bad-release-rollback.md`](../runbooks/bad-release-rollback.md) |
| Latenz/Timeout | p95 > 800 ms oder Function-Timeouts | P2 | [`db-unreachable.md`](../runbooks/db-unreachable.md), bei Release-Korrelation [`bad-release-rollback.md`](../runbooks/bad-release-rollback.md) |
| Neon-Verbindungen | > 80 % des verfügbaren Limits, hohe CPU oder Speicher | P2 | [`db-unreachable.md`](../runbooks/db-unreachable.md) |
| Neon Auth | deutlicher Anstieg bei Auth-Fehlern (401/5xx) | P2 | [`auth-outage.md`](../runbooks/auth-outage.md) |
| Web Vitals | LCP p75 > 2,5 s | P3 | [`bad-release-rollback.md`](../runbooks/bad-release-rollback.md) |
| Cron `purge-leads` | Job fehlgeschlagen oder erwartete Ausführung fehlt | P3 | [`db-unreachable.md`](../runbooks/db-unreachable.md) |
| Kosten | 80 % des freigegebenen Monatsbudgets | P3 | [`cost-budget.md`](../runbooks/cost-budget.md) |
| Secret-Ablauf/Rotation | Rotation überfällig oder Missbrauchsverdacht | P2 | [`secret-rotation.md`](../runbooks/secret-rotation.md) |
| Restore-Test | Quartalsfrist überschritten oder Restore nicht verifizierbar | P2 | [`restore-neon-branch.md`](../runbooks/restore-neon-branch.md) |

Für jeden Alarm müssen im Anbieter-Dashboard Owner, Pager/Benachrichtigung,
Runbook-Link, Testzeitpunkt und letzte Bestätigung hinterlegt werden. Alarm
einmal je Sprint auslösen bzw. als kontrollierten Testnachweis verifizieren.

## Wiederherstellung und Rollback

- Vercel-App-Rollback: Ziel **RTO < 5 Minuten**; geübter Ablauf mit
  `vercel rollback` und anschließendem Health-/Smoke-Test.
- Neon-Wiederherstellung: Ziel **RPO ≤ 15 Minuten**, **RTO ≤ 60 Minuten**,
  abhängig vom gebuchten Plan und vor Go-Live durch den Anbieter zu bestätigen.
- Restore-Test mindestens quartalsweise mit isoliertem Branch; Ergebnis,
  Datenprüfung, Zeitwerte und offene Abweichungen protokollieren.
- App-Rollback setzt die Produktionsdatenbank nie zurück. Datenkorruption
  separat über Neon-Restore behandeln.
