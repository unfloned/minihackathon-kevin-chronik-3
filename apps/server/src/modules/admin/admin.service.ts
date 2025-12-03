import { HttpError } from '@deepkit/http';
import { v4 as uuidv4 } from 'uuid';
import { AppDatabase } from '../../app/database';
import { AuthService } from '../auth/auth.service';
import {
    User,
    Habit,
    HabitLog,
    Expense,
    ExpenseCategory,
    Deadline,
    Subscription,
    Note,
    List,
    Project,
    InventoryItem,
    Application,
    MediaItem,
    Meal,
    WishlistItem,
    Wishlist,
    UserAchievement,
    Notification,
} from '@ycmm/core';

export class AdminService {
    constructor(
        private db: AppDatabase,
        private authService: AuthService
    ) {}

    async checkAdminAccess(user: User): Promise<void> {
        if (!user.isAdmin) {
            throw new HttpError('Admin-Zugang erforderlich', 403);
        }
    }

    async getAllUsers(): Promise<User[]> {
        return this.db.query(User).find();
    }

    async setUserAdmin(userId: string, isAdmin: boolean): Promise<User> {
        const user = await this.db.query(User)
            .filter({ id: userId })
            .findOneOrUndefined();

        if (!user) {
            throw new Error('User nicht gefunden');
        }

        user.isAdmin = isAdmin;
        user.updatedAt = new Date();
        await this.db.persist(user);

        return user;
    }

    async deleteUserData(userId: string): Promise<void> {
        // Delete all user-related data
        const tables = [
            { query: this.db.query(HabitLog), filter: { userId } },
            { query: this.db.query(Habit), filter: { userId } },
            { query: this.db.query(Expense), filter: { userId } },
            { query: this.db.query(ExpenseCategory), filter: { userId } },
            { query: this.db.query(Deadline), filter: { userId } },
            { query: this.db.query(Subscription), filter: { userId } },
            { query: this.db.query(Note), filter: { userId } },
            { query: this.db.query(List), filter: { userId } },
            { query: this.db.query(Project), filter: { userId } },
            { query: this.db.query(InventoryItem), filter: { userId } },
            { query: this.db.query(Application), filter: { userId } },
            { query: this.db.query(MediaItem), filter: { userId } },
            { query: this.db.query(Meal), filter: { userId } },
            { query: this.db.query(WishlistItem), filter: { userId } },
            { query: this.db.query(Wishlist), filter: { userId } },
            { query: this.db.query(UserAchievement), filter: { userId } },
            { query: this.db.query(Notification), filter: { userId } },
        ];

        for (const { query, filter } of tables) {
            const items = await query.filter(filter).find();
            for (const item of items) {
                await this.db.remove(item);
            }
        }
    }

    async resetDemoData(): Promise<void> {
        const demoUserId = AuthService.DEMO_USER_ID;

        // First delete all existing demo data
        await this.deleteUserData(demoUserId);

        // Ensure demo user exists
        await this.authService.createDemoUser();

        // Seed fresh demo data
        await this.seedDemoData(demoUserId);
    }

