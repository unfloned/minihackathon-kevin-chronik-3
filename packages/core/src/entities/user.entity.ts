import { entity, PrimaryKey, Unique, uuid, UUID } from '@deepkit/type';

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

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type UserPublic = Readonly<Omit<User, 'password'>>;
