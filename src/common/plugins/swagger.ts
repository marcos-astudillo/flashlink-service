import { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Flashlink Service API",
        description: `
Production-ready URL shortener backend built with Fastify, PostgreSQL, Redis and BullMQ.

Main features:
- Short link creation
- Redirect resolution
- Redis cache-aside strategy
- Async click analytics worker
- Rate limiting
- Optional expiration
- Health checks
        `.trim(),
        version: "1.0.0",
        contact: {
          name: "Marcos Astudillo",
          url: "www.marcosastudillo.com",
        },
      },
      servers: [
        {
          url: process.env.BASE_URL || "http://127.0.0.1:3000",
          description: "Current environment",
        },
      ],
      tags: [
        {
          name: "Links",
          description: "Short link creation and link statistics",
        },
        {
          name: "Redirect",
          description: "Short code resolution and redirect flow",
        },
      ],
      externalDocs: {
        url: "https://github.com/marcos-astudillo/flashlink-service",
        description: "GitHub repository",
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformSpecificationClone: true,
    // theme: {
    //   css: [
    //     {
    //       filename: "custom-theme.css",
    //       content: `
    //         .swagger-ui {
    //           padding-bottom: 64px;
    //         }

    //         .swagger-ui .wrapper {
    //           padding-bottom: 64px;
    //         }
    //       `,
    //     },
    //   ],
    // },
  });
}