    async seedDemoData(userId: string): Promise<void> {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // ===== HABITS =====
        const habits: Habit[] = [
            this.createHabit(userId, {
                name: 'Meditation',
                description: '10 Minuten Achtsamkeit am Morgen',
                icon: '🧘',
                color: '#7C3AED',
                type: 'boolean',
                frequency: 'daily',
                currentStreak: 12,
                longestStreak: 21,
                totalCompletions: 45,
            }),
            this.createHabit(userId, {
                name: 'Sport',
                description: 'Mindestens 30 Minuten Bewegung',
                icon: '💪',
                color: '#EF4444',
                type: 'boolean',
                frequency: 'daily',
                currentStreak: 5,
                longestStreak: 14,
                totalCompletions: 32,
            }),
            this.createHabit(userId, {
                name: 'Wasser trinken',
                description: '2 Liter Wasser pro Tag',
                icon: '💧',
                color: '#3B82F6',
                type: 'quantity',
                targetValue: 8,
                unit: 'Gläser',
                frequency: 'daily',
                currentStreak: 8,
                longestStreak: 30,
                totalCompletions: 67,
            }),
            this.createHabit(userId, {
                name: 'Lesen',
                description: '30 Minuten lesen vor dem Schlafen',
                icon: '📚',
                color: '#F59E0B',
                type: 'duration',
                targetValue: 30,
                unit: 'minutes',
                frequency: 'daily',
                currentStreak: 3,
                longestStreak: 18,
                totalCompletions: 28,
            }),
        ];

        for (const habit of habits) {
            await this.db.persist(habit);
        }

        // ===== EXPENSE CATEGORIES =====
        const categories: ExpenseCategory[] = [
            this.createExpenseCategory(userId, { name: 'Lebensmittel', icon: '🛒', color: '#22C55E', budget: 400 }),
            this.createExpenseCategory(userId, { name: 'Transport', icon: '🚗', color: '#3B82F6', budget: 150 }),
            this.createExpenseCategory(userId, { name: 'Unterhaltung', icon: '🎬', color: '#EF4444', budget: 100 }),
            this.createExpenseCategory(userId, { name: 'Restaurant', icon: '🍽️', color: '#F59E0B', budget: 200 }),
            this.createExpenseCategory(userId, { name: 'Shopping', icon: '🛍️', color: '#EC4899', budget: 150 }),
        ];

        for (const cat of categories) {
            await this.db.persist(cat);
        }

        // ===== EXPENSES =====
        const expenses: Expense[] = [
            this.createExpense(userId, categories[0].id, { amount: 85.50, description: 'Wocheneinkauf REWE', date: today }),
            this.createExpense(userId, categories[3].id, { amount: 42.00, description: 'Sushi Restaurant', date: today }),
            this.createExpense(userId, categories[1].id, { amount: 49.00, description: 'Deutschland-Ticket', date: today, isRecurring: true, recurringInterval: 'monthly' }),
            this.createExpense(userId, categories[2].id, { amount: 15.99, description: 'Kino', date: today }),
        ];

        for (const exp of expenses) {
            await this.db.persist(exp);
        }

        // ===== DEADLINES =====
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const deadlines: Deadline[] = [
            this.createDeadline(userId, {
                title: 'Steuererklärung abgeben',
                description: 'Alle Belege sammeln und Elster ausfüllen',
                dueDate: nextMonth.toISOString().split('T')[0],
                priority: 'high',
                category: 'Finanzen',
                color: '#EF4444',
                reminderDaysBefore: 7,
            }),
            this.createDeadline(userId, {
                title: 'Zahnarzt Termin',
                description: 'Routinekontrolle',
                dueDate: nextWeek.toISOString().split('T')[0],
                priority: 'medium',
                category: 'Gesundheit',
                color: '#3B82F6',
                reminderDaysBefore: 1,
            }),
            this.createDeadline(userId, {
                title: 'Geburtstagsgeschenk für Mama',
                description: 'Etwas Schönes besorgen',
                dueDate: nextWeek.toISOString().split('T')[0],
                priority: 'high',
                category: 'Familie',
                color: '#EC4899',
                reminderDaysBefore: 3,
            }),
        ];

        for (const dl of deadlines) {
            await this.db.persist(dl);
        }

        // ===== SUBSCRIPTIONS =====
        const subscriptions: Subscription[] = [
            this.createSubscription(userId, {
                name: 'Netflix',
                description: 'Standard-Abo',
                amount: 12.99,
                billingCycle: 'monthly',
                billingDay: 15,
                nextBillingDate: nextMonth.toISOString().split('T')[0],
                category: 'Streaming',
                color: '#E50914',
                icon: '📺',
                website: 'https://netflix.com',
                startDate: '2023-01-15',
            }),
            this.createSubscription(userId, {
                name: 'Spotify',
                description: 'Premium Family',
                amount: 17.99,
                billingCycle: 'monthly',
                billingDay: 1,
                nextBillingDate: nextMonth.toISOString().split('T')[0],
                category: 'Musik',
                color: '#1DB954',
                icon: '🎵',
                website: 'https://spotify.com',
                startDate: '2022-06-01',
            }),
            this.createSubscription(userId, {
                name: 'ChatGPT Plus',
                description: 'GPT-4 Zugang',
                amount: 20.00,
                billingCycle: 'monthly',
                billingDay: 10,
                nextBillingDate: nextMonth.toISOString().split('T')[0],
                category: 'Tools',
                color: '#10A37F',
                icon: '🤖',
                website: 'https://chat.openai.com',
                startDate: '2024-01-10',
            }),
        ];

        for (const sub of subscriptions) {
            await this.db.persist(sub);
        }

        // ===== MEDIA ITEMS =====
        const mediaItems: MediaItem[] = [
            this.createMediaItem(userId, {
                title: 'Breaking Bad',
                type: 'series',
                status: 'completed',
                rating: 10,
                review: 'Eine der besten Serien aller Zeiten!',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
            }),
            this.createMediaItem(userId, {
                title: 'The Last of Us',
                type: 'series',
                status: 'in_progress',
                progress: { current: 5, total: 9, unit: 'Episoden' },
                review: 'Sehr emotional und packend',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BZGUzYTI3M2EtZmM0Yy00NGUyLWI4ODEtN2Q3ZGJlYzhhZjU3XkEyXkFqcGdeQXVyNTM0OTY1OQ@@._V1_.jpg',
            }),
            this.createMediaItem(userId, {
                title: 'Dune: Part Two',
                type: 'movie',
                status: 'wishlist',
                review: 'Unbedingt im IMAX schauen!',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg',
            }),
            this.createMediaItem(userId, {
                title: 'Atomic Habits',
                type: 'book',
                status: 'completed',
                rating: 9,
                creator: 'James Clear',
                review: 'Super hilfreich für Gewohnheitsbildung',
            }),
            this.createMediaItem(userId, {
                title: 'Baldur\'s Gate 3',
                type: 'game',
                status: 'in_progress',
                rating: 10,
                source: 'Steam',
                review: 'RPG des Jahres!',
                coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202302/2321/ba706e54d68d10a0eb6ab7c36cdad9178c58b7fb9e4791f8.png',
            }),
        ];

        for (const media of mediaItems) {
            await this.db.persist(media);
        }

        // ===== PROJECTS =====
        const projects: Project[] = [
            this.createProject(userId, {
                name: 'Website Redesign',
                description: 'Komplette Überarbeitung der persönlichen Portfolio-Website',
                type: 'project',
                status: 'active',
                progress: 65,
                color: '#3B82F6',
                startDate: new Date('2024-01-01'),
                tasks: [
                    { id: '1', title: 'Design-Konzept erstellen', completed: true, priority: 'high', order: 0 },
                    { id: '2', title: 'Wireframes zeichnen', completed: true, priority: 'high', order: 1 },
                    { id: '3', title: 'Frontend implementieren', completed: false, priority: 'high', order: 2 },
                    { id: '4', title: 'Backend API bauen', completed: false, priority: 'medium', order: 3 },
                    { id: '5', title: 'Testing & Bugfixing', completed: false, priority: 'medium', order: 4 },
                ],
                milestones: [
                    { id: '1', title: 'MVP fertig', targetDate: nextMonth.toISOString(), completed: false },
                ],
            }),
            this.createProject(userId, {
                name: 'Deutsch B2 Zertifikat',
                description: 'Deutsch auf B2-Niveau erreichen',
                type: 'goal',
                status: 'active',
                progress: 40,
                color: '#F59E0B',
                tasks: [
                    { id: '1', title: 'Sprachkurs anmelden', completed: true, priority: 'high', order: 0 },
                    { id: '2', title: 'Vokabeln lernen (500 Wörter)', completed: false, priority: 'medium', order: 1 },
                    { id: '3', title: 'Grammatik Übungen', completed: false, priority: 'medium', order: 2 },
                    { id: '4', title: 'Prüfung ablegen', completed: false, priority: 'high', order: 3 },
                ],
                milestones: [],
            }),
        ];

        for (const proj of projects) {
            await this.db.persist(proj);
        }

        // ===== NOTES =====
        const notes: Note[] = [
            this.createNote(userId, {
                title: 'Meeting Notizen',
                content: '# Team Meeting 15.11.\n\n## Agenda\n- Sprint Review\n- Neue Features besprechen\n- Roadmap Q1 2025\n\n## Action Items\n- [ ] Design Review mit Lisa\n- [ ] API Dokumentation updaten\n- [x] Deployment Pipeline fixen',
                color: '#3B82F6',
                isPinned: true,
            }),
            this.createNote(userId, {
                title: 'Bucket List 2025',
                content: '# Bucket List\n\n1. 🏔️ Alpen wandern\n2. 🎸 Gitarre lernen\n3. 🇯🇵 Japan besuchen\n4. 📖 20 Bücher lesen\n5. 🏃 Halbmarathon laufen',
                color: '#22C55E',
                isPinned: false,
            }),
            this.createNote(userId, {
                title: 'Rezept: Pasta Carbonara',
                content: '# Pasta Carbonara\n\n## Zutaten\n- 400g Spaghetti\n- 200g Guanciale\n- 4 Eigelb\n- 100g Pecorino\n- Schwarzer Pfeffer\n\n## Zubereitung\n1. Pasta kochen\n2. Guanciale knusprig braten\n3. Eigelb mit Käse mischen\n4. Alles vermengen (Herd aus!)',
                color: '#F59E0B',
                isPinned: false,
            }),
        ];

        for (const note of notes) {
            await this.db.persist(note);
        }

        // ===== LISTS =====
        const lists: List[] = [
            this.createList(userId, {
                name: 'Einkaufsliste',
                icon: '🛒',
                color: '#22C55E',
                type: 'shopping',
                items: [
                    { id: '1', text: 'Milch', completed: false, order: 0 },
                    { id: '2', text: 'Brot', completed: true, order: 1 },
                    { id: '3', text: 'Eier', completed: false, order: 2 },
                    { id: '4', text: 'Käse', completed: false, order: 3 },
                    { id: '5', text: 'Tomaten', completed: true, order: 4 },
                ],
            }),
            this.createList(userId, {
                name: 'Packliste Urlaub',
                icon: '🧳',
                color: '#3B82F6',
                type: 'packing',
                items: [
                    { id: '1', text: 'Reisepass', completed: true, order: 0 },
                    { id: '2', text: 'Ladekabel', completed: true, order: 1 },
                    { id: '3', text: 'Sonnencreme', completed: false, order: 2 },
                    { id: '4', text: 'Badehose', completed: false, order: 3 },
                    { id: '5', text: 'Reiseadapter', completed: false, order: 4 },
                ],
            }),
        ];

        for (const list of lists) {
            await this.db.persist(list);
        }

        // ===== INVENTORY =====
        const inventory: InventoryItem[] = [
            this.createInventoryItem(userId, { name: 'MacBook Pro 14"', category: 'Elektronik', location: { area: 'Büro' }, purchaseDate: new Date('2023-06-15'), purchasePrice: 2499, description: 'M3 Pro, 18GB RAM' }),
            this.createInventoryItem(userId, { name: 'iPhone 15 Pro', category: 'Elektronik', location: { area: 'Tasche' }, purchaseDate: new Date('2023-09-22'), purchasePrice: 1199 }),
            this.createInventoryItem(userId, { name: 'Sony WH-1000XM5', category: 'Elektronik', location: { area: 'Büro' }, purchaseDate: new Date('2023-03-10'), purchasePrice: 379, description: 'Noise Cancelling Kopfhörer' }),
            this.createInventoryItem(userId, { name: 'IKEA MARKUS', category: 'Möbel', location: { area: 'Büro' }, purchaseDate: new Date('2022-01-20'), purchasePrice: 229, description: 'Bürostuhl' }),
        ];

        for (const inv of inventory) {
            await this.db.persist(inv);
        }

        // ===== APPLICATIONS =====
        const applications: Application[] = [
            this.createApplication(userId, {
                companyName: 'Tech Corp GmbH',
                jobTitle: 'Senior Frontend Developer',
                status: 'interviewed',
                salary: { min: 70000, max: 80000, currency: 'EUR' },
                location: 'Berlin',
                remote: 'hybrid',
                notes: 'Sehr interessantes Projekt, Team wirkt sympathisch',
                appliedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            }),
            this.createApplication(userId, {
                companyName: 'Startup XYZ',
                jobTitle: 'Full Stack Developer',
                status: 'applied',
                salary: { min: 60000, max: 70000, currency: 'EUR' },
                location: 'Remote',
                remote: 'remote',
                notes: 'Spannende Technologien, aber noch Early Stage',
                appliedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            }),
        ];

        for (const app of applications) {
            await this.db.persist(app);
        }

        // ===== WISHLISTS =====
        const wishlist = new Wishlist();
        wishlist.id = uuidv4();
        wishlist.userId = userId;
        wishlist.name = 'Technik Wünsche';
        wishlist.description = 'Gadgets die ich mir wünsche';
        wishlist.isPublic = false;
        wishlist.createdAt = now;
        wishlist.updatedAt = now;
        await this.db.persist(wishlist);

        const wishlistItems: WishlistItem[] = [
            this.createWishlistItem(userId, { name: 'Steam Deck OLED', price: { amount: 569, currency: 'EUR' }, productUrl: 'https://store.steampowered.com/steamdeck', priority: 'high', notes: 'Für unterwegs zocken', category: 'tech' }),
            this.createWishlistItem(userId, { name: 'Kindle Paperwhite', price: { amount: 149, currency: 'EUR' }, productUrl: 'https://amazon.de', priority: 'medium', notes: 'Zum Lesen im Urlaub', category: 'tech' }),
        ];

        for (const item of wishlistItems) {
            await this.db.persist(item);
        }

        // Create notification
        const notification = new Notification();
        notification.id = uuidv4();
        notification.userId = userId;
        notification.type = 'info';
        notification.title = 'Willkommen zur Demo!';
        notification.message = 'Erkunde alle Features von YCMM. Die Demo-Daten werden regelmäßig zurückgesetzt.';
        notification.isRead = false;
        notification.createdAt = now;
        await this.db.persist(notification);
    }

