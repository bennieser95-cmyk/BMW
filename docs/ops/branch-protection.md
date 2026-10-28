# GitHub-Branch- und Tag-Schutz

Diese Einstellungen sind im GitHub-Repository als Rulesets/Branch Protection
einzurichten und anschließend per Test-PR nachzuweisen; Markdown allein setzt
keine Plattformrichtlinie.

## `main`

- Direkte Pushes und Force-Pushes sperren; Änderungen nur per Pull Request.
- Mindestens eine unabhängige Freigabe und CODEOWNER-Freigabe verlangen.
- Alle Pflichtprüfungen erfolgreich: `Validate code and tests`,
  `SonarQube quality gate`, `CodeQL, dependency audit, and secret scan` und
  `Open-source license allowlist`. Der Vercel-Preview-/Staging-Status sowie
  Lighthouse-/E2E- und gegebenenfalls freigegebener Lasttest sind ebenfalls
  vor Release-Abnahme nachzuweisen.
- Veraltete Approvals nach neuen Commits verwerfen; Unterhaltungs-Commits
  vor Merge verlangen.

## Release-Tags `v*`

- Tag-Erstellung, -Änderung und -Löschung über ein Tag-Ruleset beschränken.
- Ausschließlich freigegebene Release-Verantwortliche dürfen Versionstags
  erstellen. Release-Workflow muss aus genau dem geprüften Commit starten.
- GitHub Environment `production` mit Required Reviewers und
  Self-Review-Sperre einrichten. Der Release-Job für Production-Migration und
  Deployment sowie der spätere Promote-Job müssen beide dieses geschützte
  Environment verwenden. Dadurch wird der Produktionszugriff vor der
  Migration freigegeben; nach dem Smoke-Test ist für Promote eine erneute
  manuelle Freigabe erforderlich. Reviewer prüfen jeweils, dass der Tag auf
  einen freigegebenen Commit zeigt.
- Im Environment `production` eine benutzerdefinierte Deployment-Tag-Policy
  `v*` konfigurieren. Der Release-Workflow prüft vor Migration und Promote
  über die GitHub-API fail-closed, dass Required Reviewer, Self-Review-Sperre
  und diese Tag-Policy mit
  [`verify-production-environment.mjs`](../../scripts/ops/verify-production-environment.mjs)
  aktiv sind. Diese Workflow-Prüfung ergänzt, ersetzt aber nicht das
  Tag-Ruleset zur Beschränkung der Ersteller.
- Promote nur über dieses Environment; keine direkte Domain-Zuweisung im
  Deploy-Job.
- Plan-/Tarifverfügbarkeit der benötigten Ruleset-Funktionen beim Anbieter
  prüfen. Falls nicht verfügbar, gleichwertige organisatorische Freigabe
  dokumentieren und kein ungeschütztes Tag-Publishing zulassen.
