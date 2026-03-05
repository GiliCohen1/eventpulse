import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type { RoomType, ParticipantRole } from '@eventpulse/shared-types';
import { Room, RoomDocument } from './schemas/room.schema.js';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(@InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>) {}

  async createRoom(eventId: string, type: RoomType, name: string): Promise<RoomDocument> {
    const roomId = uuidv4();
    this.logger.log(`Creating room roomId=${roomId} for event=${eventId} type=${type}`);

    const room = new this.roomModel({
      roomId,
      eventId,
      type,
      name,
      participants: [],
      participantCount: 0,
      isActive: true,
      settings: {
        slowMode: false,
        slowModeInterval: 5,
        onlyOrganizersCanPost: false,
        maxMessageLength: 500,
      },
    });

    return room.save();
  }

  async findByEventId(eventId: string): Promise<RoomDocument[]> {
    return this.roomModel.find({ eventId }).exec();
  }

  async findByRoomId(roomId: string): Promise<RoomDocument> {
    const room = await this.roomModel.findOne({ roomId }).exec();

    if (!room) {
      throw new NotFoundException(`Room with roomId=${roomId} not found`);
    }

    return room;
  }

  async findByEventIdAndType(eventId: string, type: RoomType): Promise<RoomDocument | null> {
    return this.roomModel.findOne({ eventId, type }).exec();
  }

  async addParticipant(
    roomId: string,
    userId: string,
    role: ParticipantRole = 'attendee',
  ): Promise<RoomDocument> {
    const room = await this.findByRoomId(roomId);

    const alreadyJoined = room.participants.some((p) => p.userId === userId);
    if (alreadyJoined) {
      return room;
    }

    room.participants.push({ userId, joinedAt: new Date(), role });
    room.participantCount = room.participants.length;

    return room.save();
  }

  async removeParticipant(roomId: string, userId: string): Promise<RoomDocument> {
    const room = await this.findByRoomId(roomId);

    room.participants = room.participants.filter((p) => p.userId !== userId);
    room.participantCount = room.participants.length;

    return room.save();
  }

  async deactivateRoom(roomId: string): Promise<RoomDocument> {
    const room = await this.findByRoomId(roomId);
    room.isActive = false;
    return room.save();
  }

  async deactivateByEventId(eventId: string): Promise<void> {
    this.logger.log(`Deactivating all rooms for event=${eventId}`);
    await this.roomModel.updateMany({ eventId }, { isActive: false }).exec();
  }

  async activateByEventId(eventId: string): Promise<void> {
    this.logger.log(`Activating all rooms for event=${eventId}`);
    await this.roomModel.updateMany({ eventId }, { isActive: true }).exec();
  }
}
