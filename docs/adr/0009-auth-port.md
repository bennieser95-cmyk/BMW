# ADR-0009: Auth-Port gegen das Beta-Risiko

- **Status:** Akzeptiert

## Kontext

Neon Auth basiert auf einem Beta-Angebot. Änderungen am SDK oder ein späterer Anbieterwechsel
sollen nicht in Fachregeln durchschlagen.

## Entscheidung

Die Domain definiert `AuthPort`; eine spätere Infrastructure-Implementierung kapselt das konkrete
Neon-Auth-SDK.

## Alternativen

- Direkte SDK-Aufrufe aus Route Handlern und Fachmodulen: hohe Anbieterbindung.
- Authentifizierung ohne Adaptergrenze: erschwert Contract-Tests und Wechsel.

## Konsequenzen

- Fachcode hängt nur von `AuthPort` ab.
- Neon-Auth-Verhalten wird durch Adapter- und Contract-Tests abgesichert.
