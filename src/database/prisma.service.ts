import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const RENDER_POSTGRES_DEFAULT = 'postgresql://interactmd_user:7AUTranNblFQY9MJfOCL7g0NeBIrNqNh@dpg-dar1g2942hec73cl5at0-a/interactmd';

function getNormalizedDatabaseUrl(): string {
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl && fs.existsSync('/etc/secrets/DATABASE_URL')) {
    try {
      dbUrl = fs.readFileSync('/etc/secrets/DATABASE_URL', 'utf-8').trim();
    } catch {
      // ignore
    }
  }

  if (!dbUrl || dbUrl.trim() === '') {
    dbUrl = RENDER_POSTGRES_DEFAULT;
    process.env.DATABASE_URL = dbUrl;
  }

  if (dbUrl && !dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    if (dbUrl.includes('@dpg-') || dbUrl.startsWith('dpg-') || dbUrl.includes('interactmd')) {
      const hostPart = dbUrl.includes('@') ? dbUrl.split('@')[1] : dbUrl;
      dbUrl = `postgresql://interactmd_user:7AUTranNblFQY9MJfOCL7g0NeBIrNqNh@${hostPart}`;
      process.env.DATABASE_URL = dbUrl;
    } else {
      dbUrl = RENDER_POSTGRES_DEFAULT;
      process.env.DATABASE_URL = dbUrl;
    }
  }
  return dbUrl;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isAvailable = false;

  constructor() {
    const url = getNormalizedDatabaseUrl();
    const isValid = url && (url.startsWith('postgresql://') || url.startsWith('postgres://'));
    super(isValid ? { datasources: { db: { url } } } : undefined);
  }

  async onModuleInit() {
    const url = getNormalizedDatabaseUrl();
    const isValid = url && (url.startsWith('postgresql://') || url.startsWith('postgres://'));
    if (!isValid) {
      this.isAvailable = false;
      this.logger.warn('DATABASE_URL is not configured with postgresql:// prefix. Database connection deferred.');
      return;
    }

    try {
      await this.$connect();
      this.isAvailable = true;
      this.logger.log('Connected to PostgreSQL database successfully via Prisma.');
    } catch (err) {
      this.isAvailable = false;
      this.logger.warn(`Database connection deferred or offline: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.isAvailable) {
      await this.$disconnect();
      this.logger.log('Disconnected from database.');
    }
  }
}
