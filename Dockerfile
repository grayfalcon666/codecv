# codecv 单容器镜像：一个 server.mjs 同时服务前端 dist + 简历保存接口 + PDF/PNG 导出
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
# Playwright 官方只支持在 glibc 上安装依赖（alpine 不推荐），且需要 apt 装字体等系统库
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    RESUME_DIR=/app/resumes \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# 可选：设置后 /api/* 需要 Authorization: Bearer <RESUME_TOKEN>（前端构建时对应 VITE_RESUME_TOKEN）
# ENV RESUME_TOKEN=change-me

# 国内网络把 apt 源换成清华镜像（deb.debian.org 直连只有几十 kB/s）
# wget: healthcheck 用；fonts-noto-cjk：容器内离线渲染中文简历必需（模板样式不内嵌字体；bookworm 没有 serif-cjk 包，衬线模板回退到黑体）
# chromium 最小运行库 = playwright-core 源码 deps["debian12-x64"].chromium
# （不用 install --with-deps：它会额外装 xvfb/mesa/llvm 等无头渲染用不上的包，多 ~250MB）
RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates wget fonts-noto-cjk fonts-noto-core \
      libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 \
      libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 \
      libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

# PDF/PNG 导出：chromium-headless-shell 是专为无头打印/截图裁剪的精简内核，比完整 Chromium 小 ~60MB
# 内核走 npmmirror 镜像下载（国内直连 cdn.playwright.dev 极慢；Windows 代理在容器内不可达）
# 以 node 用户下载：root 下载后再 chown -R 会让镜像多一整层文件复制（实测 +300MB）
RUN npm init -y && npm install --registry=https://registry.npmmirror.com playwright-core@1.64.1 && npm cache clean --force \
    && mkdir -p /ms-playwright /app/resumes && chown node:node /ms-playwright /app/resumes
USER node
RUN PLAYWRIGHT_DOWNLOAD_HOST=https://cdn.npmmirror.com/binaries/playwright npx playwright-core install chromium-headless-shell

COPY --from=build /app/dist ./dist
COPY --from=build /app/server.mjs ./server.mjs

VOLUME /app/resumes
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

LABEL org.opencontainers.image.source="https://hub.docker.com/r/grayfalcon/codecv"

CMD ["node", "server.mjs"]
