# ADR-0006: Neon Auth

- **Status:** Akzeptiert (Vorgabe)

## Kontext

Die freigegebene Plattform nutzt Neon Postgres und Neon Auth. Das verwaltete Better-Auth-Angebot
befindet sich laut Architekturvorgabe im Beta-Status.

## Entscheidung

Die spätere Authentifizierung verwendet Neon Auth. Das Fundament stellt nur den
technologieneutralen `AuthPort` bereit und implementiert weder SDK-Adapter noch Sitzungslogik.

## Alternativen

- Selbst entwickelte Authentifizierung: Sicherheits- und Wartungsrisiko.
- Auth.js oder selbst gehostetes Better Auth: Abweichung von der Plattformvorgabe.

## Konsequenzen

- SDK-Versionen werden gepinnt und Änderungen über den Auth-Port isoliert.
- Serverseitige Autorisierung bleibt erforderlich; der Proxy ist kein Auth-Gate.
