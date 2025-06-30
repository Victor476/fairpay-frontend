FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte e construir a aplicação
COPY . .
RUN npm run build

# Imagem final otimizada
FROM node:20-alpine AS runner

WORKDIR /app

# Definir ambiente como produção
ENV NODE_ENV production
ENV PORT 3000

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./

# Expor a porta do Next.js
EXPOSE 3000

# Iniciar aplicação
CMD ["npm", "start"]