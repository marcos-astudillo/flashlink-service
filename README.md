# Flashlink Service

Production-ready URL shortener backend built with **Fastify**, **TypeScript**, **PostgreSQL**, **Redis**, **Prisma**, and **BullMQ**.

This project was designed and implemented as a backend engineering portfolio project focused on clean architecture, scalability, observability, background processing, and production-oriented deployment practices.

## Overview

Flashlink Service provides a complete short-link platform with:

- short link creation
- redirect resolution
- Redis cache-aside strategy for hot lookups
- asynchronous click analytics processing with a worker
- PostgreSQL persistence with Prisma
- configurable rate limiting
- optional link expiration
- Dockerized local development and deployment
- GitHub Actions CI pipeline
- Railway deployment
- OpenAPI documentation with Swagger UI

## Architecture

At a high level, the system works like this:

1. The client creates a short URL through the API.
2. The API stores link metadata in PostgreSQL.
3. Redirect requests first try Redis.
4. On cache miss, the API loads the link from PostgreSQL and populates Redis.
5. Redirects are returned immediately.
6. Click analytics are published asynchronously to a BullMQ queue.
7. A worker consumes analytics jobs and updates daily aggregates in PostgreSQL.

### High-level flow

```text
Client
  |
  v
Fastify API
  |-----------------------> PostgreSQL (links, daily click aggregates)
  |
  |-----------------------> Redis (redirect cache, queue backend)
  |
  '-- publish analytics --> BullMQ queue --> Worker --> PostgreSQL
```

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Fastify
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache / Queue Backend:** Redis
- **Background Jobs:** BullMQ
- **Testing:** Vitest + Supertest
- **Containerization:** Docker + Docker Compose
- **CI:** GitHub Actions
- **Deployment:** Railway

## Project Structure

```text
flashlink-service/
├── src/
│   ├── common/
│   ├── health/
│   ├── infrastructure/
│   ├── modules/
│   │   ├── analytics/
│   │   ├── links/
│   │   └── redirect/
│   ├── app.ts
│   ├── server.ts
│   └── worker.ts
├── prisma/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
│   ├── api/
│   └── worker/
├── docs/
│   └── images/
├── .github/workflows/
├── docker-compose.yml
├── package.json
└── README.md
```

## Main Features

### 1. Short link creation
Creates a short code for a provided URL.

**Endpoint**

```http
POST /v1/links
```

**Request body**

```json
{
  "longUrl": "https://www.google.com",
  "expiresAt": "2026-12-31T00:00:00.000Z"
}
```

**Response**

```json
{
  "code": "Ab12xYz",
  "longUrl": "https://www.google.com",
  "shortUrl": "https://your-domain/Ab12xYz",
  "createdAt": "2026-03-10T00:00:00.000Z",
  "expiresAt": "2026-12-31T00:00:00.000Z"
}
```

### 2. Redirect resolution
Resolves a short code and returns an HTTP redirect.

**Endpoint**

```http
GET /:code
```

**Behaviors**

- `302 Found` if the short link exists
- `404 Not Found` if the code does not exist
- `410 Gone` if the link is expired

### 3. Redis cache-aside strategy
Redirect resolution first checks Redis for fast reads. On cache miss, the API loads from PostgreSQL and stores the result in Redis.

### 4. Async analytics pipeline
Redirect requests do not block on analytics writes.

- API publishes click events to BullMQ
- Worker consumes jobs asynchronously
- PostgreSQL stores daily click aggregates in `ClickEventDaily`

### 5. Health checks
The service exposes a health endpoint with infrastructure dependency status.

**Endpoint**

```http
GET /health
```

**Response**

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

### 6. Production-oriented controls

- feature flags
- route-level configurable rate limiting
- graceful shutdown for API and worker
- Dockerized services
- CI workflow for typecheck and tests
- OpenAPI / Swagger docs

## API Documentation

Swagger UI is available at:

```text
/docs
```

OpenAPI spec is available at:

```text
/openapi.json
```

### Swagger UI

![Swagger UI](docs/images/swagger-functional.png)

### OpenAPI JSON

![OpenAPI JSON](docs/images/openapi-json.png)

## Database Snapshots

### Links table

![PostgreSQL Link table](docs/images/postgres-dba.png)

### Daily click aggregates

![PostgreSQL ClickEventDaily table](docs/images/postgres-dba-clickevent.png)

## Railway Deployment

### API service logs

![Railway API logs](docs/images/flashlink-service1.png)

### Worker service logs

![Railway Worker logs](docs/images/flashlink-worker1.png)

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

Example:

```env
NODE_ENV=development
PORT=3000
BASE_URL=http://127.0.0.1:3000
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

### 3. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 4. Apply migrations

```bash
npx prisma migrate dev
```

### 5. Run the API

```bash
npm run dev
```

### 6. Run the worker

```bash
npm run worker:dev
```

### 7. Open Swagger

```text
http://127.0.0.1:3000/docs
```

## Docker

### Build and run the full stack

```bash
docker compose up --build
```

This starts:

- API
- Worker
- PostgreSQL
- Redis

### Useful commands

```bash
docker compose down
npm run build
npm run typecheck
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

### End-to-end tests

Requires PostgreSQL, Redis, and the worker:

```bash
docker compose up -d postgres redis
npm run worker:dev
npm run test:e2e
```

### Full test suite

```bash
npm run test:run
```

## CI

GitHub Actions runs:

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

This project is designed to deploy cleanly on Railway using four services in the same project:

- API
- Worker
- PostgreSQL
- Redis

### API service

- public domain enabled
- Dockerfile path: `docker/api/Dockerfile`
- start command:

```bash
sh -c "npx prisma migrate deploy && node dist/server.js"
```

### Worker service

- no public domain required
- Dockerfile path: `docker/worker/Dockerfile`
- start command:

```bash
sh -c "npx prisma migrate deploy && node dist/worker.js"
```

## Scalability Considerations

This project intentionally includes several production-oriented backend patterns:

- **Cache-aside redirect reads** reduce database pressure on hot links.
- **Async analytics processing** keeps redirect latency low.
- **Worker separation** isolates background processing from the request path.
- **Feature flags** make behavior configurable without code changes.
- **Graceful shutdown** improves deploy safety and service reliability.
- **Dockerized services** provide consistent local and cloud execution.
- **Typed schemas and CI** improve maintainability and correctness.

## Notes About Empty Folders

It is safe to remove empty folders that are no longer used.

Recommended rule:
- keep folders that communicate real architecture or are about to be used
- remove folders that stayed empty after implementation and are not needed anymore

A clean repository is better than keeping placeholder folders indefinitely.

## License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

## Author

**Marcos Astudillo**

- Website: https://www.marcosastudillo.com
- GitHub: https://github.com/marcos-astudillo
