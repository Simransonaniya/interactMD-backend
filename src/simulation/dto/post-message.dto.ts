import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PostMessageDto {
  @ApiProperty({ example: 'Can you tell me when the pain started and what you were doing?' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
