# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm AS base

WORKDIR /usr/src/app

################################################################################
# Install dependencies
################################################################################
FROM base AS deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

################################################################################
# Build the application
################################################################################
FROM deps AS build

# Build-time env vars (no secrets — those come from runtime)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_IGNORE_TYPE_ERRORS=1
ENV NEXT_PUBLIC_BUILD_MODE=true

COPY . .
RUN npm run build

################################################################################
# Production image
################################################################################
FROM base AS final

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

USER node

COPY --chown=node:node package.json .
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/.next ./.next
COPY --chown=node:node --from=build /usr/src/app/public ./public
COPY --chown=node:node --from=build /usr/src/app/server ./server
COPY --chown=node:node --from=build /usr/src/app/scripts ./scripts
COPY --chown=node:node --from=build /usr/src/app/next.config.js ./next.config.js

# Frontend (Next.js)
EXPOSE 3000
# Backend API (Express)
EXPOSE 3001

# Health check — uses the lightweight liveness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fs http://localhost:3001/healthz || exit 1

CMD ["npm", "start"]
