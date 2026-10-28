# ADR-0008: Neon Postgres mit Drizzle ORM

- **Status:** Akzeptiert

## Kontext

Die Plattformvorgabe bestimmt Neon Postgres. Preview-Umgebungen sollen isolierte Datenbank-
Branches erhalten; Laufzeitverbindungen werden über Pooling bereitgestellt.

## Entscheidung

Die Datenbankintegration verwendet Neon Postgres und Drizzle ORM. Laufzeit und Migrationen nutzen
getrennte Verbindungsvariablen. Ein Datenbankschema wird in diesem Grundgerüst nicht angelegt.

## Alternativen

- Prisma: widerspricht der festgehaltenen Architekturentscheidung.
- Direkte, nicht typisierte SQL-String-Verkettung: fehleranfällig und unsicher.

## Konsequenzen

- Migrationen sind vorwärts und rückwärts kompatibel zu planen.
- Schema, Repositories und Neon-Zugriff werden vom Backend-Agent ergänzt.
