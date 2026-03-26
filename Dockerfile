# syntax=docker/dockerfile:1

FROM oven/bun:1 AS base
WORKDIR /app

# Build
FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Bun doesn't properly resolve externalized Nitro packages (srvx, react-dom/server)
FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output

EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
