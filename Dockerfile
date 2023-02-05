FROM node:18-alpine as build

WORKDIR /app

COPY ./package.json ./yarn.lock ./next.config.js ./postcss.config.js ./tailwind.config.js ./tsconfig.json ./next-env.d.ts ./

RUN yarn install --frozen-lockfile --network-timeout 1000000

COPY ./src ./src
COPY ./public ./public

RUN yarn build

RUN rm -rf .next/cache

FROM node:18-alpine

WORKDIR /app

COPY ./package.json ./next.config.js ./

RUN yarn install --production --frozen-lockfile --network-timeout 1000000 

COPY --from=build /app/.next ./

VOLUME /app/data

CMD yarn start -p ${PORT:-3000}
