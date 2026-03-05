import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    description: 'Ticket code in EVP-XXXXXX format',
    example: 'EVP-A1B2C3',
  })
  @IsString()
  @IsNotEmpty()
  ticketCode!: string;
}
