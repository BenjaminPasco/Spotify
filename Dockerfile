FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

COPY . .

RUN pnpm run build

RUN pnpm prune --production

FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/build /usr/src/app/build
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY package.json ./
COPY server ./server

CMD [ "npm", "start" ]