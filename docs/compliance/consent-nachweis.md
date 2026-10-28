# Vorlage: Consent- und Einwilligungsnachweis

**Ziel:** Die konkrete Consent-Implementierung und der Nachweis müssen durch
Datenschutz/Legal geprüft werden. Keine realen Nutzer- oder Consent-Daten in
dieser Datei speichern.

## Prüfkriterien

- Statistik-/Marketing-Tags werden standardmäßig nicht geladen.
- Ablehnen ist ebenso einfach erreichbar wie Zustimmen.
- Zwecke sind getrennt und verständlich; Einwilligung ist freiwillig,
  informiert, spezifisch und widerrufbar.
- Widerruf ist jederzeit erreichbar und stoppt weitere nicht erforderliche
  Tracking-Zugriffe.
- Notwendige Cookies/Speicherungen sind von optionalem Tracking getrennt.
- Consent-Version, Auswahl und Zeitstempel werden nach freigegebenem Zweck
  minimal nachgewiesen; keine überflüssigen IP-/Gerätekennungen.

## Nachweisdatensatz – Schema festlegen, keine Echtdaten eintragen

| Feld                              | Zweck                               |
| --------------------------------- | ----------------------------------- |
| Consent-Policy-Version            | Zuordnung zur angezeigten Erklärung |
| Kategorie / Zweck                 | Getrennte Auswahl optionaler Zwecke |
| Auswahl                           | Ja/Nein bzw. Widerruf               |
| Zeitstempel                       | Nachweis des Zeitpunkts             |
| Implementierungs-/Deploy-Referenz | reproduzierbare technische Version  |

**Testnachweise:** automatisierte Tests für Ablehnen ohne Tracking-Requests,
Widerruf, Reload/Navigation und Locale-Wechsel; manuelle Netzwerkprüfung.
**Aufbewahrung und Rechtsgrundlage:** `[durch DPO festlegen]`.
