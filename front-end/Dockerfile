# syntax=docker/dockerfile:1.7-labs

# ===== build =====
FROM node:22-slim AS build
WORKDIR /app

# TZ เหมือนเดิม
RUN apt-get update \
 && apt-get install -y --no-install-recommends tzdata \
 && ln -sf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
 && echo "Asia/Bangkok" > /etc/timezone \
 && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Bangkok

# cache/temp
ENV XDG_CACHE_HOME=/tmp/.cache
ENV TMPDIR=/tmp

COPY package*.json ./
RUN --mount=type=cache,id=npm-cache-fe,target=/root/.npm \
    --mount=type=cache,id=node-gyp-fe,target=/root/.cache/node-gyp \
    --mount=type=tmpfs,target=/tmp \
    npm ci --no-audit --no-fund --prefer-offline --cache /root/.npm

COPY . .
RUN --mount=type=tmpfs,target=/tmp npm run build

# ===== runtime (serve) =====
FROM node:22-slim AS runtime
WORKDIR /app

ENV TZ=Asia/Bangkok
RUN apt-get update \
 && apt-get install -y --no-install-recommends tzdata \
 && rm -rf /var/lib/apt/lists/* \
 && npm i -g serve@14

COPY --from=build /app/dist /app/dist

EXPOSE 3001
ENV PORT=3001
CMD ["serve","-s","dist","-l","3001"]
