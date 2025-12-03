import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('refresh_tokens')
export class RefreshToken {
    id: UUID & PrimaryKey = uuid();
    token: string & Index = '';
    user!: User & Reference;
    expiresAt: Date = new Date();
    createdAt: Date = new Date();
}

export type RefreshTokenFrontend = Readonly<RefreshToken>;
