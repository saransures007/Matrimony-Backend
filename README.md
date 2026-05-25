# Matrimony Backend

Production-grade Express + TypeScript backend for the matrimony app.

## Stack

- Node.js 18+
- Express 5
- TypeScript
- Sequelize
- Swagger / OpenAPI
- Zod + Joi validation
- Redis, JWT, Socket.IO, S3-compatible media storage

## Features

- Authentication and account management
- User profile and preferences APIs
- Media upload and verification flow
- Match, swipe, and interest APIs
- Centralized error handling and request logging
- Swagger documentation at runtime
- Linting, formatting, unit tests, and integration tests

## Prerequisites

- Node.js 18 or newer
- npm
- MySQL or PostgreSQL
- Redis
- Optional S3/R2-compatible object storage for media

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.development
```

If you do not have `.env.example`, create `.env.development` manually and set the required values below.

## Environment variables

At minimum, configure:

```bash
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000

DB_PORT=3306
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_HOST=
DB_DIALECT=mysql

JWT_ACCESS_TOKEN_SECRET=

REDIS_URL=
```

Optional media settings:

```bash
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_ENDPOINT=
AWS_S3_FORCE_PATH_STYLE=
```

Optional messaging / auth integrations:

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Running

Development:

```bash
npm run dev
```

Production build and start:

```bash
npm run build
npm start
```

## Quality checks

Lint:

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```

Format:

```bash
npm run format
npm run format:check
```

Tests:

```bash
npm test
npm run test:coverage
```

## Database tasks

Generate a migration:

```bash
npm run migration:generate --name "create-table-name"
```

Run migrations:

```bash
npm run migration
```

Seed Tamil Nadu lookup data:

```bash
npm run seed:tamilnadu
npm run seed:tamilnadu:clean
```

## API documentation

Swagger UI is available at:

```text
http://localhost:5000/api-docs
```

## Project structure

```text
src/
├── config/        # app, sequelize, and swagger configuration
├── database/      # models, migrations, seeds
├── docs/          # OpenAPI docs
├── middlewares/   # auth, validation, logging, rate limiting
├── modules/       # feature modules
├── routes/        # route aggregation
├── schemas/       # request validation schemas
├── types/         # shared TypeScript types
└── utils/         # app utilities
tests/             # unit and integration tests
```

## Deployment notes

- Keep secrets in environment variables, never in source control.
- Run `npm run build` before deployment.
- Apply migrations before starting the server.
- Ensure Redis and the database are reachable in production.
- Use a process manager such as PM2, systemd, or container orchestration.
