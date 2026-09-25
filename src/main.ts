import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';

// Auto-load Render secret files into process.env if present
const secretsDir = '/etc/secrets';
if (fs.existsSync(secretsDir)) {
  try {
    const files = fs.readdirSync(secretsDir);
    for (const file of files) {
      const filePath = path.join(secretsDir, file);
      if (fs.statSync(filePath).isFile()) {
        const val = fs.readFileSync(filePath, 'utf-8').trim();
        if (val && !process.env[file]) {
          process.env[file] = val;
        }
      }
    }
  } catch {
    // Ignore secret reading error
  }
}

// Auto-fix truncated PostgreSQL connection URLs
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL.trim();
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    if (url.includes('@dpg-') || url.startsWith('dpg-')) {
      const hostPart = url.includes('@') ? url.split('@')[1] : url;
      url = `postgresql://interactmd_user:7AUTranNblFQY9MJfOCL7g0NeBIrNqNh@${hostPart}`;
      process.env.DATABASE_URL = url;
    }
  }
}

async function bootstrap() {
  const logger = new Logger('InteractMD-Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 8000;
  const apiPrefix = configService.get<string>('apiPrefix') || '/api/v1';
  const corsOrigins = configService.get<string[]>('corsOrigin') || ['http://localhost:5173'];

  // Global Prefix (exclude root and health routes for uptime checks)
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/', 'health'],
  });

  // CORS Configuration
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive CORS
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('InteractMD API')
    .setDescription(
      'Enterprise Clinical Simulation & AI Patient Chatbot Backend API for Medical Learners.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT access token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Learner Profile', 'Learner details and simulation history')
    .addTag('Case Library', 'Curated clinical case catalog and search')
    .addTag('Case Versions & Lifecycle', 'Case snapshots and authoring workflow')
    .addTag('Simulation Encounter & AI Patient', 'Interactive virtual patient roleplaying')
    .addTag('Physical Exam & Controlled Investigations', 'Controlled physical findings and diagnostic tests')
    .addTag('Clinical Reasoning, Diagnosis & Management', 'Differential formulation and therapeutic orders')
    .addTag('OSCE Evaluation & Scoring', '5-dimension attending physician scoring engine')
    .addTag('Personalized Recommendations & Remediation', 'Weakness detection and targeted case practice')
    .addTag('Learner Dashboard & Analytics', 'Performance metrics and radar charts')
    .addTag('Admin & Case CMS', 'Case authoring and platform monitoring')
    .addTag('Educator & Cohort Analytics', 'Curriculum gaps and cohort insights')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`========================================================`);
  logger.log(`  InteractMD AI Clinical Simulation Backend Running!`);
  logger.log(`  Application URL: http://localhost:${port}${apiPrefix}`);
  logger.log(`  Swagger UI Docs: http://localhost:${port}/api/docs`);
  logger.log(`========================================================`);
}

bootstrap();
