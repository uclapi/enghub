FROM node:16-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED 1

COPY package.json package-lock.json prisma ./
RUN npm ci

COPY . .
RUN npm run build && npm install --production

FROM node:16-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "run", "start:migrate"]
