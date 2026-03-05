import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { NotificationType } from '@eventpulse/shared-types';
import { Notification, NotificationDocument } from './schemas/notification.schema.js';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
  };
  expiresAt?: Date | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<NotificationDocument> {
    this.logger.log(`Creating notification type=${dto.type} for user=${dto.userId}`);

    const notification = new this.notificationModel({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data ?? {},
      channels: {
        inApp: {
          sent: dto.channels?.inApp !== false,
          sentAt: dto.channels?.inApp !== false ? new Date() : null,
          readAt: null,
        },
        email: {
          sent: dto.channels?.email === true,
          sentAt: dto.channels?.email === true ? new Date() : null,
          messageId: null,
        },
        push: {
          sent: false,
          reason: dto.channels?.push === true ? null : 'push_not_enabled',
        },
      },
      isRead: false,
      expiresAt: dto.expiresAt ?? null,
    });

    return notification.save();
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: NotificationDocument[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId }).exec(),
    ]);

    return { data, total, page, limit };
  }

  async markAsRead(userId: string, notificationId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, userId },
        {
          $set: {
            isRead: true,
            'channels.inApp.readAt': new Date(),
          },
        },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    return notification;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { userId, isRead: false },
        {
          $set: {
            isRead: true,
            'channels.inApp.readAt': new Date(),
          },
        },
      )
      .exec();

    return result.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, isRead: false }).exec();
  }
}
