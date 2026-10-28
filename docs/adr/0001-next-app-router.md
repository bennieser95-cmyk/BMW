# ADR-0001: Next.js App Router

- **Status:** Akzeptiert

## Kontext

Das Projekt benötigt serverseitiges Rendering, Streaming, ISR und eine gemeinsame BFF-Schicht für
Seiten und API-Endpunkte.

## Entscheidung

Die Anwendung verwendet Next.js 16 mit App Router und React 19. Routen und Komposition liegen in
`src/app/`; Server Components sind der Standard.

## Alternativen

- Next.js Pages Router: geringere Übereinstimmung mit den geforderten App-Router-Funktionen.
- Ein separates Frontend-Framework: zusätzlicher Betriebs- und Integrationsaufwand.

## Konsequenzen

- Server Components, Route Handler und Streaming sind direkt verfügbar.
- Teams müssen Next.js-Spezialdateien und Server-/Client-Grenzen einhalten.
