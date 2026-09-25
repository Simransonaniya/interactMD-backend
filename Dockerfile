FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 8000

CMD ["sh", "-c", "if [ -f /etc/secrets/DATABASE_URL ] && [ -z \"$DATABASE_URL\" ]; then export DATABASE_URL=$(cat /etc/secrets/DATABASE_URL | tr -d '\\r\\n'); fi; case \"$DATABASE_URL\" in postgresql://*|postgres://*) npx prisma db push --skip-generate || echo 'Prisma db push deferred';; *) echo 'DATABASE_URL deferred, starting server...';; esac && node dist/src/main.js"]
