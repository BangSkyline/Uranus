# Étape de base
FROM node:20-alpine AS base

# 1. Installation des dépendances
FROM base AS deps
WORKDIR /app
# 1. Installation des dépendances
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# 2. Construction de l'application Next.js
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN npx prisma generate
RUN npm run build
RUN test -f /app/server.js || (echo "server.js not found, ensure 'output: standalone' is set in next.config.js" && exit 1)

# 3. Exécution de l'application
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Le port par défaut de Next.js est 3000
EXPOSE 3000

# Copier les fichiers nécessaires
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/schema.prisma ./schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts  # Copy scripts/ for seeding

# Script d'entrée pour les migrations et seeding
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]

# Vérification de la santé
HEALTHCHECK --interval=30s --timeout=3s \
CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
