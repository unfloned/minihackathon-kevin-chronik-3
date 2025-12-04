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

export interface Interview {
    id: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    scheduledAt: string;
    duration?: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
    completed: boolean;
    feedback?: string;
}

export interface Application {
    id: string;
    companyName: string;
    companyWebsite: string;
    companyLogo: string;
    jobTitle: string;
    jobUrl: string;
    jobDescription: string;
    salary?: SalaryRange;
    location: string;
    remote: RemoteType;
    status: ApplicationStatus;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
    interviews: Interview[];
    appliedAt?: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateApplicationForm {
    companyName: string;
    jobTitle: string;
    companyWebsite: string;
    jobUrl: string;
    jobDescription: string;
    location: string;
    remote: RemoteType;
    salaryMin?: number;
    salaryMax?: number;
    contactName: string;
    contactEmail: string;
    notes: string;
    source: string;
}

export const defaultForm: CreateApplicationForm = {
    companyName: '',
    jobTitle: '',
    companyWebsite: '',
    jobUrl: '',
    jobDescription: '',
    location: '',
    remote: 'onsite',
    contactName: '',
    contactEmail: '',
    notes: '',
    source: '',
};

export const statusColors: Record<ApplicationStatus, string> = {
    draft: 'gray',
    applied: 'blue',
    in_review: 'cyan',
    interview_scheduled: 'violet',
    interviewed: 'indigo',
    offer_received: 'green',
    accepted: 'teal',
    rejected: 'red',
    withdrawn: 'orange',
};

export const sourceOptions = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'xing', label: 'XING' },
    { value: 'stepstone', label: 'StepStone' },
    { value: 'direct', label: 'Direkt' },
    { value: 'referral', label: 'Empfehlung' },
    { value: 'other', label: 'Sonstige' },
];
