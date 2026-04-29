# ── Base stage ──────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g npm@11.11.0
WORKDIR /app

# ── Dependencies stage ──────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY libs ./libs
# keep per-service package.json copy block below for compatibility
COPY apps/api-gateway/package.json ./apps/api-gateway/
RUN npm install --ignore-scripts --no-audit --no-fund

# ── Build stage ─────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=libs/shared-types \
 && npm run build --workspace=libs/common \
 && npm run build --workspace=libs/kafka-common \
 && npm run build --workspace=apps/api-gateway

# ── Production stage ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/api-gateway/package.json ./package.json
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
