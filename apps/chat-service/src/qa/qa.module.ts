import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QAQuestion, QAQuestionSchema } from './schemas/qa-question.schema.js';
import { QaController } from './qa.controller.js';
import { QaService } from './qa.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: QAQuestion.name, schema: QAQuestionSchema }])],
  controllers: [QaController],
  providers: [QaService],
  exports: [QaService],
})
export class QaModule {}
