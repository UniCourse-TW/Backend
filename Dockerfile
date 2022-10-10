FROM node:latest as dev

WORKDIR /app
RUN apt update && apt install -y bash-completion make gcc g++ python3
RUN npm i -g pnpm tsx prisma

CMD [ "sleep", "infinity" ]

FROM node:latest as builder

WORKDIR /app
RUN apt update && apt install -y bash-completion make gcc g++ python3
RUN npm i -g pnpm

COPY . .
RUN pnpm i --frozen-lockfile 
RUN pnpm build && pnpm prune --prod

FROM node:latest as backend

WORKDIR /app
COPY --from=builder /app .
RUN useradd -m app && chown -R app /app
USER app

ENTRYPOINT [ "npm" ]
CMD [ "start" ]
