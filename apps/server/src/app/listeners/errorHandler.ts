import { eventDispatcher } from '@deepkit/event';
import { httpWorkflow, HttpUnauthorizedError, HttpAccessDeniedError, HttpNotFoundError, HttpResponse } from '@deepkit/http';
import { Logger } from '@deepkit/logger';

function clearAuthCookies(response: HttpResponse) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Clear both access_token and refresh_token cookies
    response.setHeader('Set-Cookie', [
        `access_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${isProduction ? '; Secure' : ''}`,
        `refresh_token=; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=0${isProduction ? '; Secure' : ''}`,
    ]);
}

export class ErrorHandlerListener {
    constructor(private logger: Logger) {}

    @eventDispatcher.listen(httpWorkflow.onControllerError)
    onControllerError(event: typeof httpWorkflow.onControllerError.event) {
        const error = event.error;

        // On 401 Unauthorized - clear auth cookies to force logout
        if (error instanceof HttpUnauthorizedError) {
            clearAuthCookies(event.response);
            return;
        }

        // Known HTTP errors - don't log stack trace
        if (
            error instanceof HttpAccessDeniedError ||
            error instanceof HttpNotFoundError
        ) {
            return;
        }

        // Log unexpected errors
        const action = event.route.action;
        const actionInfo = 'controller' in action
            ? { controller: action.controller?.name, action: action.methodName }
            : { route: event.route.path };

        this.logger.error(`Controller Error: ${error.message}`, {
            stack: error.stack,
            ...actionInfo,
        });
    }

    // Also catch errors from middleware (e.g., AuthMiddleware)
    @eventDispatcher.listen(httpWorkflow.onAccessDenied)
    onAccessDenied(event: typeof httpWorkflow.onAccessDenied.event) {
        // Clear cookies when access is denied
        clearAuthCookies(event.response);
    }
}
