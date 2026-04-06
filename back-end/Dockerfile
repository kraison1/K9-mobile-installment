# syntax=docker/dockerfile:1.7-labs
# ===== CONFIGURE =====
FROM node:22-slim

WORKDIR /app

# ติดตั้ง tzdata ให้เหมือนเดิม (Debian ใช้ apt)
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && ln -sf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo "Asia/Bangkok" > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Bangkok

# ติดตั้ง deps (รูปแบบเดิม)
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache-backend,target=/root/.npm \
    --mount=type=cache,id=node-gyp-backend,target=/root/.cache/node-gyp \
    --mount=type=tmpfs,target=/tmp \
    TMPDIR=/tmp npm ci --no-audit --no-fund --prefer-offline --cache /root/.npm

# ใส่ซอร์สโค้ด
COPY . .

# ===== BUILD =====
RUN --mount=type=tmpfs,target=/tmp \
    TMPDIR=/tmp npm run build && mkdir -p /app/uploads

# ===== RUN =====
EXPOSE 4001
CMD ["npm","run","start:prod"]
