import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({ description: 'The answer content', example: 'The keynote starts at 10:00 AM.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
