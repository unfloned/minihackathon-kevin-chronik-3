import { entity, PrimaryKey, Index } from '@deepkit/type';

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
    date: Date;
    note?: string;
}

export interface Interview {
    id: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    scheduledAt: Date;
    duration?: number; // Minutes
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed: boolean;
    feedback?: string;
}

@entity.name('applications')
export class Application {
    id: string & PrimaryKey = '';
    userId: string & Index = '';

    // Company
    companyName: string = '';
    companyWebsite: string = '';
    companyLogo: string = '';

    // Position
    jobTitle: string = '';
    jobUrl: string = '';
    jobDescription: string = '';
    salary?: SalaryRange;
    location: string = '';
    remote: RemoteType = 'onsite';

    // Status
    status: ApplicationStatus = 'draft';
    statusHistory: StatusChange[] = [];

    // Contact
    contactName: string = '';
    contactEmail: string = '';
    contactPhone: string = '';

    // Notes
    notes: string = '';

    // Interviews
    interviews: Interview[] = [];

    // Meta
    appliedAt?: Date;
    source: string = ''; // LinkedIn, Indeed, Direct
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
