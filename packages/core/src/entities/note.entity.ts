import { entity, PrimaryKey, Index } from '@deepkit/type';

@entity.name('notes')
export class Note {
    id: string & PrimaryKey = '';
    userId: string & Index = '';
    title: string = '';
    content: string = ''; // Markdown content
    tags: string[] = []; // Array of tags
    color: string = '#228be6';
    isPinned: boolean = false;
    isArchived: boolean = false;
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}
