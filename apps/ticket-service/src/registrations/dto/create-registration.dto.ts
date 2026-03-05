import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegistrationDto {
  @ApiProperty({
    description: 'UUID of the ticket tier to register for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  ticketTierId!: string;
}
