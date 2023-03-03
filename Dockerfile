FROM node:18-alpine as build

ARG env
ENV env $env

WORKDIR /app

COPY ./package.json ./yarn.lock ./next.config.js ./postcss.config.js ./tailwind.config.js ./tsconfig.json ./next-env.d.ts ./

RUN yarn install --frozen-lockfile --network-timeout 1000000

COPY ./src ./src
COPY ./public ./public

RUN if [ "$env" = "dev" ]; then mkdir .next; \
    else yarn build && \
    rm -rf .next/cache && \
    yarn install --production --frozen-lockfile --network-timeout 1000000; fi;

FROM node:18-alpine

WORKDIR /app

ARG env
ENV env $env

COPY ./package.json ./next.config.js ./postcss.config.js ./tailwind.config.js ./tsconfig.json ./next-env.d.ts ./

COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules

COPY ./public ./public

CMD if [ "$env" = "dev" ]; then yarn dev -p ${PORT:-3000}; else yarn start -p ${PORT:-3000}; fi;
