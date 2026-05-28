###############################################################################
# JSW MCMS Backend — Production Dockerfile
# Multi-stage: builder → production
# Optimized for Railway / Render / Docker deployments
###############################################################################

# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Install only production dependencies first for layer caching
COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl && \
    npm ci --ignore-scripts

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client and compile TypeScript
RUN npx prisma generate && \
    npm run build

# ── Stage 3: Production Runtime ───────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S mcms && \
    adduser -S mcms -u 1001 -G mcms

ENV NODE_ENV=production
ENV PORT=4000

# Install only production npm deps + openssl for Prisma
COPY package*.json ./
COPY prisma ./prisma

RUN apk add --no-cache openssl curl wget && \
    npm ci --omit=dev --ignore-scripts && \
    npx prisma generate

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Non-root ownership
RUN chown -R mcms:mcms /app
USER mcms

EXPOSE 4000

# Graceful shutdown support
STOPSIGNAL SIGTERM

# Health check (internal)
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

# Entrypoint: run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
