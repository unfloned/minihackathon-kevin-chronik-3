import { createModule } from '@deepkit/app';
import { NoteService } from './note.service';
import { NoteController } from './note.controller';

export const NotesModule = createModule({
    controllers: [NoteController],
    providers: [NoteService],
    exports: [NoteService],
});
