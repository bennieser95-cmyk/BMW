# ADR-0004: Zod als Quelle für Validierung und Typen

- **Status:** Akzeptiert

## Kontext

Ungeprüfte Daten kommen aus Formularen, Route Handlern, Umgebungsvariablen und externen
Integrationen.

## Entscheidung

Grenzwerte werden mit Zod-Schemas validiert. TypeScript-Typen werden nach Möglichkeit aus diesen
Schemas abgeleitet.

## Alternativen

- Doppelte manuelle Validatoren und Interfaces: Validierungs- und Typdefinitionen können
  auseinanderlaufen.
- Validierung nur im Browser: schützt Server und Integrationsgrenzen nicht.

## Konsequenzen

- Schema und Laufzeitprüfung bleiben nachvollziehbar.
- Unbekannte Daten bleiben `unknown`, bis sie erfolgreich validiert wurden.
