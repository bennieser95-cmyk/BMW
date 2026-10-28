# IDOR-Prüfung `/api/v1/me/*`

**Status: offen.** Im aktuellen Repository-Review sind die unter
`/api/v1/me/*` beschriebenen Route Handler noch nicht vorhanden. Daher wird
keine Aussage über die Sicherheit einer Implementierung getroffen.

| Route / Ressource | Eigentümerprüfung im Handler | Positivtest eigener Datensatz | Negativtest fremde Nutzer-ID | Status / Finding |
|---|---|---|---|---|
| `/api/v1/me/configurations` (Dok. 03) | Aus serverseitig verifizierter Session abgeleitete `userId`; niemals Client-ID übernehmen | Nach Implementierung ergänzen | Nutzer B kann Ressource von Nutzer A weder lesen, ändern noch löschen | Offen: Route fehlt |
| Weitere `/api/v1/me/*`-Routen | Je Route aus Session abgeleitete Eigentümerschaft und deny-by-default | Je Ressource ergänzen | Je Operation Cross-User-Request mit 403/404 | Inventar nach Implementierung ergänzen |

Prüfregeln:

- Autorisierung in jedem Route Handler/Server Action; ein geschütztes Layout
  oder ein Proxy ist kein Ersatz.
- Benutzeridentität ausschließlich serverseitig über Neon Auth/AuthPort
  ermitteln. Eine manipulierte `userId`, Ressourcen-ID oder URL darf keine
  Rechte erteilen.
- Cross-User-Tests mit zwei eindeutigen synthetischen Testkonten im Non-Prod
  ausführen; Setup und Cleanup im Test garantieren.
- Response darf keine Existenz fremder Ressourcen oder personenbezogene Daten
  offenlegen.

**Owner:** Anwendungseigentümer unter Agents 2–4 festlegen. Diese Prüfung
ändert keine Auth- oder Feature-Implementierung.
