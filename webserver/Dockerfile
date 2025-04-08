FROM node:22 AS build

WORKDIR /build

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfiles

COPY . .

RUN npx next build

FROM node:22

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfiles --prod

COPY docker-entrypoint.sh ./entrypoint

COPY --from=build /build/.next  /app/.next
COPY --from=build /build/public  /app/public

ENTRYPOINT [ "./entrypoint" ]
