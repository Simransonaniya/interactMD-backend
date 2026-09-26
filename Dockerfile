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

CMD ["sh", "-c", "if [ -z \"$DATABASE_URL\" ] || [ \"$DATABASE_URL\" = \"\" ]; then export DATABASE_URL='mongodb+srv://simransonaniya77_db_user:Vku0tJvToocNjQCn@cluster0.oubgq77.mongodb.net/interactmd?retryWrites=true&w=majority&appName=Cluster0'; fi; npx prisma db push --skip-generate || echo 'Prisma MongoDB sync deferred'; node dist/src/main.js"]
