# Runbook: Neon-Branch wiederherstellen

**Zielwerte:** RPO ≤ 15 Minuten und RTO ≤ 60 Minuten, abhängig vom gebuchten
Plan und vor Produktivfreigabe beim Anbieter zu bestätigen. Restore-Test
mindestens quartalsweise.

1. Incident-Lead und Datenverantwortliche benennen. Schreibzugriffe/Job-
   Auswirkungen kontrolliert begrenzen; Zeitpunkt und gewünschter Recovery
   Point festhalten.
2. Im Neon-Dashboard PITR-/Historienfenster des **richtigen Projekts** prüfen.
   Aufbewahrungsfenster muss den Recovery Point abdecken; wenn nicht, sofort
   eskalieren und nicht improvisiert überschreiben.
3. Neuen isolierten Restore-Branch zum bestätigten Zeitpunkt anlegen. Den
   aktuellen Produktionsbranch nicht löschen oder überschreiben.
4. Schema, Datensatzanzahl und fachliche Stichproben auf dem Restore-Branch
   gegen die erwartete Datenlage prüfen. PII nur durch berechtigte
   Verantwortliche verarbeiten.
5. Product Owner, Datenverantwortliche und DevOps genehmigen die
   Wiederherstellung/Umstellung der Verbindung. Erst dann kontrollierte
   Promotion der Datenbankverbindung nach Change-Prozess ausführen.
6. Anwendung mit Health-, Kernjourney- und Integritätsprüfungen verifizieren;
   App-Deployment und Datenbankzustand getrennt überwachen.
7. RPO/RTO, verwendeten Recovery Point, Validierungsnachweise, Freigaben und
   Abweichungen dokumentieren. Quartals-Restore mit synthetischen Testdaten
   üben und Ergebnis versioniert ablegen.

Neon-Restore ist keine App-Rollback-Aktion. Produktionsdaten nie in
Preview-/Staging-Branches kopieren.
