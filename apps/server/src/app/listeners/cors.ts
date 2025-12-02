import { eventDispatcher } from '@deepkit/event';
import { httpWorkflow } from '@deepkit/http';
import { AppConfig } from '../config';

export class CORSListener {
    constructor(private config: AppConfig) {}

    @eventDispatcher.listen(httpWorkflow.onRequest)
    onRequest(event: typeof httpWorkflow.onRequest.event) {
        const allowedOrigins = [
            this.config.webUrl,
            'http://localhost:5173',
            'http://localhost:4173',
        ];

        const origin = event.request.headers.origin;
        const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

        event.response.setHeader('Access-Control-Allow-Origin', allowOrigin);
        event.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        event.response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        event.response.setHeader('Access-Control-Allow-Credentials', 'true');
        event.response.setHeader('Access-Control-Max-Age', '86400');

        if (event.request.method === 'OPTIONS') {
            event.response.statusCode = 204;
            event.response.end();
            event.clearNext();
        }
    }
}
