FROM node:18-alpine as build

WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn install

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn install --production

COPY --from=build /app/.next ./

RUN yarn start
