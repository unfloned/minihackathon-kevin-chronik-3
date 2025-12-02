import { v4 as uuidv4 } from 'uuid';
import { AppDatabase } from '../../app/database';
import { Note } from '@ycmm/core';

export interface CreateNoteDto {
    title: string;
    content?: string;
    tags?: string[];
    color?: string;
    isPinned?: boolean;
}

export interface UpdateNoteDto {
    title?: string;
    content?: string;
    tags?: string[];
    color?: string;
    isPinned?: boolean;
    isArchived?: boolean;
}

export class NoteService {
    constructor(private db: AppDatabase) {}

    async getAll(userId: string): Promise<Note[]> {
        return this.db.query(Note)
            .filter({ userId, isArchived: false })
            .orderBy('isPinned', 'desc')
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getArchived(userId: string): Promise<Note[]> {
        return this.db.query(Note)
            .filter({ userId, isArchived: true })
            .orderBy('updatedAt', 'desc')
            .find();
    }

    async getById(id: string, userId: string): Promise<Note | undefined> {
        return this.db.query(Note)
            .filter({ id, userId })
            .findOneOrUndefined();
    }

    async search(userId: string, query: string): Promise<Note[]> {
        const notes = await this.db.query(Note)
            .filter({ userId, isArchived: false })
            .find();

        const lowerQuery = query.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    async getByTag(userId: string, tag: string): Promise<Note[]> {
        const notes = await this.db.query(Note)
            .filter({ userId, isArchived: false })
            .find();

        return notes.filter(note =>
            note.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }

    async getAllTags(userId: string): Promise<string[]> {
        const notes = await this.db.query(Note)
            .filter({ userId })
            .find();

        const tagSet = new Set<string>();
        notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
    }

    async create(userId: string, dto: CreateNoteDto): Promise<Note> {
        const note = new Note();
        note.id = uuidv4();
        note.userId = userId;
        note.title = dto.title;
        note.content = dto.content || '';
        note.tags = dto.tags || [];
        note.color = dto.color || '#228be6';
        note.isPinned = dto.isPinned || false;
        note.isArchived = false;
        note.createdAt = new Date();
        note.updatedAt = new Date();

        await this.db.persist(note);
        return note;
    }

    async update(id: string, userId: string, dto: UpdateNoteDto): Promise<Note | null> {
        const note = await this.getById(id, userId);
        if (!note) return null;

        if (dto.title !== undefined) note.title = dto.title;
        if (dto.content !== undefined) note.content = dto.content;
        if (dto.tags !== undefined) note.tags = dto.tags;
        if (dto.color !== undefined) note.color = dto.color;
        if (dto.isPinned !== undefined) note.isPinned = dto.isPinned;
        if (dto.isArchived !== undefined) note.isArchived = dto.isArchived;
        note.updatedAt = new Date();

        await this.db.persist(note);
        return note;
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const note = await this.getById(id, userId);
        if (!note) return false;

        await this.db.remove(note);
        return true;
    }

    async togglePin(id: string, userId: string): Promise<Note | null> {
        const note = await this.getById(id, userId);
        if (!note) return null;

        note.isPinned = !note.isPinned;
        note.updatedAt = new Date();

        await this.db.persist(note);
        return note;
    }

    async archive(id: string, userId: string): Promise<Note | null> {
        const note = await this.getById(id, userId);
        if (!note) return null;

        note.isArchived = true;
        note.isPinned = false;
        note.updatedAt = new Date();

        await this.db.persist(note);
        return note;
    }

    async unarchive(id: string, userId: string): Promise<Note | null> {
        const note = await this.getById(id, userId);
        if (!note) return null;

        note.isArchived = false;
        note.updatedAt = new Date();

        await this.db.persist(note);
        return note;
    }
}
