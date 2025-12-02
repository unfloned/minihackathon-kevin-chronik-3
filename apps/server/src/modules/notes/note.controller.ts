import { http, HttpBody, HttpNotFoundError, HttpQuery } from '@deepkit/http';
import { NoteService, CreateNoteDto, UpdateNoteDto } from './note.service';
import { User } from '@ycmm/core';

@http.controller('/api/notes')
export class NoteController {
    constructor(private noteService: NoteService) {}

    @(http.GET('').group('auth-required'))
    async getAll(user: User) {
        return this.noteService.getAll(user.id);
    }

    @(http.GET('/archived').group('auth-required'))
    async getArchived(user: User) {
        return this.noteService.getArchived(user.id);
    }

    @(http.GET('/search').group('auth-required'))
    async search(user: User, query: HttpQuery<{ q: string }>) {
        return this.noteService.search(user.id, query.q);
    }

    @(http.GET('/tags').group('auth-required'))
    async getAllTags(user: User) {
        return this.noteService.getAllTags(user.id);
    }

    @(http.GET('/tag/:tag').group('auth-required'))
    async getByTag(tag: string, user: User) {
        return this.noteService.getByTag(user.id, tag);
    }

    @(http.GET('/:id').group('auth-required'))
    async getById(id: string, user: User) {
        const note = await this.noteService.getById(id, user.id);
        if (!note) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
        return note;
    }

    @(http.POST('').group('auth-required'))
    async create(body: HttpBody<CreateNoteDto>, user: User) {
        return this.noteService.create(user.id, body);
    }

    @(http.PATCH('/:id').group('auth-required'))
    async update(id: string, body: HttpBody<UpdateNoteDto>, user: User) {
        const note = await this.noteService.update(id, user.id, body);
        if (!note) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
        return note;
    }

    @(http.POST('/:id/pin').group('auth-required'))
    async togglePin(id: string, user: User) {
        const note = await this.noteService.togglePin(id, user.id);
        if (!note) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
        return note;
    }

    @(http.POST('/:id/archive').group('auth-required'))
    async archive(id: string, user: User) {
        const note = await this.noteService.archive(id, user.id);
        if (!note) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
        return note;
    }

    @(http.POST('/:id/unarchive').group('auth-required'))
    async unarchive(id: string, user: User) {
        const note = await this.noteService.unarchive(id, user.id);
        if (!note) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
        return note;
    }

    @(http.DELETE('/:id').group('auth-required'))
    async delete(id: string, user: User) {
        const success = await this.noteService.delete(id, user.id);
        if (!success) {
            throw new HttpNotFoundError('Notiz nicht gefunden');
        }
    }
}
