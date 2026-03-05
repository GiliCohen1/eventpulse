import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CorrelationIdMiddleware } from '@eventpulse/common';
import { AuthModule } from './auth/auth.module.js';
import { ProxyModule } from './proxy/proxy.module.js';
import { WebsocketModule } from './websocket/websocket.module.js';
import { RateLimitingModule } from './rate-limiting/rate-limiting.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ProxyModule,
    WebsocketModule,
    RateLimitingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
