import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationKafkaConsumer } from '../kafka/notification-kafka.consumer.js';
import { EmailModule } from '../email/email.module.js';
import { PreferencesModule } from '../preferences/preferences.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    EmailModule,
    PreferencesModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationKafkaConsumer],
  exports: [NotificationsService],
})
export class NotificationsModule {}
