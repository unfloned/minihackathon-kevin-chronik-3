# YCMM - Your Chaos, My Mission

> **Minihackathon Dezember 2025** | Thema: *"Unordnung - Entwickle etwas, um Chaos in Ordnung zu verwandeln"*

---

## Die Idee

Wir alle kennen es: Abos hier, Notizen da, Deadlines vergessen, der Überblick über Ausgaben fehlt, und wo war nochmal dieses eine Buch das ich lesen wollte?

**YCMM** bringt Ordnung ins Chaos des Alltags. Eine All-in-One App für Menschen, die ihr Leben zentral organisieren möchten - ohne zwischen 10 verschiedenen Apps wechseln zu müssen.

---

## Features

### Kernmodule

| Modul | Beschreibung |
|-------|-------------|
| **Dashboard** | Zentraler Überblick über alle wichtigen Informationen |
| **Ausgaben** | Einnahmen & Ausgaben tracken mit Kategorien und Monatsstatistiken |
| **Abonnements** | Alle Abos im Blick - monatliche/jährliche Kosten auf einen Blick |
| **Inventar** | Was besitze ich? Wo ist es? An wen verliehen? |
| **Deadlines** | Nie wieder wichtige Termine vergessen |
| **Habits** | Gewohnheiten aufbauen mit Streaks und Tracking |
| **Medien** | Bücher, Filme, Serien, Spiele - Watchlist & Fortschritt |
| **Notizen** | Rich-Text Notizen mit TipTap Editor |
| **Listen** | Flexible Listen für alles (Einkauf, Todo, etc.) |
| **Mahlzeiten** | Rezepte & Wochenplanung |
| **Wunschliste** | Geschenkideen und Wünsche sammeln |
| **Projekte** | Projekte mit Tasks und Fortschritt verwalten |
| **Bewerbungen** | Bewerbungsprozess tracken mit Kanban-Board |

### Highlights

- **Gamification** - XP sammeln, Level aufsteigen, Achievements freischalten
- **Einheitliches Design** - Konsistente UI mit Grid/Listen-Ansichten überall
- **Dark Mode** - Augenfreundlich zu jeder Tageszeit
- **Responsive** - Funktioniert auf Desktop und Mobile
- **Erweiterbar** - Architektur vorbereitet für Hybrid-Apps (Ionic/React Native/Electron)

---

## Tech Stack

| Technologie | Verwendung |
|-------------|------------|
| **React** | Frontend Framework |
| **TypeScript** | Type Safety überall |
| **Mantine** | UI Component Library |
| **Vite** | Build Tool & Dev Server |
| **Deepkit** | Backend Framework mit ORM |
| **SQLite/PostgreSQL/MySQL** | Datenbank (via DATABASE_URL) |

> **Hinweis:** Bei MySQL wird nur Version **8.0** unterstützt.

---

## Demo

**Live Demo:** [ycmm.florian-chiorean.de](https://ycmm.florian-chiorean.de)

> Nutze den **"Demo Account"** Button auf der Login-Seite um die App zu testen!

---

## Lokale Installation

```bash
# Repository klonen
git clone https://github.com/florian-chiorean/ycmm.git
cd ycmm

# Dependencies installieren
pnpm install

# Development Server starten
pnpm dev
```

Die App läuft dann unter:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

### Umgebungsvariablen

```bash
# Datenbank (Standard: SQLite)
DATABASE_URL=sqlite://./data/ycmm.db

# Alternativ: PostgreSQL
# DATABASE_URL=postgres://user:password@localhost:5432/ycmm

# Alternativ: MySQL 8.0
# DATABASE_URL=mysql://user:password@localhost:3306/ycmm
```

---

## Projektstruktur

```
ycmm/
├── apps/
│   ├── web/          # React Frontend
│   └── server/       # Deepkit Backend
├── packages/
│   └── core/         # Shared Types & Utilities
└── package.json      # Monorepo Root
```

---

## Screenshots

*Coming soon...*

---

## Hackathon Info

- **Event:** Minihackathon Dezember 2025
- **Thema:** "Unordnung - Entwickle etwas, um Chaos in Ordnung zu verwandeln"
- **Zeitraum:** 1. - 8. Dezember 2025
- **Entwickler:** Solo-Projekt

---

## Lizenz

MIT

---

<p align="center">
  <i>Built with chaos, delivers order.</i>
</p>
