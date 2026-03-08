# ── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g npm@11.11.0
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps ./apps
COPY libs ./libs
RUN npm install --ignore-scripts --no-audit --no-fund

COPY . .
RUN npm run build --workspace=apps/client

# ── Production stage (nginx) ────────────────────────────
FROM nginx:1.25-alpine AS runner
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html
COPY --from=builder /app/apps/client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
