FROM node:18-alpine as build

WORKDIR /app

COPY ./package.json ./yarn.lock ./next.config.js ./postcss.config.js ./tailwind.config.js ./tsconfig.json ./next-env.d.ts ./

RUN yarn install

COPY ./src ./src
COPY ./public ./public

RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY ./package.json ./next.config.js ./

RUN yarn install --production

COPY --from=build /app/.next ./

VOLUME /app/data

CMD yarn start -p ${PORT:-3000}
