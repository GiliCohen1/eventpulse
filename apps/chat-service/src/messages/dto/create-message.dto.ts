import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MessageType } from '@eventpulse/shared-types';

export class CreateMessageDto {
  @ApiProperty({ description: 'Message content', example: 'Hello everyone!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content!: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['text', 'image', 'system'],
    default: 'text',
  })
  @IsEnum(['text', 'image', 'system'])
  @IsOptional()
  type?: MessageType = 'text';

  @ApiPropertyOptional({ description: 'ID of message being replied to' })
  @IsString()
  @IsOptional()
  replyTo?: string;
}
