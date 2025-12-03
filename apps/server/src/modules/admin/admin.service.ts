import { HttpError } from '@deepkit/http';
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
        // Delete all user-related data - each entity needs separate query with proper join
        // Delete in order to respect foreign key constraints

        const habitLogs = await this.db.query(HabitLog).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of habitLogs) await this.db.remove(item);

        const habits = await this.db.query(Habit).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of habits) await this.db.remove(item);

        const expenses = await this.db.query(Expense).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of expenses) await this.db.remove(item);

        const categories = await this.db.query(ExpenseCategory).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of categories) await this.db.remove(item);

        const deadlines = await this.db.query(Deadline).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of deadlines) await this.db.remove(item);

        const subscriptions = await this.db.query(Subscription).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of subscriptions) await this.db.remove(item);

        const notes = await this.db.query(Note).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of notes) await this.db.remove(item);

        const lists = await this.db.query(List).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of lists) await this.db.remove(item);

        const projects = await this.db.query(Project).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of projects) await this.db.remove(item);

        const inventoryItems = await this.db.query(InventoryItem).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of inventoryItems) await this.db.remove(item);

        const applications = await this.db.query(Application).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of applications) await this.db.remove(item);

        const mediaItems = await this.db.query(MediaItem).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of mediaItems) await this.db.remove(item);

        const meals = await this.db.query(Meal).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of meals) await this.db.remove(item);

        const wishlistItems = await this.db.query(WishlistItem).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of wishlistItems) await this.db.remove(item);

        const wishlists = await this.db.query(Wishlist).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of wishlists) await this.db.remove(item);

        const userAchievements = await this.db.query(UserAchievement).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of userAchievements) await this.db.remove(item);

        const notifications = await this.db.query(Notification).useInnerJoinWith('user').filter({ id: userId }).end().find();
        for (const item of notifications) await this.db.remove(item);
    }

    async resetDemoData(): Promise<void> {
        const demoUserId = AuthService.DEMO_USER_ID;

        // First delete all existing demo data
        await this.deleteUserData(demoUserId);

        // Ensure demo user exists
        await this.authService.createDemoUser();

        // Fetch demo user for References
        const user = await this.db.query(User).filter({ id: demoUserId }).findOne();

        // Seed fresh demo data
        await this.seedDemoData(user);
    }

    async seedDemoData(user: User): Promise<void> {
        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // ===== HABITS =====
        const habits: Habit[] = [
            this.createHabit(user, {
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
            this.createHabit(user, {
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
            this.createHabit(user, {
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
            this.createHabit(user, {
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
            this.createExpenseCategory(user, { name: 'Lebensmittel', icon: '🛒', color: '#22C55E', budget: 400 }),
            this.createExpenseCategory(user, { name: 'Transport', icon: '🚗', color: '#3B82F6', budget: 150 }),
            this.createExpenseCategory(user, { name: 'Unterhaltung', icon: '🎬', color: '#EF4444', budget: 100 }),
            this.createExpenseCategory(user, { name: 'Restaurant', icon: '🍽️', color: '#F59E0B', budget: 200 }),
            this.createExpenseCategory(user, { name: 'Shopping', icon: '🛍️', color: '#EC4899', budget: 150 }),
        ];

        for (const cat of categories) {
            await this.db.persist(cat);
        }

        // ===== EXPENSES =====
        const expenses: Expense[] = [
            this.createExpense(user, categories[0], { amount: 85.50, description: 'Wocheneinkauf REWE', date: today }),
            this.createExpense(user, categories[3], { amount: 42.00, description: 'Sushi Restaurant', date: today }),
            this.createExpense(user, categories[1], { amount: 49.00, description: 'Deutschland-Ticket', date: today, isRecurring: true, recurringInterval: 'monthly' }),
            this.createExpense(user, categories[2], { amount: 15.99, description: 'Kino', date: today }),
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
            this.createDeadline(user, {
                title: 'Steuererklärung abgeben',
                description: 'Alle Belege sammeln und Elster ausfüllen',
                dueDate: nextMonth.toISOString().split('T')[0],
                priority: 'high',
                category: 'Finanzen',
                color: '#EF4444',
                reminderDaysBefore: 7,
            }),
            this.createDeadline(user, {
                title: 'Zahnarzt Termin',
                description: 'Routinekontrolle',
                dueDate: nextWeek.toISOString().split('T')[0],
                priority: 'medium',
                category: 'Gesundheit',
                color: '#3B82F6',
                reminderDaysBefore: 1,
            }),
            this.createDeadline(user, {
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
            this.createSubscription(user, {
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
            this.createSubscription(user, {
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
            this.createSubscription(user, {
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
            this.createMediaItem(user, {
                title: 'Breaking Bad',
                type: 'series',
                status: 'completed',
                rating: 10,
                review: 'Eine der besten Serien aller Zeiten!',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFjMjMtNjA5ZDdiYjdiODU5XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg',
            }),
            this.createMediaItem(user, {
                title: 'The Last of Us',
                type: 'series',
                status: 'in_progress',
                progress: { current: 5, total: 9, unit: 'Episoden' },
                review: 'Sehr emotional und packend',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BZGUzYTI3M2EtZmM0Yy00NGUyLWI4ODEtN2Q3ZGJlYzhhZjU3XkEyXkFqcGdeQXVyNTM0OTY1OQ@@._V1_.jpg',
            }),
            this.createMediaItem(user, {
                title: 'Dune: Part Two',
                type: 'movie',
                status: 'wishlist',
                review: 'Unbedingt im IMAX schauen!',
                coverUrl: 'https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWMzMy00NTc5LThlOGQtODhmNDI1NmY5YzAwXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg',
            }),
            this.createMediaItem(user, {
                title: 'Atomic Habits',
                type: 'book',
                status: 'completed',
                rating: 9,
                creator: 'James Clear',
                review: 'Super hilfreich für Gewohnheitsbildung',
            }),
            this.createMediaItem(user, {
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
            this.createProject(user, {
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
            this.createProject(user, {
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
            this.createNote(user, {
                title: 'Meeting Notizen',
                content: '# Team Meeting 15.11.\n\n## Agenda\n- Sprint Review\n- Neue Features besprechen\n- Roadmap Q1 2025\n\n## Action Items\n- [ ] Design Review mit Lisa\n- [ ] API Dokumentation updaten\n- [x] Deployment Pipeline fixen',
                color: '#3B82F6',
                isPinned: true,
            }),
            this.createNote(user, {
                title: 'Bucket List 2025',
                content: '# Bucket List\n\n1. 🏔️ Alpen wandern\n2. 🎸 Gitarre lernen\n3. 🇯🇵 Japan besuchen\n4. 📖 20 Bücher lesen\n5. 🏃 Halbmarathon laufen',
                color: '#22C55E',
                isPinned: false,
            }),
            this.createNote(user, {
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
            this.createList(user, {
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
            this.createList(user, {
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
            this.createInventoryItem(user, { name: 'MacBook Pro 14"', category: 'Elektronik', location: { area: 'Büro' }, purchaseDate: new Date('2023-06-15'), purchasePrice: 2499, description: 'M3 Pro, 18GB RAM' }),
            this.createInventoryItem(user, { name: 'iPhone 15 Pro', category: 'Elektronik', location: { area: 'Tasche' }, purchaseDate: new Date('2023-09-22'), purchasePrice: 1199 }),
            this.createInventoryItem(user, { name: 'Sony WH-1000XM5', category: 'Elektronik', location: { area: 'Büro' }, purchaseDate: new Date('2023-03-10'), purchasePrice: 379, description: 'Noise Cancelling Kopfhörer' }),
            this.createInventoryItem(user, { name: 'IKEA MARKUS', category: 'Möbel', location: { area: 'Büro' }, purchaseDate: new Date('2022-01-20'), purchasePrice: 229, description: 'Bürostuhl' }),
        ];

        for (const inv of inventory) {
            await this.db.persist(inv);
        }

        // ===== APPLICATIONS =====
        const applications: Application[] = [
            this.createApplication(user, {
                companyName: 'Tech Corp GmbH',
                jobTitle: 'Senior Frontend Developer',
                status: 'interviewed',
                salary: { min: 70000, max: 80000, currency: 'EUR' },
                location: 'Berlin',
                remote: 'hybrid',
                notes: 'Sehr interessantes Projekt, Team wirkt sympathisch',
                appliedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            }),
            this.createApplication(user, {
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
        wishlist.user = user;
        wishlist.name = 'Technik Wünsche';
        wishlist.description = 'Gadgets die ich mir wünsche';
        wishlist.isPublic = false;
        wishlist.createdAt = now;
        wishlist.updatedAt = now;
        await this.db.persist(wishlist);

        const wishlistItems: WishlistItem[] = [
            this.createWishlistItem(user, { name: 'Steam Deck OLED', price: { amount: 569, currency: 'EUR' }, productUrl: 'https://store.steampowered.com/steamdeck', priority: 'high', notes: 'Für unterwegs zocken', category: 'tech' }),
            this.createWishlistItem(user, { name: 'Kindle Paperwhite', price: { amount: 149, currency: 'EUR' }, productUrl: 'https://amazon.de', priority: 'medium', notes: 'Zum Lesen im Urlaub', category: 'tech' }),
        ];

        for (const item of wishlistItems) {
            await this.db.persist(item);
        }

        // ===== MEALS =====
        const meals: Meal[] = [
            this.createMeal(user, {
                name: 'Spaghetti Bolognese',
                description: 'Klassiker der italienischen Küche',
                mealType: ['dinner'],
                cuisine: 'Italienisch',
                prepTime: 15,
                cookTime: 45,
                servings: 4,
                ingredients: [
                    { name: 'Spaghetti', amount: '400', unit: 'g' },
                    { name: 'Hackfleisch', amount: '500', unit: 'g' },
                    { name: 'Zwiebel', amount: '1', unit: 'Stück' },
                    { name: 'Knoblauch', amount: '2', unit: 'Zehen' },
                    { name: 'Passierte Tomaten', amount: '500', unit: 'ml' },
                    { name: 'Tomatenmark', amount: '2', unit: 'EL' },
                    { name: 'Olivenöl', amount: '2', unit: 'EL' },
                    { name: 'Parmesan', amount: '50', unit: 'g' },
                ],
                instructions: '1. Zwiebel und Knoblauch fein hacken\n2. Hackfleisch in Olivenöl anbraten\n3. Zwiebel und Knoblauch dazugeben\n4. Tomatenmark kurz mitrösten\n5. Passierte Tomaten zugeben und 30 Min köcheln\n6. Mit Salz, Pfeffer und Oregano würzen\n7. Spaghetti al dente kochen\n8. Mit Parmesan servieren',
                nutrition: { calories: 650, protein: 35, carbs: 75, fat: 22 },
                tags: ['Pasta', 'Fleisch', 'Familienessen'],
                isFavorite: true,
                timesCooked: 8,
            }),
            this.createMeal(user, {
                name: 'Chicken Teriyaki Bowl',
                description: 'Asiatische Bowl mit mariniertem Hähnchen',
                mealType: ['lunch', 'dinner'],
                cuisine: 'Japanisch',
                prepTime: 20,
                cookTime: 20,
                servings: 2,
                ingredients: [
                    { name: 'Hähnchenbrustfilet', amount: '400', unit: 'g' },
                    { name: 'Jasminreis', amount: '200', unit: 'g' },
                    { name: 'Sojasauce', amount: '4', unit: 'EL' },
                    { name: 'Mirin', amount: '2', unit: 'EL' },
                    { name: 'Honig', amount: '2', unit: 'EL' },
                    { name: 'Brokkoli', amount: '200', unit: 'g' },
                    { name: 'Edamame', amount: '100', unit: 'g' },
                    { name: 'Sesam', amount: '1', unit: 'EL' },
                ],
                instructions: '1. Hähnchen in Streifen schneiden\n2. Teriyaki-Sauce aus Sojasauce, Mirin und Honig mischen\n3. Hähnchen 30 Min marinieren\n4. Reis kochen\n5. Hähnchen anbraten und mit Marinade glasieren\n6. Brokkoli dämpfen\n7. In Bowls anrichten und mit Sesam bestreuen',
                nutrition: { calories: 580, protein: 45, carbs: 65, fat: 12 },
                tags: ['Bowl', 'Asiatisch', 'Gesund'],
                isFavorite: true,
                timesCooked: 5,
            }),
            this.createMeal(user, {
                name: 'Avocado Toast',
                description: 'Schnelles und gesundes Frühstück',
                mealType: ['breakfast', 'snack'],
                cuisine: 'International',
                prepTime: 10,
                cookTime: 5,
                servings: 2,
                ingredients: [
                    { name: 'Sauerteigbrot', amount: '4', unit: 'Scheiben' },
                    { name: 'Avocado', amount: '2', unit: 'Stück' },
                    { name: 'Eier', amount: '2', unit: 'Stück' },
                    { name: 'Kirschtomaten', amount: '100', unit: 'g' },
                    { name: 'Limette', amount: '1', unit: 'Stück' },
                    { name: 'Chiliflocken', amount: '1', unit: 'Prise' },
                ],
                instructions: '1. Brot toasten\n2. Avocado zerdrücken und mit Limettensaft mischen\n3. Eier pochieren oder als Spiegelei braten\n4. Avocado auf Toast verteilen\n5. Ei und Tomaten darauf\n6. Mit Chiliflocken, Salz und Pfeffer würzen',
                nutrition: { calories: 420, protein: 15, carbs: 35, fat: 28 },
                tags: ['Frühstück', 'Vegetarisch', 'Schnell'],
                isFavorite: false,
                timesCooked: 12,
            }),
            this.createMeal(user, {
                name: 'Thai Curry',
                description: 'Cremiges rotes Thai-Curry mit Gemüse',
                mealType: ['dinner'],
                cuisine: 'Thai',
                prepTime: 15,
                cookTime: 25,
                servings: 4,
                ingredients: [
                    { name: 'Kokosmilch', amount: '400', unit: 'ml' },
                    { name: 'Rote Currypaste', amount: '3', unit: 'EL' },
                    { name: 'Tofu', amount: '300', unit: 'g' },
                    { name: 'Paprika', amount: '2', unit: 'Stück' },
                    { name: 'Zucchini', amount: '1', unit: 'Stück' },
                    { name: 'Bambussprossen', amount: '150', unit: 'g' },
                    { name: 'Thai-Basilikum', amount: '1', unit: 'Bund' },
                    { name: 'Jasminreis', amount: '300', unit: 'g' },
                ],
                instructions: '1. Tofu würfeln und anbraten\n2. Currypaste in etwas Kokosmilch anrösten\n3. Restliche Kokosmilch zugeben\n4. Gemüse hinzufügen und köcheln lassen\n5. Tofu zurück in die Sauce\n6. Mit Fischsauce und Zucker abschmecken\n7. Mit Thai-Basilikum garnieren\n8. Mit Reis servieren',
                nutrition: { calories: 520, protein: 22, carbs: 55, fat: 24 },
                tags: ['Curry', 'Vegan möglich', 'Scharf'],
                isFavorite: false,
                timesCooked: 3,
            }),
            this.createMeal(user, {
                name: 'Griechischer Salat',
                description: 'Frischer Salat mit Feta und Oliven',
                mealType: ['lunch', 'dinner'],
                cuisine: 'Griechisch',
                prepTime: 15,
                cookTime: 0,
                servings: 2,
                ingredients: [
                    { name: 'Gurke', amount: '1', unit: 'Stück' },
                    { name: 'Tomaten', amount: '4', unit: 'Stück' },
                    { name: 'Rote Zwiebel', amount: '1', unit: 'Stück' },
                    { name: 'Feta', amount: '200', unit: 'g' },
                    { name: 'Kalamata-Oliven', amount: '100', unit: 'g' },
                    { name: 'Olivenöl', amount: '4', unit: 'EL' },
                    { name: 'Oregano', amount: '1', unit: 'TL' },
                ],
                instructions: '1. Gurke und Tomaten in große Stücke schneiden\n2. Zwiebel in Ringe schneiden\n3. Alles in eine Schüssel geben\n4. Oliven hinzufügen\n5. Mit Olivenöl, Salz und Oregano würzen\n6. Feta in Scheiben obenauf legen',
                nutrition: { calories: 380, protein: 14, carbs: 12, fat: 32 },
                tags: ['Salat', 'Vegetarisch', 'Kein Kochen'],
                isFavorite: true,
                timesCooked: 6,
            }),
        ];

        for (const meal of meals) {
            await this.db.persist(meal);
        }

        // Create notification
        const notification = new Notification();
        notification.user = user;
        notification.type = 'info';
        notification.title = 'Willkommen zur Demo!';
        notification.message = 'Erkunde alle Features von YCMM. Die Demo-Daten werden regelmäßig zurückgesetzt.';
        notification.isRead = false;
        notification.createdAt = now;
        await this.db.persist(notification);
    }

    // Helper methods - now accept User reference
    private createHabit(user: User, data: Partial<Habit>): Habit {
        const habit = new Habit();
        habit.user = user;
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

    private createExpenseCategory(user: User, data: Partial<ExpenseCategory>): ExpenseCategory {
        const cat = new ExpenseCategory();
        cat.user = user;
        cat.name = data.name || '';
        cat.icon = data.icon || '💰';
        cat.color = data.color || '#228be6';
        cat.budget = data.budget;
        cat.isDefault = true;
        cat.createdAt = new Date();
        return cat;
    }

    private createExpense(user: User, category: ExpenseCategory, data: Partial<Expense>): Expense {
        const exp = new Expense();
        exp.user = user;
        exp.category = category;
        exp.amount = data.amount || 0;
        exp.description = data.description || '';
        exp.date = data.date || new Date().toISOString().split('T')[0];
        exp.isRecurring = data.isRecurring || false;
        exp.recurringInterval = data.recurringInterval;
        exp.createdAt = new Date();
        exp.updatedAt = new Date();
        return exp;
    }

    private createDeadline(user: User, data: Partial<Deadline>): Deadline {
        const dl = new Deadline();
        dl.user = user;
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

    private createSubscription(user: User, data: Partial<Subscription>): Subscription {
        const sub = new Subscription();
        sub.user = user;
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

    private createMediaItem(user: User, data: Partial<MediaItem>): MediaItem {
        const media = new MediaItem();
        media.user = user;
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

    private createProject(user: User, data: Partial<Project>): Project {
        const proj = new Project();
        proj.user = user;
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

    private createNote(user: User, data: Partial<Note>): Note {
        const note = new Note();
        note.user = user;
        note.title = data.title || '';
        note.content = data.content || '';
        note.color = data.color || '#228be6';
        note.isPinned = data.isPinned || false;
        note.createdAt = new Date();
        note.updatedAt = new Date();
        return note;
    }

    private createList(user: User, data: Partial<List>): List {
        const list = new List();
        list.user = user;
        list.name = data.name || '';
        list.icon = data.icon || '📝';
        list.color = data.color || '#228be6';
        list.type = data.type || 'custom';
        list.items = data.items || [];
        list.createdAt = new Date();
        list.updatedAt = new Date();
        return list;
    }

    private createInventoryItem(user: User, data: Partial<InventoryItem>): InventoryItem {
        const inv = new InventoryItem();
        inv.user = user;
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

    private createApplication(user: User, data: Partial<Application>): Application {
        const app = new Application();
        app.user = user;
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

    private createWishlistItem(user: User, data: Partial<WishlistItem>): WishlistItem {
        const item = new WishlistItem();
        item.user = user;
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

    private createMeal(user: User, data: Partial<Meal>): Meal {
        const meal = new Meal();
        meal.user = user;
        meal.name = data.name || '';
        meal.description = data.description || '';
        meal.imageUrl = data.imageUrl || '';
        meal.ingredients = data.ingredients || [];
        meal.instructions = data.instructions || '';
        meal.prepTime = data.prepTime;
        meal.cookTime = data.cookTime;
        meal.servings = data.servings;
        meal.mealType = data.mealType || [];
        meal.cuisine = data.cuisine || '';
        meal.tags = data.tags || [];
        meal.nutrition = data.nutrition;
        meal.isFavorite = data.isFavorite || false;
        meal.lastMade = data.lastMade;
        meal.timesCooked = data.timesCooked || 0;
        meal.recipeUrl = data.recipeUrl || '';
        meal.source = data.source || '';
        meal.createdAt = new Date();
        meal.updatedAt = new Date();
        return meal;
    }
}
