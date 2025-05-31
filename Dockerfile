# Dockerfile
# Production-grade Dockerfile for Nuxt 3 with PNPM and Node 22 Alpine, multi-stage build
# --- Stage 1: Base Image Setup ---
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# --- Stage 2: Dependencies Installation ---
FROM base AS builder

# Install pnpm globally
RUN npm install -g pnpm@latest

COPY scripts/ ./scripts
COPY .npmrc ./
COPY .nuxtignore ./
COPY package*.json ./
COPY pnpm-*.yaml ./
COPY *.config.ts ./
COPY tsconfig.json ./
COPY public/ ./public
COPY . .

# Install dependencies
RUN pnpm install
RUN NODE_OPTIONS="--max-old-space-size=4096" pnpm build

FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

RUN apk add --no-cache curl

# Copy the .output directory from the builder stage
COPY --from=builder /app/.output ./.output

COPY --from=builder /app/.env ./.env

ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000

# Command to run the Nuxt application
CMD ["node", ".output/server/index.mjs"]
