# Flashlink Service

Flashlink Service is a production-oriented backend URL shortener built from a distributed system design document.

## Goals

- Low-latency redirects
- Durable URL storage
- Cache-first reads
- Async analytics pipeline
- Clean, modular backend architecture

## Planned stack

- Node.js
- TypeScript
- Fastify
- PostgreSQL
- Redis
- Docker
- GitHub Actions

## Project status

Phase 1 in progress: project bootstrap and backend foundations.

## Architecture summary

This project follows a URL shortener architecture with:

- API service for short link creation
- Redirect service optimized for low latency
- Redis cache for hot mappings
- PostgreSQL for durable storage
- Async queue and analytics worker for click processing

## Repository structure

```txt
src/
tests/
docker/
scripts/
prisma/
.github/workflows/

>Notes: This repository is being built step-by-step following a professional backend engineering workflow.