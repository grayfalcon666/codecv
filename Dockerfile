# codecv 单容器镜像：一个 server.mjs 同时服务前端 dist + 简历保存接口
# 多阶段构建：阶段1 从源码构建前端，阶段2 只装运行所需文件
# 构建：docker build -t grayfalcon/codecv .

# ---------- 阶段1：构建前端 ----------
# 用 glibc(debian) 而非 alpine：vite-plugin-imagemin 的 gifsicle/mozjpeg 等原生二进制不支持 musl
FROM node:22 AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN corepack enable && yarn install --frozen-lockfile
COPY . .
RUN yarn build

# ---------- 阶段2：运行时 ----------
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    RESUME_DIR=/app/resumes
# 可选：设置后 /api/* 需要 Authorization: Bearer <RESUME_TOKEN>（前端构建时对应 VITE_RESUME_TOKEN）
# ENV RESUME_TOKEN=change-me

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs

RUN mkdir -p /app/resumes && chown -R node:node /app
USER node

VOLUME /app/resumes
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

LABEL org.opencontainers.image.source="https://hub.docker.com/r/grayfalcon/codecv"

CMD ["node", "server.mjs"]
