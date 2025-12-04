import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

export type ApplicationStatus =
    | 'draft'
    | 'applied'
    | 'in_review'
    | 'interview_scheduled'
    | 'interviewed'
    | 'offer_received'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';

export type RemoteType = 'onsite' | 'hybrid' | 'remote';

export interface SalaryRange {
    min?: number;
    max?: number;
    currency: string;
}

export interface StatusChange {
    status: ApplicationStatus;
    date: string; // ISO date string - SQLite stores JSON dates as strings
    note?: string;
}

export interface Interview {
    id: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    scheduledAt: string; // ISO date string - SQLite stores JSON dates as strings
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed: boolean;
    feedback?: string;
}

@entity.name('applications')
export class Application {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    companyName: string = '';
    companyWebsite: string = '';
    companyLogo: string = '';

    jobTitle: string = '';
    jobUrl: string = '';
    jobDescription: string = '';
    salary?: SalaryRange;
    location: string = '';
    remote: RemoteType = 'onsite';

    status: ApplicationStatus = 'draft';
    statusHistory: StatusChange[] = [];

    contactName: string = '';
    contactEmail: string = '';
    contactPhone: string = '';

    notes: string = '';

    interviews: Interview[] = [];

    appliedAt?: Date;
    source: string = '';
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type ApplicationFrontend = Readonly<Application>;
