# Stage 1: Build
FROM node:21.1.0-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* .env.production ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the project
RUN pnpm build

# Stage 2: Production
FROM node:21.1.0-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
COPY --from=builder /app/.env.production .env.production

# Install production dependencies only
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/esm/server.js"]