import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const MONGODB_ATLAS_DEFAULT = 'mongodb+srv://simransonaniya77_db_user:Vku0tJvToocNjQCn@cluster0.oubgq77.mongodb.net/interactmd?retryWrites=true&w=majority&appName=Cluster0';

function getNormalizedDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;
  if (!dbUrl && fs.existsSync('/etc/secrets/DATABASE_URL')) {
    try {
      dbUrl = fs.readFileSync('/etc/secrets/DATABASE_URL', 'utf-8').trim();
    } catch {
      // ignore
    }
  }

  if (!dbUrl || dbUrl.trim() === '' || (!dbUrl.startsWith('mongodb://') && !dbUrl.startsWith('mongodb+srv://'))) {
    dbUrl = MONGODB_ATLAS_DEFAULT;
    process.env.DATABASE_URL = dbUrl;
    process.env.MONGODB_URI = dbUrl;
  }

  return dbUrl;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isAvailable = false;

  constructor() {
    const url = getNormalizedDatabaseUrl();
    super({ datasources: { db: { url } } });
  }

  async onModuleInit() {
    const url = getNormalizedDatabaseUrl();
    this.logger.log(`Initializing MongoDB connection via Prisma to MongoDB Atlas...`);

    try {
      await this.$connect();
      this.isAvailable = true;
      this.logger.log('Connected to MongoDB Atlas database successfully via Prisma.');
    } catch (err) {
      this.isAvailable = false;
      this.logger.warn(`MongoDB Atlas connection deferred or initializing: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.isAvailable) {
      await this.$disconnect();
      this.logger.log('Disconnected from MongoDB Atlas database.');
    }
  }
}
