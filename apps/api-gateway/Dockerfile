# ── Base stage ──────────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ── Dependencies stage ──────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY libs/shared-types/package.json ./libs/shared-types/
COPY libs/kafka-common/package.json ./libs/kafka-common/
COPY libs/common/package.json ./libs/common/
RUN npm ci --ignore-scripts

# ── Build stage ─────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY . .
RUN npm run build --workspace=apps/api-gateway

# ── Production stage ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/package.json ./package.json
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
