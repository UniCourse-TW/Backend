FROM node:latest as dev

WORKDIR /app
RUN apt update && apt install -y bash-completion make g++ python3
RUN npm i -g pnpm tsx prisma

CMD [ "sleep", "infinity" ]

FROM jacoblincool/node-prisma-alpine:4.5.0 as builder

WORKDIR /app
RUN apk add --no-cache --virtual .packages make gcc g++ py3-pip
RUN npm i -g pnpm

COPY . .
RUN pnpm i --frozen-lockfile 
RUN pnpm run -r build && pnpm build
RUN rm -rf node_modules .pnpm-store && pnpm i --prod
RUN apk del .packages

FROM jacoblincool/node-prisma-alpine:4.5.0 as backend

ARG UNICOURSE_VER=
ARG GIT_COMMIT=
ENV UNICOURSE_VER=${UNICOURSE_VER}
ENV GIT_COMMIT=${GIT_COMMIT}

RUN apk add --no-cache openssl
WORKDIR /app
RUN adduser --disabled-password unicourse && chown unicourse:unicourse /app
USER unicourse
COPY --from=builder /app .

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
