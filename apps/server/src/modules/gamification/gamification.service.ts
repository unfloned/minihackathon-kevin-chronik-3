import { v4 as uuidv4 } from 'uuid';
import { AppDatabase } from '../../app/database';
import { NotificationService } from '../notifications/index';
import {
    User,
    Achievement,
    UserAchievement,
    XP_ACTIONS,
    calculateLevel,
    xpProgressInLevel,
    type XpAwardResult,
    type AchievementPublic,
} from '@ycmm/core';

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'id' | 'createdAt'>[] = [
    // ============================================
    // GENERAL
    // ============================================
    { key: 'first_login', name: 'Willkommen!', description: 'Erste Anmeldung', icon: 'door', category: 'general', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'profile_complete', name: 'Profil-Profi', description: 'Profil vollständig ausgefüllt', icon: 'user-check', category: 'general', xpReward: 25, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'week_active', name: 'Stammgast', description: '7 Tage in Folge eingeloggt', icon: 'calendar-star', category: 'general', xpReward: 50, requirement: 7, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'month_active', name: 'Dauerbrenner', description: '30 Tage in Folge eingeloggt', icon: 'calendar-check', category: 'general', xpReward: 150, requirement: 30, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'year_active', name: 'Jahresveteran', description: '365 Tage in Folge eingeloggt', icon: 'award', category: 'general', xpReward: 2000, requirement: 365, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'all_modules_used', name: 'Entdecker', description: 'Alle Module mindestens einmal genutzt', icon: 'compass', category: 'general', xpReward: 100, requirement: 14, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'level_5', name: 'Level 5', description: 'Level 5 erreicht', icon: 'star', category: 'general', xpReward: 50, requirement: 5, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'level_10', name: 'Level 10', description: 'Level 10 erreicht', icon: 'stars', category: 'general', xpReward: 150, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'level_25', name: 'Level 25', description: 'Level 25 erreicht', icon: 'crown', category: 'general', xpReward: 500, requirement: 25, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'level_50', name: 'Level 50', description: 'Level 50 erreicht', icon: 'diamond', category: 'general', xpReward: 1500, requirement: 50, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'level_100', name: 'Legendär Level 100', description: 'Level 100 erreicht - Du bist eine Legende!', icon: 'trophy', category: 'legendary', xpReward: 5000, requirement: 100, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // STREAKS
    // ============================================
    { key: 'streak_3', name: 'Dranbleiber', description: '3 Tage Streak', icon: 'flame', category: 'streaks', xpReward: 25, requirement: 3, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'streak_7', name: 'Wochenkrieger', description: '7 Tage Streak', icon: 'flame', category: 'streaks', xpReward: 50, requirement: 7, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'streak_14', name: 'Zweiwöchig Stark', description: '14 Tage Streak', icon: 'flame', category: 'streaks', xpReward: 100, requirement: 14, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'streak_30', name: 'Monatsmeister', description: '30 Tage Streak', icon: 'flame', category: 'streaks', xpReward: 200, requirement: 30, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'streak_60', name: 'Zwei Monate Stark', description: '60 Tage Streak', icon: 'fire', category: 'streaks', xpReward: 400, requirement: 60, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'streak_100', name: 'Hundert Tage', description: '100 Tage Streak', icon: 'crown', category: 'streaks', xpReward: 750, requirement: 100, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'streak_180', name: 'Halbjahreskämpfer', description: '180 Tage Streak', icon: 'medal', category: 'streaks', xpReward: 1500, requirement: 180, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'streak_365', name: 'Jahreslegende', description: '365 Tage Streak - Ein ganzes Jahr!', icon: 'trophy', category: 'legendary', xpReward: 5000, requirement: 365, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'streak_1000', name: 'Tausend Tage Unsterblich', description: '1000 Tage Streak - Unfassbar!', icon: 'infinity', category: 'legendary', xpReward: 15000, requirement: 1000, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // HABITS
    // ============================================
    { key: 'first_habit', name: 'Erster Schritt', description: 'Erstes Habit erstellt', icon: 'check', category: 'habits', xpReward: 15, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'habits_10', name: 'Gewohnheitstier', description: '10 Habits erledigt', icon: 'check-double', category: 'habits', xpReward: 50, requirement: 10, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'habits_50', name: 'Halb-Hundert', description: '50 Habits erledigt', icon: 'target', category: 'habits', xpReward: 100, requirement: 50, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'habits_100', name: 'Routiniert', description: '100 Habits erledigt', icon: 'trophy', category: 'habits', xpReward: 200, requirement: 100, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'habits_500', name: 'Gewohnheitsmeister', description: '500 Habits erledigt', icon: 'stars', category: 'habits', xpReward: 500, requirement: 500, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'habits_1000', name: 'Tausend Gewohnheiten', description: '1000 Habits erledigt', icon: 'medal', category: 'habits', xpReward: 1000, requirement: 1000, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'habits_5000', name: 'Habit-König', description: '5000 Habits erledigt', icon: 'crown', category: 'habits', xpReward: 3000, requirement: 5000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'habits_10000', name: 'Ultimativer Gewohnheitsmeister', description: '10000 Habits erledigt - Wahnsinn!', icon: 'diamond', category: 'legendary', xpReward: 10000, requirement: 10000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'habits_perfect_week', name: 'Perfekte Woche', description: 'Alle Habits 7 Tage am Stück erledigt', icon: 'sparkles', category: 'habits', xpReward: 75, requirement: 1, isHidden: false, type: 'repeatable', resetPeriod: 'weekly', tier: 2 },
    { key: 'habits_perfect_month', name: 'Perfekter Monat', description: 'Alle Habits 30 Tage am Stück erledigt', icon: 'star', category: 'habits', xpReward: 300, requirement: 1, isHidden: false, type: 'repeatable', resetPeriod: 'monthly', tier: 4 },
    { key: 'daily_grind', name: 'Täglicher Grind', description: 'Alle Tages-Habits erledigt', icon: 'sun', category: 'habits', xpReward: 15, requirement: 1, isHidden: false, type: 'daily', resetPeriod: 'daily', tier: 1 },

    // ============================================
    // DEADLINES
    // ============================================
    { key: 'first_deadline', name: 'Fristenführer', description: 'Erste Frist erstellt', icon: 'calendar-event', category: 'deadlines', xpReward: 15, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'deadline_met', name: 'Pünktlich!', description: 'Frist rechtzeitig erledigt', icon: 'calendar-check', category: 'deadlines', xpReward: 20, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'deadlines_10', name: 'Terminprofi', description: '10 Fristen eingehalten', icon: 'calendar-stats', category: 'deadlines', xpReward: 75, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'deadlines_50', name: 'Fristenadler', description: '50 Fristen eingehalten', icon: 'calendar-check', category: 'deadlines', xpReward: 200, requirement: 50, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'deadlines_100', name: 'Pünktlichkeitskönig', description: '100 Fristen eingehalten', icon: 'crown', category: 'deadlines', xpReward: 400, requirement: 100, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'deadlines_500', name: 'Deadline-Legende', description: '500 Fristen eingehalten', icon: 'trophy', category: 'deadlines', xpReward: 1500, requirement: 500, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'deadlines_all_clear', name: 'Alles erledigt!', description: 'Alle Fristen abgehakt', icon: 'confetti', category: 'deadlines', xpReward: 50, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },
    { key: 'early_bird', name: 'Frühaufsteher', description: 'Frist eine Woche früher erledigt', icon: 'sunrise', category: 'deadlines', xpReward: 30, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },

    // ============================================
    // SUBSCRIPTIONS
    // ============================================
    { key: 'first_subscription', name: 'Abo-Überblick', description: 'Erstes Abo erfasst', icon: 'repeat', category: 'subscriptions', xpReward: 15, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'subscriptions_5', name: 'Abo-Manager', description: '5 Abos verwaltet', icon: 'list-check', category: 'subscriptions', xpReward: 50, requirement: 5, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'subscriptions_10', name: 'Abo-Experte', description: '10 Abos verwaltet', icon: 'stack', category: 'subscriptions', xpReward: 100, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'subscription_cancelled', name: 'Sparfuchs', description: 'Unnötiges Abo gekündigt', icon: 'pig-money', category: 'subscriptions', xpReward: 30, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },
    { key: 'saved_100', name: 'Sparer', description: '100€ durch Kündigungen gespart', icon: 'cash', category: 'subscriptions', xpReward: 100, requirement: 100, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'saved_1000', name: 'Großsparer', description: '1000€ durch Kündigungen gespart', icon: 'bank', category: 'subscriptions', xpReward: 500, requirement: 1000, isHidden: true, type: 'one_time', tier: 4 },

    // ============================================
    // APPLICATIONS
    // ============================================
    { key: 'first_application', name: 'Bewerbungsstarter', description: 'Erste Bewerbung erstellt', icon: 'briefcase', category: 'applications', xpReward: 20, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'applications_10', name: 'Fleißiger Bewerber', description: '10 Bewerbungen geschickt', icon: 'send', category: 'applications', xpReward: 75, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'applications_25', name: 'Bewerbungs-Marathon', description: '25 Bewerbungen geschickt', icon: 'run', category: 'applications', xpReward: 150, requirement: 25, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'applications_50', name: 'Hartnäckig', description: '50 Bewerbungen geschickt', icon: 'target', category: 'applications', xpReward: 300, requirement: 50, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'applications_100', name: 'Bewerbungs-Legende', description: '100 Bewerbungen geschickt', icon: 'medal', category: 'applications', xpReward: 750, requirement: 100, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'applications_500', name: 'Unaufhaltsam', description: '500 Bewerbungen geschickt', icon: 'rocket', category: 'applications', xpReward: 2500, requirement: 500, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'first_interview', name: 'Eingeladen!', description: 'Erstes Interview', icon: 'calendar', category: 'applications', xpReward: 50, requirement: 1, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'interviews_10', name: 'Interview-Profi', description: '10 Interviews absolviert', icon: 'user-check', category: 'applications', xpReward: 200, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'interviews_50', name: 'Interview-Veteran', description: '50 Interviews absolviert', icon: 'users', category: 'applications', xpReward: 750, requirement: 50, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'job_offer', name: 'Traumjob!', description: 'Job-Angebot erhalten', icon: 'star', category: 'applications', xpReward: 200, requirement: 1, isHidden: false, type: 'repeatable', tier: 3 },
    { key: 'offers_5', name: 'Begehrt', description: '5 Job-Angebote erhalten', icon: 'stars', category: 'applications', xpReward: 500, requirement: 5, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'offers_10', name: 'Heiß begehrt', description: '10 Job-Angebote erhalten', icon: 'crown', category: 'applications', xpReward: 1500, requirement: 10, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // EXPENSES
    // ============================================
    { key: 'first_expense', name: 'Buchhalter', description: 'Erste Ausgabe getrackt', icon: 'coin', category: 'expenses', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'expenses_10', name: 'Fleißiger Buchhalter', description: '10 Ausgaben erfasst', icon: 'coins', category: 'expenses', xpReward: 30, requirement: 10, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'expenses_50', name: 'Finanz-Lehrling', description: '50 Ausgaben erfasst', icon: 'wallet', category: 'expenses', xpReward: 75, requirement: 50, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'expenses_100', name: 'Finanz-Experte', description: '100 Ausgaben erfasst', icon: 'chart-line', category: 'expenses', xpReward: 150, requirement: 100, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'expenses_500', name: 'Controller', description: '500 Ausgaben erfasst', icon: 'chart-bar', category: 'expenses', xpReward: 400, requirement: 500, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'expenses_1000', name: 'Finanz-Meister', description: '1000 Ausgaben erfasst', icon: 'report-money', category: 'expenses', xpReward: 800, requirement: 1000, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'expenses_5000', name: 'CFO', description: '5000 Ausgaben erfasst', icon: 'diamond', category: 'expenses', xpReward: 2500, requirement: 5000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'budget_keeper', name: 'Budget-Meister', description: 'Monat unter Budget geblieben', icon: 'piggy-bank', category: 'expenses', xpReward: 100, requirement: 1, isHidden: false, type: 'repeatable', resetPeriod: 'monthly', tier: 3 },
    { key: 'budget_keeper_6', name: 'Halbjahr sparsam', description: '6 Monate unter Budget', icon: 'pig', category: 'expenses', xpReward: 500, requirement: 6, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'budget_keeper_12', name: 'Jahres-Sparer', description: '12 Monate unter Budget', icon: 'trophy', category: 'expenses', xpReward: 1500, requirement: 12, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // NOTES
    // ============================================
    { key: 'first_note', name: 'Gedankensammler', description: 'Erste Notiz erstellt', icon: 'note', category: 'notes', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'notes_10', name: 'Ideenreich', description: '10 Notizen erstellt', icon: 'notes', category: 'notes', xpReward: 30, requirement: 10, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'notes_50', name: 'Schreiber', description: '50 Notizen erstellt', icon: 'pencil', category: 'notes', xpReward: 75, requirement: 50, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'notes_100', name: 'Autor', description: '100 Notizen erstellt', icon: 'book', category: 'notes', xpReward: 150, requirement: 100, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'notes_500', name: 'Bestseller-Autor', description: '500 Notizen erstellt', icon: 'books', category: 'notes', xpReward: 500, requirement: 500, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'notes_1000', name: 'Großschriftsteller', description: '1000 Notizen erstellt', icon: 'library', category: 'notes', xpReward: 1500, requirement: 1000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'daily_journal', name: 'Tagebuchschreiber', description: 'Jeden Tag eine Notiz (7 Tage)', icon: 'diary', category: 'notes', xpReward: 50, requirement: 7, isHidden: false, type: 'repeatable', resetPeriod: 'weekly', tier: 2 },

    // ============================================
    // LISTS
    // ============================================
    { key: 'first_list', name: 'Listenersteller', description: 'Erste Liste erstellt', icon: 'list', category: 'lists', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'lists_10', name: 'Organisiert', description: '10 Listen erstellt', icon: 'list-check', category: 'lists', xpReward: 30, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'list_items_100', name: 'Fleißig', description: '100 Listen-Items abgehakt', icon: 'checkbox', category: 'lists', xpReward: 75, requirement: 100, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'list_items_500', name: 'Produktiv', description: '500 Listen-Items abgehakt', icon: 'checks', category: 'lists', xpReward: 250, requirement: 500, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'list_items_1000', name: 'Ultra-Produktiv', description: '1000 Listen-Items abgehakt', icon: 'rocket', category: 'lists', xpReward: 600, requirement: 1000, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'list_items_10000', name: 'Abhak-Maschine', description: '10000 Listen-Items abgehakt', icon: 'robot', category: 'lists', xpReward: 3000, requirement: 10000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'shopping_saver', name: 'Clever eingekauft', description: 'Einkaufsliste vollständig abgehakt', icon: 'shopping-cart', category: 'lists', xpReward: 15, requirement: 1, isHidden: false, type: 'repeatable', tier: 1 },

    // ============================================
    // PROJECTS
    // ============================================
    { key: 'first_project', name: 'Projektstarter', description: 'Erstes Projekt erstellt', icon: 'folder', category: 'projects', xpReward: 15, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'projects_5', name: 'Multitasker', description: '5 Projekte erstellt', icon: 'folders', category: 'projects', xpReward: 50, requirement: 5, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'project_completed', name: 'Projekt abgeschlossen', description: 'Ein Projekt erfolgreich beendet', icon: 'flag-checkered', category: 'projects', xpReward: 100, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },
    { key: 'projects_completed_10', name: 'Projektmeister', description: '10 Projekte abgeschlossen', icon: 'medal', category: 'projects', xpReward: 500, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'projects_completed_50', name: 'Projekt-Legende', description: '50 Projekte abgeschlossen', icon: 'trophy', category: 'projects', xpReward: 2000, requirement: 50, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'tasks_100', name: 'Task-Jäger', description: '100 Projekt-Tasks erledigt', icon: 'target', category: 'projects', xpReward: 150, requirement: 100, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'tasks_1000', name: 'Task-Meister', description: '1000 Projekt-Tasks erledigt', icon: 'crown', category: 'projects', xpReward: 1000, requirement: 1000, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // INVENTORY
    // ============================================
    { key: 'first_item', name: 'Sammler', description: 'Erstes Item erfasst', icon: 'box', category: 'inventory', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'items_25', name: 'Ordnungsliebend', description: '25 Items erfasst', icon: 'boxes', category: 'inventory', xpReward: 40, requirement: 25, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'items_100', name: 'Inventarmeister', description: '100 Items erfasst', icon: 'warehouse', category: 'inventory', xpReward: 150, requirement: 100, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'items_500', name: 'Großlager', description: '500 Items erfasst', icon: 'building', category: 'inventory', xpReward: 500, requirement: 500, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'items_1000', name: 'Lagerkönig', description: '1000 Items erfasst', icon: 'castle', category: 'inventory', xpReward: 1500, requirement: 1000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'item_lent', name: 'Verleiher', description: 'Ein Item verliehen', icon: 'hand-move', category: 'inventory', xpReward: 10, requirement: 1, isHidden: false, type: 'repeatable', tier: 1 },
    { key: 'item_found', name: 'Finder', description: 'Ein verlorenes Item wiedergefunden', icon: 'search', category: 'inventory', xpReward: 25, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },

    // ============================================
    // MEDIA
    // ============================================
    { key: 'first_media', name: 'Mediensammler', description: 'Erstes Medium hinzugefügt', icon: 'device-tv', category: 'media', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'media_10', name: 'Filmfan', description: '10 Medien hinzugefügt', icon: 'movie', category: 'media', xpReward: 30, requirement: 10, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'media_50', name: 'Cineast', description: '50 Medien hinzugefügt', icon: 'popcorn', category: 'media', xpReward: 100, requirement: 50, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'media_completed_10', name: 'Binge-Watcher', description: '10 Medien abgeschlossen', icon: 'player-play', category: 'media', xpReward: 75, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'media_completed_50', name: 'Serien-Junkie', description: '50 Medien abgeschlossen', icon: 'player-stop', category: 'media', xpReward: 250, requirement: 50, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'media_completed_100', name: 'Entertainment-König', description: '100 Medien abgeschlossen', icon: 'crown', category: 'media', xpReward: 600, requirement: 100, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'media_completed_500', name: 'Kulturbanause (im besten Sinne)', description: '500 Medien abgeschlossen', icon: 'trophy', category: 'media', xpReward: 2500, requirement: 500, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'books_read_10', name: 'Leseratte', description: '10 Bücher gelesen', icon: 'book', category: 'media', xpReward: 100, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'books_read_50', name: 'Bücherwurm', description: '50 Bücher gelesen', icon: 'books', category: 'media', xpReward: 500, requirement: 50, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'books_read_100', name: 'Bibliothekswächter', description: '100 Bücher gelesen', icon: 'library', category: 'media', xpReward: 1500, requirement: 100, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'rated_50', name: 'Kritiker', description: '50 Medien bewertet', icon: 'star-half', category: 'media', xpReward: 100, requirement: 50, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'weekly_watcher', name: 'Wöchentlicher Genuss', description: 'Diese Woche ein Medium abgeschlossen', icon: 'calendar-event', category: 'media', xpReward: 20, requirement: 1, isHidden: false, type: 'weekly', resetPeriod: 'weekly', tier: 1 },

    // ============================================
    // MEALS
    // ============================================
    { key: 'first_recipe', name: 'Koch-Anfänger', description: 'Erstes Rezept erstellt', icon: 'chef-hat', category: 'meals', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'recipes_10', name: 'Rezeptsammler', description: '10 Rezepte erstellt', icon: 'salad', category: 'meals', xpReward: 40, requirement: 10, isHidden: false, type: 'one_time', tier: 2 },
    { key: 'recipes_50', name: 'Hobbykoch', description: '50 Rezepte erstellt', icon: 'meat', category: 'meals', xpReward: 150, requirement: 50, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'recipes_100', name: 'Meisterkoch', description: '100 Rezepte erstellt', icon: 'grill', category: 'meals', xpReward: 400, requirement: 100, isHidden: true, type: 'one_time', tier: 4 },
    { key: 'meal_planned', name: 'Vorausplaner', description: 'Wochenplan erstellt', icon: 'calendar', category: 'meals', xpReward: 25, requirement: 1, isHidden: false, type: 'repeatable', resetPeriod: 'weekly', tier: 2 },
    { key: 'meal_plans_10', name: 'Planungsmeister', description: '10 Wochenpläne erstellt', icon: 'calendar-stats', category: 'meals', xpReward: 150, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'healthy_week', name: 'Gesundheitswoche', description: 'Eine Woche nur gesunde Mahlzeiten geplant', icon: 'heart', category: 'meals', xpReward: 75, requirement: 1, isHidden: false, type: 'repeatable', tier: 3 },

    // ============================================
    // WISHLISTS
    // ============================================
    { key: 'first_wish', name: 'Wunschdenker', description: 'Ersten Wunsch hinzugefügt', icon: 'gift', category: 'wishlists', xpReward: 10, requirement: 1, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'wishes_10', name: 'Träumer', description: '10 Wünsche hinzugefügt', icon: 'stars', category: 'wishlists', xpReward: 30, requirement: 10, isHidden: false, type: 'one_time', tier: 1 },
    { key: 'wish_fulfilled', name: 'Wunsch erfüllt!', description: 'Einen Wunsch erfüllt bekommen', icon: 'sparkles', category: 'wishlists', xpReward: 50, requirement: 1, isHidden: false, type: 'repeatable', tier: 2 },
    { key: 'wishes_fulfilled_10', name: 'Glückspilz', description: '10 Wünsche erfüllt', icon: 'star', category: 'wishlists', xpReward: 200, requirement: 10, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'gift_given', name: 'Geber', description: 'Ein Geschenk verschenkt', icon: 'heart-handshake', category: 'wishlists', xpReward: 25, requirement: 1, isHidden: false, type: 'repeatable', tier: 1 },
    { key: 'gifts_given_25', name: 'Großzügig', description: '25 Geschenke verschenkt', icon: 'gift', category: 'wishlists', xpReward: 300, requirement: 25, isHidden: false, type: 'one_time', tier: 3 },
    { key: 'gifts_given_100', name: 'Weihnachtsmann', description: '100 Geschenke verschenkt', icon: 'gift-card', category: 'wishlists', xpReward: 1000, requirement: 100, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // LEGENDARY (Ultra-schwierig)
    // ============================================
    { key: 'ultimate_organizer', name: 'Ultimativer Organisierer', description: '10000 Aktionen insgesamt durchgeführt', icon: 'diamond', category: 'legendary', xpReward: 10000, requirement: 10000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'xp_master', name: 'XP-Meister', description: '100000 XP gesammelt', icon: 'infinity', category: 'legendary', xpReward: 5000, requirement: 100000, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'achievement_hunter', name: 'Achievement-Jäger', description: '50 Achievements freigeschaltet', icon: 'trophy', category: 'legendary', xpReward: 2000, requirement: 50, isHidden: false, type: 'one_time', tier: 4 },
    { key: 'all_achievements', name: 'Perfektionist', description: 'Alle verfügbaren Achievements freigeschaltet', icon: 'crown', category: 'legendary', xpReward: 25000, requirement: 1, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'two_year_user', name: 'Zwei-Jahres-Veteran', description: 'Nutzt die App seit 2 Jahren', icon: 'cake', category: 'legendary', xpReward: 5000, requirement: 730, isHidden: true, type: 'one_time', tier: 5 },
    { key: 'five_year_user', name: 'Fünf-Jahres-Legende', description: 'Nutzt die App seit 5 Jahren', icon: 'medal', category: 'legendary', xpReward: 25000, requirement: 1825, isHidden: true, type: 'one_time', tier: 5 },

    // ============================================
    // DYNAMIC/REPEATABLE CHALLENGES
    // ============================================
    { key: 'daily_login', name: 'Täglich dabei', description: 'Heute eingeloggt', icon: 'sun', category: 'general', xpReward: 5, requirement: 1, isHidden: false, type: 'daily', resetPeriod: 'daily', tier: 1 },
    { key: 'weekly_warrior', name: 'Wochenkrieger', description: 'Diese Woche jeden Tag aktiv', icon: 'calendar-week', category: 'general', xpReward: 50, requirement: 7, isHidden: false, type: 'weekly', resetPeriod: 'weekly', tier: 2 },
    { key: 'monthly_master', name: 'Monatsmeister', description: 'Diesen Monat jeden Tag aktiv', icon: 'calendar-month', category: 'general', xpReward: 250, requirement: 30, isHidden: false, type: 'monthly', resetPeriod: 'monthly', tier: 4 },
    { key: 'power_user_week', name: 'Power-User Woche', description: '100 Aktionen diese Woche', icon: 'bolt', category: 'general', xpReward: 100, requirement: 100, isHidden: false, type: 'weekly', resetPeriod: 'weekly', tier: 3 },
    { key: 'extreme_week', name: 'Extreme Woche', description: '500 Aktionen diese Woche', icon: 'flame', category: 'general', xpReward: 500, requirement: 500, isHidden: false, type: 'weekly', resetPeriod: 'weekly', tier: 5 },
];

export class GamificationService {
    constructor(
        private db: AppDatabase,
        private notificationService: NotificationService
    ) {}

    async initializeAchievements(): Promise<void> {
        for (const achievementData of DEFAULT_ACHIEVEMENTS) {

            const exists = await this.db.query(Achievement)
                .filter({ key: achievementData.key })
                .findOneOrUndefined();

            if ( exists ) continue;

            const achievement = new Achievement();
            achievement.id = uuidv4();
            achievement.key = achievementData.key;
            achievement.name = achievementData.name;
            achievement.description = achievementData.description;
            achievement.icon = achievementData.icon;
            achievement.category = achievementData.category;
            achievement.xpReward = achievementData.xpReward;
            achievement.requirement = achievementData.requirement;
            achievement.isHidden = achievementData.isHidden;
            achievement.type = achievementData.type;
            achievement.resetPeriod = achievementData.resetPeriod;
            achievement.tier = achievementData.tier;
            achievement.createdAt = new Date();

            await this.db.persist(achievement);
        }
    }

    async awardXp(userId: string, amount: number, _reason?: string): Promise<XpAwardResult> {
        const user = await this.db.query(User)
            .filter({ id: userId })
            .findOne();

        const previousLevel = user.level;
        const previousXp = user.xp;

        user.xp = previousXp + amount;
        user.level = calculateLevel(user.xp);
        user.updatedAt = new Date();

        await this.db.persist(user);

        return {
            xpAwarded: amount,
            newXp: user.xp,
            newLevel: user.level,
            leveledUp: user.level > previousLevel,
            previousLevel,
        };
    }

    async checkAndUnlockAchievement(userId: string, achievementKey: string): Promise<AchievementPublic | null> {
        // Get all user achievements and check if already unlocked
        const userAchievements = await this.db.query(UserAchievement)
            .filter({ userId })
            .find();

        // Get achievement IDs the user has
        const unlockedAchievementIds = userAchievements.map(ua => ua.achievementId);

        // Get all achievements to check if key is already unlocked
        const achievements = await this.db.query(Achievement).find();
        const achievementByKey = achievements.find(a => a.key === achievementKey);

        if (!achievementByKey) {
            return null;
        }

        if (unlockedAchievementIds.includes(achievementByKey.id)) {
            return null;
        }

        // Unlock achievement
        const userAchievement = new UserAchievement();
        userAchievement.id = uuidv4();
        userAchievement.userId = userId;
        userAchievement.achievementId = achievementByKey.id;
        userAchievement.unlockedAt = new Date();

        await this.db.persist(userAchievement);

        // Award XP for achievement
        await this.awardXp(userId, achievementByKey.xpReward);

        // Create notification
        await this.notificationService.create(
            userId,
            'achievement',
            `Achievement freigeschaltet: ${achievementByKey.name}`,
            `${achievementByKey.description} (+${achievementByKey.xpReward} XP)`
        );

        return {
            id: achievementByKey.id,
            key: achievementByKey.key,
            name: achievementByKey.name,
            description: achievementByKey.description,
            icon: achievementByKey.icon,
            category: achievementByKey.category,
            xpReward: achievementByKey.xpReward,
            type: achievementByKey.type,
            tier: achievementByKey.tier,
            unlockedAt: userAchievement.unlockedAt,
        };
    }

    async getUserAchievements(userId: string): Promise<AchievementPublic[]> {
        const userAchievements = await this.db.query(UserAchievement)
            .filter({ userId })
            .find();

        if (userAchievements.length === 0) {
            return [];
        }

        const achievementIds = userAchievements.map(ua => ua.achievementId);
        const achievements = await this.db.query(Achievement)
            .filter({ id: { $in: achievementIds } })
            .find();

        const achievementMap = new Map(achievements.map(a => [a.id, a]));

        return userAchievements
            .filter(ua => achievementMap.has(ua.achievementId))
            .map(ua => {
                const achievement = achievementMap.get(ua.achievementId)!;
                return {
                    id: achievement.id,
                    key: achievement.key,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    category: achievement.category,
                    xpReward: achievement.xpReward,
                    type: achievement.type,
                    tier: achievement.tier,
                    unlockedAt: ua.unlockedAt,
                };
            });
    }

    async getRecentAchievements(userId: string, limit = 3): Promise<AchievementPublic[]> {
        const userAchievements = await this.db.query(UserAchievement)
            .filter({ userId })
            .orderBy('unlockedAt', 'desc')
            .limit(limit)
            .find();

        if (userAchievements.length === 0) {
            return [];
        }

        const achievementIds = userAchievements.map(ua => ua.achievementId);
        const achievements = await this.db.query(Achievement)
            .filter({ id: { $in: achievementIds } })
            .find();

        const achievementMap = new Map(achievements.map(a => [a.id, a]));

        return userAchievements
            .filter(ua => achievementMap.has(ua.achievementId))
            .map(ua => {
                const achievement = achievementMap.get(ua.achievementId)!;
                return {
                    id: achievement.id,
                    key: achievement.key,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    category: achievement.category,
                    xpReward: achievement.xpReward,
                    type: achievement.type,
                    tier: achievement.tier,
                    unlockedAt: ua.unlockedAt,
                };
            });
    }

    async getAllAchievements(): Promise<Achievement[]> {
        return this.db.query(Achievement)
            .filter({ isHidden: false })
            .find();
    }

    getXpForAction(action: keyof typeof XP_ACTIONS): number {
        return XP_ACTIONS[action];
    }

    getXpProgress(xp: number, level: number) {
        return xpProgressInLevel(xp, level);
    }
}
