import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationPreferences,
  NotificationPreferencesDocument,
} from './schemas/notification-preferences.schema.js';

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(
    @InjectModel(NotificationPreferences.name)
    private readonly preferencesModel: Model<NotificationPreferencesDocument>,
  ) {}

  async getByUser(userId: string): Promise<NotificationPreferencesDocument> {
    const existing = await this.preferencesModel.findOne({ userId }).exec();

    if (existing) {
      return existing;
    }

    return this.createDefault(userId);
  }

  async upsert(
    userId: string,
    updates: Record<string, unknown>,
  ): Promise<NotificationPreferencesDocument> {
    this.logger.log(`Upserting notification preferences for user=${userId}`);

    const preferences = await this.preferencesModel
      .findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();

    return preferences!;
  }

  async createDefault(userId: string): Promise<NotificationPreferencesDocument> {
    this.logger.log(`Creating default notification preferences for user=${userId}`);

    const preferences = new this.preferencesModel({
      userId,
      channels: {
        email: { enabled: true, frequency: 'instant' },
        inApp: { enabled: true },
        push: { enabled: true },
      },
      types: {},
    });

    return preferences.save();
  }
}
