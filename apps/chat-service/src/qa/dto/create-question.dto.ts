import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The question text', example: 'What time does the keynote start?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  question!: string;
}
