import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly redis: Redis;
  private readonly windowMs = 60_000; // 1 minute
  private readonly maxRequests = 100;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `ratelimit:${ip}:${req.path}`;

    try {
      const current = await this.redis.incr(key);

      if (current === 1) {
        await this.redis.pexpire(key, this.windowMs);
      }

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - current));

      if (current > this.maxRequests) {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          status: 'error',
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        });
        return;
      }

      next();
    } catch (error) {
      this.logger.warn('Rate limiting unavailable, allowing request:', error);
      next();
    }
  }
}
