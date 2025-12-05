# i18n Implementation Plan

## Aktueller Stand
- **Setup existiert**: react-i18next konfiguriert in `apps/web/src/i18n/index.ts`
- **Sprachen**: DE (default), EN
- **LanguageSelector**: Komponente vorhanden in Header
- **Übersetzt**: common, auth, landing, nav, dashboard, settings, notifications, errors (ca. 100 Keys)
- **Nutzung**: Nur 4 von 23 Seiten verwenden `useTranslation`
- **Core Package**: Leere i18n/de und i18n/en Ordner existieren bereits

## Architektur-Entscheidung
**Translations ins Core Package verschieben**, damit:
- Translations zwischen Web/Mobile/Desktop geteilt werden können
- Zentrale Verwaltung aller Übersetzungen
- Type-Safety für Translation Keys möglich

### Struktur in `packages/core/src/i18n/`:
```
i18n/
├── index.ts          # Export der Translations
├── de/
│   └── index.ts      # Deutsche Übersetzungen
└── en/
    └── index.ts      # Englische Übersetzungen
```

## Scope
23 Pages + AppLayout + Shared Components:

### Module (Pages)
1. HabitsPage - Typ, Streak, Timer, Frequenz
2. ExpensesPage - Kategorien, Statistiken
3. DeadlinesPage - Status, Priorität
4. SubscriptionsPage - Billing-Zyklen, Status
5. MediaPage - Medientypen, Progress
6. InventoryPage - Kategorien, Verleih-Status
7. NotesPage, NoteDetailPage, NoteEditPage
8. ListsPage, ListDetailPage - Listen-Typen
9. ProjectsPage, ProjectDetailPage - Status, Tasks
10. MealsPage - Mahlzeiten, Planung
11. WishlistsPage - Priorität, Preis
12. ApplicationsPage - Bewerbungsstatus (Kanban)
13. AchievementsPage - Achievement-Kategorien
14. DashboardPage - Stats, Widgets
15. SettingsPage
16. AdminPage

### Shared Components
- AppLayout (Navigation Items)
- PageLayout
- CardStatistic
- CreateModals (Quick Create)

## Implementierung

### Phase 1: Core Package Translations
1. `packages/core/src/i18n/de/index.ts` - Alle deutschen Übersetzungen
2. `packages/core/src/i18n/en/index.ts` - Alle englischen Übersetzungen
3. `packages/core/src/i18n/index.ts` - Export
4. Export in `packages/core/src/index.ts` hinzufügen

### Phase 2: Web i18n anpassen
- `apps/web/src/i18n/index.ts` aktualisieren um Translations aus Core zu importieren
- Bestehende locales/de.json und locales/en.json löschen

### Phase 3: Pages aktualisieren
Für jede Page:
1. `import { useTranslation } from 'react-i18next'`
2. `const { t } = useTranslation()`
3. Alle hardcoded Strings ersetzen mit `t('module.key')`

### Phase 4: Shared Components
- AppLayout: navItems Labels
- CreateModals: Form Labels
- Notification Messages

## Translation Struktur
```typescript
{
  common: { ... },
  auth: { ... },
  nav: { ... },
  dashboard: { ... },
  habits: {
    title: "Habits",
    subtitle: "Baue positive Gewohnheiten auf",
    newHabit: "Neues Habit",
    editHabit: "Habit bearbeiten",
    types: {
      boolean: "Ja/Nein",
      quantity: "Menge",
      duration: "Dauer"
    },
    stats: {
      today: "Heute",
      currentStreak: "Aktuelle Streak",
      longestStreak: "Längste Streak",
      activeHabits: "Aktive Habits"
    },
    // ...
  },
  expenses: { ... },
  // ... weitere Module
}
```

## Geschätzter Umfang
- ~500-600 Translation Keys pro Sprache
- ~25 Dateien zu aktualisieren
