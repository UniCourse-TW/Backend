<br />
<div align="center">

# 🦄 UniCourse Backend

🦄 UniCourse is an open-sourced modern course platform for students.

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Tabel of Contents</summary>

- [🦄 UniCourse Backend](#-unicourse-backend)
  - [Features](#features)
    - [Course Search](#course-search)
    - [Forum System](#forum-system)
  - [Usage](#usage)
    - [Using Docker](#using-docker)
  - [Contributing](#contributing)
  - [License](#license)

</details>

## Features

### Course Search

UniCourse builds up a scalable system for three factors (course, teacher, provider) search.

### Forum System

UniCourse provides a forum system for students to discuss about the topics related or unrelated to the courses, giving them a place to share their experience or ask for help.

## Usage

### Using Docker

We provide pre-built docker images, you can pull them from `ghcr.io/unicourse-tw/backend`.

However, you need to provide a [`.env`](./.env) and a database.

In the first time, you need to shape the database schema.

<details>
<summary>Example: Docker Compose</summary>

```yml
# docker-compose.yml
version: "3.9"
name: UniCourse

services:
  backend:
    image: ghcr.io/unicourse-tw/backend:latest
    container_name: unicourse
    restart: unless-stopped
    ports:
      - "${BACKEND_PORT}:${BACKEND_PORT}"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    container_name: unicourse-db
    restart: unless-stopped
    env_file:
      - .env
    expose:
      - 5432:5432
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data: {}
```

</details>

## Contributing

You can find the contributing guidelines [here](./CONTRIBUTING.md).

## License

UniCourse Backend is licensed under the [MIT License](./LICENSE.md).
