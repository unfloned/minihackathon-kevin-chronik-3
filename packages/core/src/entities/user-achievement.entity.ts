import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';
import { Achievement } from './achievement.entity.js';

@entity.name('user_achievements')
export class UserAchievement {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;
    achievement!: Achievement & Reference;
    unlockedAt: Date = new Date();
}

export type UserAchievementFrontend = Readonly<UserAchievement>;
