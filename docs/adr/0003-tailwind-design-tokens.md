# ADR-0003: Tailwind CSS und Design-Tokens

- **Status:** Akzeptiert

## Kontext

Das Design-System soll konsistente Abstände, Farben und Typografie ermöglichen, ohne zusätzliche
CSS-in-JS-Laufzeit in jede Seite einzubringen.

## Entscheidung

Tailwind CSS wird mit CSS-Variablen für Design-Tokens eingesetzt. Die Sortierung der Utility-Klassen
erfolgt durch das Prettier-Tailwind-Plugin.

## Alternativen

- CSS-in-JS: zusätzliche Laufzeit und Styling-Abstraktion.
- Unstrukturierte Einzel-CSS-Werte: erschweren Konsistenz und Pflege.

## Konsequenzen

- Tokens können zentral angepasst werden; Styles bleiben im Build verarbeitbar.
- UI-Änderungen verwenden die freigegebenen Tokens statt lokaler Farbwerte.
