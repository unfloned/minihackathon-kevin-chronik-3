import { entity, PrimaryKey, Reference, uuid, UUID, Index } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('password_reset_tokens')
export class PasswordResetToken {
    id: UUID & PrimaryKey = uuid();
    token: string & Index = '';
    user!: User & Reference;
    expiresAt: Date = new Date();
    createdAt: Date = new Date();
}

export type PasswordResetTokenFrontend = Readonly<PasswordResetToken>;
