import { Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

// Public Pages (not in modules)
import LandingPage from './pages/LandingPage';
import ChangelogPage from './pages/ChangelogPage';

// Module Pages
import { AuthPage, ForgotPasswordPage, ResetPasswordPage } from './modules/auth';
import { DashboardPage } from './modules/dashboard';
import { HabitsPage } from './modules/habits';
import { ExpensesPage } from './modules/expenses';
import { DeadlinesPage } from './modules/deadlines';
import { SubscriptionsPage } from './modules/subscriptions';
import { SettingsPage } from './modules/settings';
import { AchievementsPage } from './modules/gamification';
import { NotesPage, NoteDetailPage, NoteEditPage } from './modules/notes';
import { ListsPage } from './modules/lists';
import { ProjectsPage, ProjectDetailPage } from './modules/projects';
import { InventoryPage } from './modules/inventory';
import { ApplicationsPage } from './modules/applications';
import { MediaPage } from './modules/media';
import { MealsPage } from './modules/meals';
import { WishlistsPage } from './modules/wishlists';
import { AdminPage } from './modules/admin';

// Protected Route Wrapper
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/changelog" element={<ChangelogPage />} />
            </Route>

            {/* Protected App Routes */}
            <Route
                path="/app"
                element={
                    <ProtectedRoute>
                        <AppLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="deadlines" element={<DeadlinesPage />} />
                <Route path="subscriptions" element={<SubscriptionsPage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="notes" element={<NotesPage />} />
                <Route path="notes/new" element={<NoteEditPage />} />
                <Route path="notes/:id" element={<NoteDetailPage />} />
                <Route path="notes/:id/edit" element={<NoteEditPage />} />
                <Route path="lists" element={<ListsPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:id" element={<ProjectDetailPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="media" element={<MediaPage />} />
                <Route path="meals" element={<MealsPage />} />
                <Route path="wishlists" element={<WishlistsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="admin" element={<AdminPage />} />
            </Route>
        </Routes>
    );
}