    // Helper methods
    private createHabit(userId: string, data: Partial<Habit>): Habit {
        const habit = new Habit();
        habit.id = uuidv4();
        habit.userId = userId;
        habit.name = data.name || '';
        habit.description = data.description;
        habit.icon = data.icon || '✅';
        habit.color = data.color || '#228be6';
        habit.type = data.type || 'boolean';
        habit.targetValue = data.targetValue;
        habit.unit = data.unit;
        habit.frequency = data.frequency || 'daily';
        habit.currentStreak = data.currentStreak || 0;
        habit.longestStreak = data.longestStreak || 0;
        habit.totalCompletions = data.totalCompletions || 0;
        habit.isArchived = false;
        habit.createdAt = new Date();
        habit.updatedAt = new Date();
        return habit;
    }

    private createExpenseCategory(userId: string, data: Partial<ExpenseCategory>): ExpenseCategory {
        const cat = new ExpenseCategory();
        cat.id = uuidv4();
        cat.userId = userId;
        cat.name = data.name || '';
        cat.icon = data.icon || '💰';
        cat.color = data.color || '#228be6';
        cat.budget = data.budget;
        cat.isDefault = true;
        cat.createdAt = new Date();
        return cat;
    }

    private createExpense(userId: string, categoryId: string, data: Partial<Expense>): Expense {
        const exp = new Expense();
        exp.id = uuidv4();
        exp.userId = userId;
        exp.categoryId = categoryId;
        exp.amount = data.amount || 0;
        exp.description = data.description || '';
        exp.date = data.date || new Date().toISOString().split('T')[0];
        exp.isRecurring = data.isRecurring || false;
        exp.recurringInterval = data.recurringInterval;
        exp.createdAt = new Date();
        exp.updatedAt = new Date();
        return exp;
    }

