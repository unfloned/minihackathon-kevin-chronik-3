import { entity, PrimaryKey, Unique } from '@deepkit/type';

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
    id: string & PrimaryKey = '';
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
    tier: number = 1; // 1-5, higher = harder
    createdAt: Date = new Date();
}
