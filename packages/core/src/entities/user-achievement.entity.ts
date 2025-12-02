import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';
import { Achievement } from './achievement.entity.js';

@entity.name('user_achievements')
export class UserAchievement {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    user?: User & Reference;
    achievementId: string & Index = '';
    achievement?: Achievement & Reference;
    unlockedAt: Date = new Date();
}
