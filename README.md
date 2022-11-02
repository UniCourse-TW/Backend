# 🦄 UniCourse Backend

🦄 The backend of UniCourse, an open-sourced modern course platform for students.

## Development

Please make sure you have installed [`Docker`](https://docs.docker.com/get-docker/) on your machine.

Then copy the `.env.example` file to `.env` and fill in the environment variables.

### Setup

> There is a script to help you setup and do the following steps automatically:
> `./scripts/fast-setup.sh`

Start the development environment:

```sh
# on your computer
docker compose up dev -d
```

Enter the development environment:

```sh
# on your computer
docker compose exec dev bash
```

Then you may need to install the dependencies at the first time:

```sh
# in the development environment
pnpm i
```

And build the prisma client:

```sh
# in the development environment
pnpm build:all
```

### Run in Development Mode

```sh
# in the development environment
pnpm dev
```

### Load Data into Database

You may need to download the JSON files via:

```sh
# in the development environment
tsx scripts/download-data.ts 110-1 110-2 111-1 ...
```

Then load the data into database via:

```sh
# in the development environment
tsx scripts/upload-data.ts data/110-1.json data/110-2.json data/111-1.json ...
```

### Run in Production Mode

> First, get out of the development environment.

```sh
# on your computer
docker compose up backend -d
```