    private createDeadline(userId: string, data: Partial<Deadline>): Deadline {
        const dl = new Deadline();
        dl.id = uuidv4();
        dl.userId = userId;
        dl.title = data.title || '';
        dl.description = data.description;
        dl.dueDate = data.dueDate || new Date().toISOString().split('T')[0];
        dl.priority = data.priority || 'medium';
        dl.status = 'pending';
        dl.category = data.category;
        dl.color = data.color || '#228be6';
        dl.reminderEnabled = true;
        dl.reminderDaysBefore = data.reminderDaysBefore;
        dl.createdAt = new Date();
        dl.updatedAt = new Date();
        return dl;
    }

    private createSubscription(userId: string, data: Partial<Subscription>): Subscription {
        const sub = new Subscription();
        sub.id = uuidv4();
        sub.userId = userId;
        sub.name = data.name || '';
        sub.description = data.description;
        sub.amount = data.amount || 0;
        sub.currency = 'EUR';
        sub.billingCycle = data.billingCycle || 'monthly';
        sub.billingDay = data.billingDay || 1;
        sub.nextBillingDate = data.nextBillingDate || new Date().toISOString().split('T')[0];
        sub.category = data.category;
        sub.color = data.color || '#228be6';
        sub.icon = data.icon;
        sub.website = data.website;
        sub.status = 'active';
        sub.reminderEnabled = true;
        sub.reminderDaysBefore = 3;
        sub.startDate = data.startDate || new Date().toISOString().split('T')[0];
        sub.createdAt = new Date();
        sub.updatedAt = new Date();
        return sub;
    }

