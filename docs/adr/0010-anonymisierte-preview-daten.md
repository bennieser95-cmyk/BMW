# ADR-0010: Eigenes Non-Prod-Neon-Projekt für Previews

- **Status:** Akzeptiert

## Kontext

Preview- und Staging-Deployments dürfen keine produktiven personenbezogenen Daten enthalten.

## Entscheidung

Preview- und sonstige Nicht-Produktivumgebungen verwenden ein separates Neon-Projekt sowie
ausschließlich synthetische oder anonymisierte Daten.

## Alternativen

- Gemeinsame Datenbank mit Production: unzulässige Datenvermischung.
- Kopie produktiver Datensätze in Previews: Datenschutz- und Zugriffsrisiko.

## Konsequenzen

- Branches und Zugangsdaten werden je Umgebung getrennt verwaltet.
- Seed-Daten müssen synthetisch und reproduzierbar sein.
