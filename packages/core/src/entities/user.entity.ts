import { entity, PrimaryKey, Unique, Index } from '@deepkit/type';

@entity.name('users')
export class User {
    id: string & PrimaryKey = '';
    email: string & Unique = '';
    password: string = '';
    displayName: string = '';
    isDemo: boolean = false;
    isAdmin: boolean = false;
    level: number = 1;
    xp: number = 0;
    locale: string = 'de';
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export interface UserPublic {
    id: string;
    email: string;
    displayName: string;
    isDemo: boolean;
    isAdmin: boolean;
    level: number;
    xp: number;
    createdAt: Date;
}
