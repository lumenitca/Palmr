FROM node:22-alpine

WORKDIR /app/server

RUN apk add --no-cache netcat-openbsd
RUN npm install -g pnpm

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY scripts ./scripts/

RUN rm -rf node_modules/.prisma

RUN pnpm install --frozen-lockfile

RUN npx prisma generate

COPY . .

RUN pnpm build
RUN chmod +x ./scripts/start.sh

EXPOSE 3333

CMD ["./scripts/start.sh"]
