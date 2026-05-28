###############################################################################
# JSW MCMS Frontend — Production Dockerfile
# Multi-stage: builder (Node/Vite) → production (Nginx)
# Optimized for Docker / self-hosted deployments (Vercel uses vercel.json)
###############################################################################

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Build-time args injected via docker-compose or CI pipeline
ARG VITE_API_URL=http://localhost:4000/api
ARG VITE_APP_VERSION=1.0.0
ARG NODE_ENV=production

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV NODE_ENV=$NODE_ENV

# Dependency install with layer caching
COPY package*.json ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build

# ── Stage 2: Nginx Production Server ─────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copy custom Nginx config (gzip, SPA fallback, security headers, caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Non-root: change ownership to nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

STOPSIGNAL SIGQUIT

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
