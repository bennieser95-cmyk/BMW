# ADR-0005: Vercel-Hosting

- **Status:** Akzeptiert (Vorgabe)

## Kontext

Die Plattformvorgabe des Auftraggebers legt Vercel, CDN-Auslieferung, Preview-Deployments und
Fluid Compute fest.

## Entscheidung

Builds und Deployments zielen auf Vercel. Die Anwendung verwendet die plattformverwalteten Next.js-
und CDN-Caches; Docker und Kubernetes sind keine Betriebsplattform.

## Alternativen

- Selbsthosting auf Kubernetes: widerspricht der Vorgabe und erhöht Betriebsaufwand.
- Eigenständige Containerplattform: außerhalb des freigegebenen Projektumfangs.

## Konsequenzen

- Umgebungsvariablen und Preview-Branches werden je Vercel-Environment gepflegt.
- Plattformlimits und Kosten müssen vor produktiven Lasttests geprüft werden.
