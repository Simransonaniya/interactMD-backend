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

CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ] || [ \"$DATABASE_URL\" = \"\" ]; then export DATABASE_URL='postgresql://interactmd_user:7AUTranNblFQY9MJfOCL7g0NeBIrNqNh@dpg-dar1g2942hec73cl5at0-a/interactmd'; fi; npx prisma db push --skip-generate || echo 'Prisma sync deferred'; node dist/src/main.js"]
