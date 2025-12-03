import { entity, PrimaryKey, Reference, uuid, UUID } from '@deepkit/type';
import { User } from './user.entity.js';

@entity.name('notes')
export class Note {
    id: UUID & PrimaryKey = uuid();
    user!: User & Reference;

    title: string = '';
    content: string = '';
    tags: string[] = [];
    color: string = '#228be6';
    isPinned: boolean = false;
    isArchived: boolean = false;

    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export type NoteFrontend = Readonly<Note>;
