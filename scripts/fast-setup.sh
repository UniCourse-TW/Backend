#!/bin/sh

# This script is a fast setup script for the project.
# It should be run from the root of the project.
# Like: ./scripts/fast-setup.sh
# It should work, and should only be run ONCE.
# If it doesn't work, a PR is welcome.

[ ! -f .env ] && cp .env.example .env

docker compose down -v
docker compose up dev -d

docker compose exec dev pnpm i
docker compose exec dev pnpm build:all
docker compose exec dev bash -c "cd packages/cli && npm link"
docker compose exec dev bash -c "mkdir data && curl -L -o data/courses.json https://github.com/JacobLinCool/NTNU-Course-Crawler/releases/download/20221106/108-1.108-2.109-1.109-2.110-1.110-2.111-1.json"
docker compose exec dev pnpm db:push
docker compose exec dev bash -c "pnpm dev & sleep 5 && (echo 'unicourse' | unicourse login unicourse) && unicourse import data/courses.json && exit"

echo Adminer is running at "http://localhost:8180"
echo use \"pnpm dev\" to start the server at "http://localhost:8080"
docker compose exec dev bash
