# Contributing

[Setup](#setting-up-the-environment) |
[Coding Style](#coding-style) |
[Commit Style](#commit-style) |
[Stacks](#stacks) |
[Packages](#packages)

Any forms of contribution are welcome. Include but not limited to:

1. [Submit an issue](https://github.com/UniCourse-TW/Backend/issues/new) to report bugs or request features.
2. [Open a PR](https://github.com/UniCourse-TW/Backend/compare) to fix bugs or implement features.
3. Check whether [issues](https://github.com/UniCourse-TW/Backend/issues) are still valid in current version.
4. Answer questions from our community on [Discussions](https://github.com/UniCourse-TW/UniCourse/discussions) and [Discord](https://discord.gg/aDUjjDf3yZ).

Currently, the following are the most important tasks:

- [Help us to add missing tests](https://github.com/UniCourse-TW/Backend/issues/16)

If you need to any help from maintainers and the community, you can join our [Discord server](https://discord.gg/aDUjjDf3yZ).

## Setting Up the Environment

Please make sure you have installed [`Docker`](https://docs.docker.com/get-docker/) on your machine.

We will create a docker container as the development environment:

```sh
┌───────────────────────────────────┐
│                                   │
│  Your Machine (Host)              │
│                                   │
│    `docker compose exec dev bash` │
│       ↓                           │
│  ┌───┤ ├────────────────┐         │
│  │                      │         │
│  │  Container (Dev Env) │         │
│  │                      │         │
│  └──────────────────────┘         │
│                                   │
└───────────────────────────────────┘
```

In the Dev Env, all the tools you need are already installed, such as `pnpm`, `prisma`, `tsx`, `unicourse`, etc.

### First Time Setup

Clone the repository:

```sh
# at Host
git clone https://github.com/UniCourse-TW/Backend.git
cd Backend
```

Run Setup Script:

```sh
# at Host
./scripts/fast-setup.sh
```

> This should take a few minutes and only needs to be done once.
> After the script finishes, you will be inside the Dev Env.

### Start the Development Environment

You may need to start the Dev Env if you have exited it:

```sh
# at Host
docker compose up -d dev
```

### Enter the Development Environment

Please ensure that you have started the Dev Env.

```sh
# at Host
docker compose exec dev bash
```

## Coding Style

We use a loose rule set, however, we encourage you to follow the similar style as the existing code. You can use `pnpm lint` to check if your code violates any rules.

We recommend you to use [VSCode](https://code.visualstudio.com/) as your editor which supports [ESLint](https://eslint.org/) well.

## Commit Style

We recommend you to use [Conventional Commits](https://www.conventionalcommits.org/) with Angular convention. If you do not follow this convention, we may squash your commits into one commit with a conventional commit message.

## Stacks

The following are the tools we use:

- [TypeScript](https://www.typescriptlang.org/) as the main dev programming language.
- [Prisma](https://www.prisma.io/) as the ORM and database management tool.
- [Koa](https://koajs.com/) as the web server framework.
- [Zod](https://zod.dev/) as the user input validator.
- [Pnpm](https://pnpm.io/) as the package manager.

Our underlying database is [PostgreSQL](https://www.postgresql.org/).

## Packages

This is a monorepo, which means that we have multiple packages in the same repository.

Most of them are located in the `packages` directory, except for the main unicourse server which is located in the root directory.

You can find the README of each package in the `README.md` file in the package directory.
