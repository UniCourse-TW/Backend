#!/bin/sh

# This script is a fast setup script for the project.
# It should be run from the root of the project.
# Like: ./scripts/fast-setup.sh
# It should work, and should only be run ONCE.
# If it doesn't work, a PR is welcome.

cp .env.example .env

docker compose up dev -d

docker compose exec dev pnpm i
docker compose exec dev prisma db push
docker compose exec dev tsx scripts/download-data.ts 110-1 110-2 111-1
docker compose exec dev tsx scripts/upload-data.ts data/110-1.json data/110-2.json data/111-1.json

echo You can now run \"pnpm dev\" and go to "http://localhost:8080/course/query?year=111&term=1&q=紀博文"
docker compose exec dev bash
