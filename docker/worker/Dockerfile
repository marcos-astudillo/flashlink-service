FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json tsconfig.build.json vitest.config.ts ./
COPY src ./src
COPY tests ./tests

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev

COPY --from=base /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=base /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=base /app/dist ./dist

CMD ["node", "dist/worker.js"]