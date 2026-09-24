import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'interactmd_super_secure_jwt_secret_dev_2026_clinical_sim',
    });
  }

  async validate(payload: any) {
    if (this.prisma.isAvailable) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (user) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
          };
        }
      } catch {
        // Offline / deferred database token validation
      }
    }

    // Resilient fallback for demo accounts / dev tokens
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'LEARNER',
      organizationId: payload.organizationId || null,
    };
  }
}
