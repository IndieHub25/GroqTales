# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm as base

WORKDIR /usr/src/app

################################################################################
FROM base as deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

################################################################################
FROM deps as build

ENV MONGODB_URI="mongodb://mongo:27017/groqtales"
ENV NEXT_PUBLIC_RPC_URL="http://anvil:8545"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_IGNORE_TYPE_ERRORS=1

COPY . .
RUN npm run build

################################################################################
FROM base as final

ENV NODE_ENV development
ENV MONGODB_URI="mongodb://mongo:27017/groqtales"
ENV NEXT_PUBLIC_RPC_URL="http://anvil:8545"
ENV NEXT_TELEMETRY_DISABLED=1

USER node

COPY --chown=node:node package.json .
COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/.next ./.next
COPY --chown=node:node --from=build /usr/src/app/public ./public
COPY --chown=node:node --from=build /usr/src/app/server ./server
COPY --chown=node:node --from=build /usr/src/app/scripts ./scripts
COPY --chown=node:node --from=build /usr/src/app/next.config.js ./next.config.js

EXPOSE 3000
EXPOSE 3001

CMD npm start
