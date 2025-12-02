import { entity, PrimaryKey, Index, Reference } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('refresh_tokens')
export class RefreshToken {
    id: string & PrimaryKey = '';
    token: string & Index = '';
    userId: string & Index = '';
    user?: User & Reference;
    expiresAt: Date = new Date();
    createdAt: Date = new Date();
}
