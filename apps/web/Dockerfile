FROM node:18-alpine AS builder

WORKDIR /app/web

RUN npm install -g pnpm

COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install 

COPY . .

RUN pnpm build

EXPOSE 4173

ENV VITE_ROUTER_MODE=history

CMD ["pnpm", "preview", "--host"]
