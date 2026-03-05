FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/analytics-service/package.json ./apps/analytics-service/
COPY libs/shared-types/package.json ./libs/shared-types/
COPY libs/kafka-common/package.json ./libs/kafka-common/
COPY libs/common/package.json ./libs/common/
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=apps/analytics-service

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
COPY --from=builder /app/apps/analytics-service/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/analytics-service/package.json ./package.json
USER nestjs
EXPOSE 3006
CMD ["node", "dist/main.js"]
