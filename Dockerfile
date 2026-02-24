FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build:server

EXPOSE 3001

CMD ["node", "packages/server/dist/index.js"]
