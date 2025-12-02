# Stage 1: Builder
FROM node:20 AS builder

# Install pnpm (matching packageManager version) and turbo
RUN npm install -g pnpm@9.14.4 turbo

WORKDIR /app

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json version.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/core/package.json ./packages/core/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/server ./apps/server
COPY apps/web ./apps/web
COPY packages/core ./packages/core

# Patch TypeScript for Deepkit reflection support (must be after source copy)
RUN pnpm --filter @ycmm/server exec deepkit-type-install && \
    echo "TypeScript patched for Deepkit reflection"

# Build server directly (not via turbo) to ensure patched TypeScript is used
RUN cd apps/server && pnpm run build && cd ../..

# Build web via turbo
RUN pnpm turbo build --filter=@ycmm/web --filter=@ycmm/core --force

# Deploy server with all dependencies (resolves pnpm symlink issues)
RUN pnpm --filter=@ycmm/server deploy --prod --legacy /app/server-deploy

# Stage 2: Backend only
FROM node:20 AS backend

WORKDIR /app

# Copy the deployed server (includes all dependencies without symlinks)
COPY --from=builder /app/server-deploy ./

# Copy version info
COPY --from=builder /app/version.json ./version.json

EXPOSE 8080
CMD ["node", "dist/app.js", "server:start"]

# Stage 3: Frontend only (Nginx)
FROM nginx:alpine AS frontend

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Stage 4: Combined (Backend + Frontend via Supervisor)
FROM node:20 AS final

# Install nginx and supervisor
RUN apt-get update && apt-get install -y nginx supervisor && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend (deployed server with all dependencies)
COPY --from=builder /app/server-deploy ./server

# Copy frontend
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy version info
COPY version.json ./version.json

# Create data directory for SQLite
RUN mkdir -p /app/data && chmod 755 /app/data

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
