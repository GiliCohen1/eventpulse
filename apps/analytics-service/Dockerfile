FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN npm install -g npm@11.11.0
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps ./apps
COPY libs ./libs
# keep per-service package.json copy block below for compatibility
COPY apps/analytics-service/package.json ./apps/analytics-service/
RUN npm install --ignore-scripts --no-audit --no-fund

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=libs/shared-types \
 && npm run build --workspace=libs/common \
 && npm run build --workspace=libs/kafka-common \
 && npm run build --workspace=apps/analytics-service

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/analytics-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/analytics-service/package.json ./package.json
USER nestjs
EXPOSE 3006
CMD ["node", "dist/main.js"]
