# syntax=docker/dockerfile:1@sha256:ecfaec9ed6d810b56388c508f4121597bfbba70d41a6dfeee4d8cad5f295fc32

FROM oven/bun:1.4.0@sha256:5ff609364c049b54eb0ff560ec96319729a972078ef2c755d758f0c6ef89c2d6 AS base
WORKDIR /app

# Build
FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# TODO: Switch back to Bun runtime once module resolution is fixed
# Bun doesn't properly resolve externalized Nitro packages (srvx, react-dom/server)
# Error: Cannot find package 'srvx' from '/app/.output/server/chunks/virtual/entry.mjs'
FROM node:22-slim@sha256:83f487e0a63425e5b4d146fb5e5be574bcbe1b7b843d3ebafdd95eaf7767a7e5 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Nitro bundles most deps but externalizes some (react-dom/server, srvx).
# Copy both .output and node_modules to ensure all SSR deps are available.
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
# Nitro's bundled node_modules may have Bun-specific entries missing Node variants.
# Replace them with the full copies from the top-level node_modules.
RUN rm -rf .output/server/node_modules/react-dom .output/server/node_modules/react \
  && cp -r node_modules/react-dom .output/server/node_modules/react-dom \
  && cp -r node_modules/react .output/server/node_modules/react

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
