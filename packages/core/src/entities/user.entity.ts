import { entity, PrimaryKey, Unique, uuid, UUID } from '@deepkit/type';

export interface NotificationPreferences {
    enabled: boolean;
    habitReminders: boolean;
    habitReminderTime: string; // "20:00"
    deadlineWarnings: boolean;
    deadlineDaysBefore: number[]; // [3, 1, 0]
    subscriptionReminders: boolean;
    streakWarnings: boolean;
}

export const defaultNotificationPreferences: NotificationPreferences = {
    enabled: true,
    habitReminders: true,
    habitReminderTime: '20:00',
    deadlineWarnings: true,
    deadlineDaysBefore: [3, 1, 0],
    subscriptionReminders: true,
    streakWarnings: true,
};

export interface WorkExperience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
}

export interface Language {
    language: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';
}

export interface CvProject {
    id: string;
    title: string;
    description: string;
    url?: string;
    technologies?: string[];
}

export interface CvCertification {
    id: string;
    name: string;
    issuer: string;
    date?: string;
    url?: string;
}

export type CvSectionId = 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications' | 'hobbies';

export interface CvSectionConfig {
    id: CvSectionId;
    visible: boolean;
    order: number;
}

export interface CvConfig {
    sections: CvSectionConfig[];
}

@entity.name('users')
export class User {
    id: UUID & PrimaryKey = uuid();
    email: string & Unique = '';
    password: string = '';
    displayName: string = '';
    isDemo: boolean = false;
    isAdmin: boolean = false;
    level: number = 1;
    xp: number = 0;
    locale: string = 'de';

    // Public profile / Achievement Showcase
    profilePublic: boolean = false;
    profileSlug: string = '';

    // CV / Profile fields
    profileBio: string = '';
    profilePhone: string = '';
    profileAddress: string = '';
    profileSkills: string[] = [];
    profileExperience: WorkExperience[] = [];
    profileEducation: Education[] = [];
    profileLanguages: Language[] = [];
    profileProjects: CvProject[] = [];
    profileCertifications: CvCertification[] = [];
    profileHobbies: string[] = [];
    profileCvConfig: CvConfig | null = null;

    // Push Notification preferences
    notificationPreferences: NotificationPreferences = { ...defaultNotificationPreferences };

    // Demo account expiration (for cleanup of abandoned sessions)
    demoExpiresAt?: Date;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type UserPublic = Readonly<Omit<User, 'password'>>;
