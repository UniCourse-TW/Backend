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

Build the packages:

```sh
# in the development environment
pnpm build:all
```

Shape the database:

```sh
pnpm db:push
```

### Run in Development Mode

```sh
# in the development environment
pnpm dev
```

### Load Data into Database

You need to prepare Course Pack files first.

Then load the data into database via `unicourse import`

```sh
# in the development environment
unicourse import data/courses.json
```

> This action requires a logged-in user.

### Run in Production Mode

> First, get out of the development environment.

```sh
# on your computer
docker compose up backend -d
```

## Contributing

Any forms of contribution are welcome. Include but not limited to:

1. [Open a PR](https://github.com/UniCourse-TW/Backend/compare) to fix bugs.
2. Check whether [issues](https://github.com/UniCourse-TW/Backend/issues) are still valid in current version.
3. Add missing tests. (check [#16](https://github.com/UniCourse-TW/Backend/issues/16) for more discussion)

If you need to any help from maintainers, you can join our [Discord server](https://discord.gg/aDUjjDf3yZ).
