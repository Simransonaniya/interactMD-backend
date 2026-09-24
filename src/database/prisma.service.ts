import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isAvailable = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isAvailable = true;
      this.logger.log('Connected to database successfully via Prisma.');
    } catch (err) {
      this.isAvailable = false;
      this.logger.warn(`Database connection deferred or offline: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}