    private createMediaItem(userId: string, data: Partial<MediaItem>): MediaItem {
        const media = new MediaItem();
        media.id = uuidv4();
        media.userId = userId;
        media.title = data.title || '';
        media.type = data.type || 'movie';
        media.status = data.status || 'wishlist';
        media.rating = data.rating;
        media.review = data.review || '';
        media.coverUrl = data.coverUrl || '';
        media.creator = data.creator || '';
        media.progress = data.progress;
        media.source = data.source || '';
        media.createdAt = new Date();
        media.updatedAt = new Date();
        return media;
    }

    private createProject(userId: string, data: Partial<Project>): Project {
        const proj = new Project();
        proj.id = uuidv4();
        proj.userId = userId;
        proj.name = data.name || '';
        proj.description = data.description || '';
        proj.type = data.type || 'project';
        proj.status = data.status || 'planning';
        proj.progress = data.progress || 0;
        proj.color = data.color || '#228be6';
        proj.startDate = data.startDate;
        proj.tasks = data.tasks || [];
        proj.milestones = data.milestones || [];
        proj.createdAt = new Date();
        proj.updatedAt = new Date();
        return proj;
    }

    private createNote(userId: string, data: Partial<Note>): Note {
        const note = new Note();
        note.id = uuidv4();
        note.userId = userId;
        note.title = data.title || '';
        note.content = data.content || '';
        note.color = data.color || '#228be6';
        note.isPinned = data.isPinned || false;
        note.createdAt = new Date();
        note.updatedAt = new Date();
        return note;
    }

