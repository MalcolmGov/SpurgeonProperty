# Railway build — explicit Node.js so Railpack doesn't mis-detect the
# Python utility scripts in this repo as a Python project.
FROM node:20-slim

# System deps — vips for sharp (if used by image libs), curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so npm install is cached across builds when deps
# don't change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source and build
COPY . .
RUN npm run build

# Runtime
ENV NODE_ENV=production
# Don't hardcode PORT — Railway injects its own PORT env var and the
# server reads process.env.PORT. Hardcoding here breaks Railway's
# public-domain routing because Railway wires the domain to whatever
# port it assigned, not 5000.

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT:-5000}/health" || exit 1

CMD ["npm", "start"]
