import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'learner@interactmd.com', description: 'Unique email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!', description: 'Strong password (min 6 characters)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Sarah', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Jenkins', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.LEARNER, description: 'Role assigned to user' })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'org-uuid-1', description: 'Associated institutional organization ID' })
  @IsString()
  @IsOptional()
  organizationId?: string;
}
