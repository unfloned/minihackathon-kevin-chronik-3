import { http } from '@deepkit/http';
import { readFile } from 'fs/promises';
import { join } from 'path';

@http.controller('/api')
export class VersionController {
    @http.GET('/version')
    async getVersion() {
        try {
            const versionPath = join(__dirname, '../../../../version.json');
            const content = await readFile(versionPath, 'utf-8');
            return JSON.parse(content);
        } catch {
            return {
                version: '0.0.0',
                name: 'Your Chaos, My Mission',
                changelog: [],
            };
        }
    }
}
