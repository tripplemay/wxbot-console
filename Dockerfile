# syntax=docker/dockerfile:1
# Bot Platform 运营/租户控制台 —— Next.js standalone 生产镜像

ARG NODE_IMAGE=node:22-bookworm-slim

# --- build stage ---
FROM ${NODE_IMAGE} AS build
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000
COPY . .
# CONSOLE_JWT_SECRET is only needed at runtime; a dummy keeps the build happy if
# any module reads it during prerender.
ENV CONSOLE_JWT_SECRET=build-time-placeholder
RUN yarn build

# --- runtime stage ---
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Next standalone output bundles only the files the server needs.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||'3000')+'/tenant/sign-in').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
