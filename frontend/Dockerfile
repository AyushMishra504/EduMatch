# Next.js frontend image (standalone output — see next.config.ts).
#
# Build from the repo root:  docker build -f frontend/Dockerfile frontend
#
# NOTE: this image was authored but NOT built in the authoring environment (no
# Docker available there). Treat the first build as a smoke test.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The Prisma client is generated code — it must exist before `next build`.
# DATABASE_URL is only read at runtime, so a placeholder is enough here.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Standalone bundle + static assets. (There is no public/ directory yet; add a
# COPY line for it when static assets are introduced.)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma engines/query library are traced into the standalone bundle, but the
# schema is needed for `prisma migrate deploy` at rollout time.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
