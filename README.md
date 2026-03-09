# Flashlink Service

Production-ready URL shortener backend built from a distributed systems design document. The service provides short link creation, low-latency redirects, Redis-based caching, asynchronous click analytics, Dockerized local development, and CI validation through GitHub Actions.

## Overview

Flashlink Service is designed as a modular backend system with a write path and a read path separated by responsibility:

- **Write path**: creates short links and persists them in PostgreSQL.
- **Read path**: resolves short codes quickly using Redis cache and falls back to PostgreSQL when needed.
- **Async analytics path**: publishes click events to a queue and processes them in a worker without blocking redirects.

This repository is implemented as a public backend portfolio project focused on clean architecture, scalability, and production-oriented engineering practices.

## Features

- Short URL creation with optional expiration
- Redirect resolution with `302 Found`
- `404 Not Found` for unknown codes
- `410 Gone` for expired links
- Redis cache-aside strategy for redirect resolution
- Asynchronous click analytics using BullMQ + worker
- Daily click aggregation in PostgreSQL
- Feature flags for analytics, dedupe, expiration, and rate limiting
- Configurable route-based rate limiting
- Infrastructure health checks for PostgreSQL and Redis
- Graceful shutdown for API and worker processes
- Unit, integration, and end-to-end tests
- Dockerized API, worker, PostgreSQL, and Redis
- GitHub Actions CI for typecheck, unit tests, and integration tests

## Tech Stack

### Backend
- Node.js
- TypeScript
- Fastify

### Data
- PostgreSQL
- Prisma ORM
- Redis

### Async Processing
- BullMQ

### Testing
- Vitest
- Fastify `app.inject()` for integration testing

### Infrastructure
- Docker
- Docker Compose
- GitHub Actions

## Architecture

### Main Components

- **API Service**
  - Creates short links
  - Resolves redirect requests
  - Publishes analytics jobs

- **PostgreSQL**
  - Stores links
  - Stores daily click aggregates

- **Redis**
  - Caches redirect mappings
  - Backs BullMQ queues

- **Worker Service**
  - Consumes analytics jobs
  - Persists daily click aggregates

### Request Flows

#### 1. Create Link
`POST /v1/links`

1. Validate request body
2. Optionally deduplicate by `longUrl`
3. Generate short code
4. Persist link in PostgreSQL
5. Return short link response

#### 2. Redirect
`GET /:code`

1. Check Redis cache
2. If missing, query PostgreSQL
3. Validate expiration
4. Cache resolved mapping
5. Publish analytics event asynchronously
6. Return `302 Found`

#### 3. Analytics

1. Redirect controller publishes a click event
2. BullMQ stores the job in Redis
3. Worker consumes the job
4. Worker increments daily click aggregate in PostgreSQL

## Project Structure

```text
flashlink-service/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker/
│   ├── api/
│   │   └── Dockerfile
│   └── worker/
│       └── Dockerfile
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── common/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── logger/
│   │   └── utils/
│   ├── health/
│   ├── infrastructure/
│   │   ├── cache/
│   │   ├── database/
│   │   └── queue/
│   ├── modules/
│   │   ├── analytics/
│   │   ├── links/
│   │   └── redirect/
│   ├── app.ts
│   ├── server.ts
│   └── worker.ts
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
├── .dockerignore
├── .env.example
├── docker-compose.yml
├── package.json
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── vitest.config.ts
```

## API Endpoints

### Create Short Link

**POST** `/v1/links`

#### Request

```json
{
  "longUrl": "https://www.google.com",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

#### Response `201 Created`

```json
{
  "code": "AbC123x",
  "longUrl": "https://www.google.com",
  "shortUrl": "http://localhost:3000/AbC123x",
  "createdAt": "2026-03-09T20:00:00.000Z",
  "expiresAt": "2027-01-01T00:00:00.000Z"
}
```

### Resolve Short Link

**GET** `/:code`

#### Responses

- `302 Found` → redirects to original URL
- `404 Not Found` → short link does not exist
- `410 Gone` → short link expired

### Health Check

**GET** `/health`

#### Response `200 OK`

```json
{
  "status": "ok",
  "service": "flashlink-service",
  "checks": {
    "database": "up",
    "redis": "up"
  }
}
```

## Data Model

### Link

- `id`
- `code`
- `longUrl`
- `createdAt`
- `expiresAt`

### ClickEventDaily

- `id`
- `code`
- `date`
- `clicks`
- `createdAt`
- `updatedAt`

## Environment Variables

Use `.env.example` as the base.

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

LOG_LEVEL=info

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flashlink
REDIS_URL=redis://localhost:6379

FEATURE_ANALYTICS=true
FEATURE_LINK_EXPIRATION=true
FEATURE_DEDUPE=false
RATE_LIMIT_ENABLED=true

REDIRECT_CACHE_TTL_SECONDS=3600

RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MINUTES=1
CREATE_LINK_RATE_LIMIT_MAX=20
REDIRECT_RATE_LIMIT_MAX=300
```

### Feature Flags

- `FEATURE_ANALYTICS`: enables async click analytics publishing
- `FEATURE_LINK_EXPIRATION`: enables expiration behavior
- `FEATURE_DEDUPE`: reuses an existing link for the same `longUrl`
- `RATE_LIMIT_ENABLED`: enables route-level rate limiting

## Running Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start API

```bash
npm run dev
```

### 6. Start worker

In another terminal:

```bash
npm run worker:dev
```

## Running with Docker

Build and start the full stack:

```bash
docker compose up --build
```

This starts:

- PostgreSQL
- Redis
- API service
- Worker service

Stop everything:

```bash
docker compose down
```

## Testing

### Unit tests

```bash
npm run test:unit
```

### Integration tests

Requires PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
npm run test:integration
```

### E2E tests

Requires PostgreSQL, Redis, and the worker running:

```bash
docker compose up -d postgres redis
npm run worker:dev
npm run test:e2e
```

### Full suite

```bash
npm run test:run
```

## CI

GitHub Actions workflow runs:

- dependency installation
- Prisma client generation
- migrations
- typecheck
- unit tests
- integration tests

Workflow file:

```text
.github/workflows/ci.yml
```

## Deployment Notes

### Render

Recommended for hosting the API service.

Suggested setup:

- **Web Service** → API container / Node service
- Environment variables from `.env.example`
- Health check path: `/health`

### Railway

Recommended for PostgreSQL and Redis if you prefer managed infrastructure.

Suggested setup:

- Railway PostgreSQL
- Railway Redis
- Inject connection strings into the API and worker environments

## Scalability Considerations

This implementation already includes several scaling-oriented patterns:

- Separation of write and redirect responsibilities
- Redis cache for hot redirect paths
- Asynchronous analytics pipeline to avoid blocking redirects
- Route-based rate limiting for abuse protection
- Graceful shutdown for safer restarts and deploys
- Feature flags for incremental rollout

Future improvements could include:

- custom aliases
- user ownership and authentication
- dead-letter queue for failed analytics jobs
- observability with metrics and tracing
- cache invalidation strategy enhancements
- horizontal scaling of worker consumers
- read replicas for PostgreSQL

## Engineering Highlights

This repository demonstrates:

- modular backend architecture
- clear separation of concerns
- typed configuration management
- repository and service patterns
- asynchronous event processing
- infrastructure-aware health checks
- CI validation
- containerized local development

## Repository Goal

This project was built as a backend engineering portfolio piece to demonstrate practical system design implementation, production-ready backend patterns, and distributed systems thinking.
