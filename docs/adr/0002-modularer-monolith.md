# ADR-0002: Modularer Monolith statt Microfrontends

- **Status:** Akzeptiert

## Kontext

Ein Team mit vier Entwicklern arbeitet an einer Anwendung mit gemeinsamer Release-Kadenz und
gemeinsamem Design-System.

## Entscheidung

Die Lösung bleibt eine einzelne Next.js-Anwendung mit fachlich getrennten Feature-Modulen und
automatisch geprüften Abhängigkeitsregeln.

## Alternativen

- Module Federation oder Microfrontends: zusätzliche Laufzeit-, Deployment- und SEO-Komplexität.
- Ein unstrukturierter Monolith: keine belastbare Grenze zwischen Fachmodulen.

## Konsequenzen

- Einfaches Deployment und gemeinsame Optimierung des Seiten-Bundles.
- Die Aufteilung auf mehrere Anwendungen wird erst bei wesentlich größerem Team neu bewertet.
