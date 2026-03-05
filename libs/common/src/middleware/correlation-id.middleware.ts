import { NestMiddleware, Injectable, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) ?? uuidv4();
    req.headers[CORRELATION_ID_HEADER] = correlationId;

    this.logger.debug(`[${correlationId}] ${req.method} ${req.url}`);

    next();
  }
}
