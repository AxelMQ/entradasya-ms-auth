# ==============================================================================
# Dockerfile: ms-auth (Node.js 20 TypeScript - Alpine Multi-Stage)
# ==============================================================================

# Etapa 1: Compilación TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build
RUN npm prune --omit=dev

# Etapa 2: Imagen final ligera de producción
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar wget o curl para healthcheck si es necesario
RUN apk add --no-cache curl

ENV NODE_ENV=production \
    PORT=8001

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Usuario no-root para seguridad DevSecOps
USER node

EXPOSE 8001

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["node", "dist/index.js"]
