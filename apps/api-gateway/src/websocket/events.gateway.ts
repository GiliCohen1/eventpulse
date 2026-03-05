import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    email: string;
    role: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  },
  transports: ['websocket'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth.token as string;
      const payload = this.jwtService.verify(token);

      client.data = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      this.logger.log(`Client connected: ${payload.sub}`);
    } catch {
      this.logger.warn('Unauthorized WebSocket connection attempt');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.data?.userId) {
      this.logger.log(`Client disconnected: ${client.data.userId}`);
    }
  }

  @SubscribeMessage('room:join')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { eventId: string; roomType: string },
  ): void {
    const roomId = `${payload.roomType}:${payload.eventId}`;
    client.join(roomId);

    this.server.to(roomId).emit('room:user_joined', {
      roomId,
      user: {
        userId: client.data.userId,
      },
    });

    this.logger.debug(`User ${client.data.userId} joined room ${roomId}`);
  }

  @SubscribeMessage('room:leave')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { eventId: string; roomType: string },
  ): void {
    const roomId = `${payload.roomType}:${payload.eventId}`;
    client.leave(roomId);

    this.server.to(roomId).emit('room:user_left', {
      roomId,
      userId: client.data.userId,
    });

    this.logger.debug(`User ${client.data.userId} left room ${roomId}`);
  }

  @SubscribeMessage('chat:send')
  handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; content: string; type: string; replyTo?: string },
  ): void {
    this.server.to(payload.roomId).emit('chat:message', {
      roomId: payload.roomId,
      sender: {
        userId: client.data.userId,
      },
      content: payload.content,
      type: payload.type,
      replyTo: payload.replyTo ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string; isTyping: boolean },
  ): void {
    client.to(payload.roomId).emit('chat:user_typing', {
      roomId: payload.roomId,
      userId: client.data.userId,
      isTyping: payload.isTyping,
    });
  }
}
