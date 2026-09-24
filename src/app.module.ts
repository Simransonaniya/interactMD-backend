import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';

// Infrastructure Modules
import { DatabaseModule } from './database/database.module';

// Core Business & Domain Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CasesModule } from './cases/cases.module';
import { CaseVersionsModule } from './case-versions/case-versions.module';
import { PatientsModule } from './patients/patients.module';
import { SimulationModule } from './simulation/simulation.module';
import { AIModule } from './ai/ai.module';
import { InvestigationsModule } from './investigations/investigations.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';

// Common Guards & Filters
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CasesModule,
    CaseVersionsModule,
    PatientsModule,
    SimulationModule,
    AIModule,
    InvestigationsModule,
    DiagnosisModule,
    EvaluationModule,
    RecommendationsModule,
    DashboardModule,
    AdminModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
