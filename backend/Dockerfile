# syntax=docker/dockerfile:1
# https://docs.docker.com/go/dockerfile-reference/


FROM oven/bun:latest AS base
COPY .. /app
WORKDIR /app
RUN bun install --frozen-lockfile --production
RUN bun build --filter backend
USER bun

ENTRYPOINT ["bun", "run", "start:prod"]