    private createList(userId: string, data: Partial<List>): List {
        const list = new List();
        list.id = uuidv4();
        list.userId = userId;
        list.name = data.name || '';
        list.icon = data.icon || '📝';
        list.color = data.color || '#228be6';
        list.type = data.type || 'custom';
        list.items = data.items || [];
        list.createdAt = new Date();
        list.updatedAt = new Date();
        return list;
    }

    private createInventoryItem(userId: string, data: Partial<InventoryItem>): InventoryItem {
        const inv = new InventoryItem();
        inv.id = uuidv4();
        inv.userId = userId;
        inv.name = data.name || '';
        inv.description = data.description || '';
        inv.category = data.category || '';
        inv.location = data.location || { area: '' };
        inv.purchaseDate = data.purchaseDate;
        inv.purchasePrice = data.purchasePrice;
        inv.createdAt = new Date();
        inv.updatedAt = new Date();
        return inv;
    }

    private createApplication(userId: string, data: Partial<Application>): Application {
        const app = new Application();
        app.id = uuidv4();
        app.userId = userId;
        app.companyName = data.companyName || '';
        app.jobTitle = data.jobTitle || '';
        app.status = data.status || 'draft';
        app.salary = data.salary;
        app.location = data.location || '';
        app.remote = data.remote || 'onsite';
        app.notes = data.notes || '';
        app.appliedAt = data.appliedAt;
        app.createdAt = new Date();
        app.updatedAt = new Date();
        return app;
    }

    private createWishlistItem(userId: string, data: Partial<WishlistItem>): WishlistItem {
        const item = new WishlistItem();
        item.id = uuidv4();
        item.userId = userId;
        item.name = data.name || '';
        item.price = data.price;
        item.productUrl = data.productUrl || '';
        item.priority = data.priority || 'medium';
        item.notes = data.notes || '';
        item.category = data.category || 'other';
        item.createdAt = new Date();
        item.updatedAt = new Date();
        return item;
    }
}
