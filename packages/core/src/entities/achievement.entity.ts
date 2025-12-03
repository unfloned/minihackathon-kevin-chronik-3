import { entity, PrimaryKey, Unique, uuid, UUID } from '@deepkit/type';

export type AchievementCategory =
    | 'general'
    | 'habits'
    | 'applications'
    | 'expenses'
    | 'streaks'
    | 'social'
    | 'deadlines'
    | 'subscriptions'
    | 'notes'
    | 'lists'
    | 'projects'
    | 'inventory'
    | 'media'
    | 'meals'
    | 'wishlists'
    | 'legendary';

export type AchievementType = 'one_time' | 'repeatable' | 'daily' | 'weekly' | 'monthly';

@entity.name('achievements')
export class Achievement {
    id: UUID & PrimaryKey = uuid();
    key: string & Unique = '';
    name: string = '';
    description: string = '';
    icon: string = '';
    category: AchievementCategory = 'general';
    xpReward: number = 0;
    requirement: number = 1;
    isHidden: boolean = false;
    type: AchievementType = 'one_time';
    resetPeriod?: 'daily' | 'weekly' | 'monthly';
    tier: number = 1;
    createdAt: Date = new Date();
}

export type AchievementFrontend = Readonly<Achievement>;
