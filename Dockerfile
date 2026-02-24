FROM node:22-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/server/package.json packages/server/
RUN pnpm install --frozen-lockfile

COPY packages/server/ packages/server/
RUN pnpm build:server

EXPOSE 3001

CMD ["pnpm", "--filter", "@silod/server", "start"]
