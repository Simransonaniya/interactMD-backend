import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false, nullable: true })
  organizationId?: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT Access Token' })
  accessToken: string;

  @ApiProperty({ description: 'Token expiration format', example: '7d' })
  expiresIn: string;

  @ApiProperty({ type: UserSummaryDto })
  user: UserSummaryDto;
}
