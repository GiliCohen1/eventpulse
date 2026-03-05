import { All, Controller, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/public.decorator.js';

interface ServiceRoute {
  prefix: string;
  target: string;
}

@Controller()
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);
  private readonly serviceRoutes: ServiceRoute[];

  constructor(private readonly configService: ConfigService) {
    const userServicePort = this.configService.get('USER_SERVICE_PORT', '3001');
    const eventServicePort = this.configService.get('EVENT_SERVICE_PORT', '3002');
    const ticketServicePort = this.configService.get('TICKET_SERVICE_PORT', '3003');
    const chatServicePort = this.configService.get('CHAT_SERVICE_PORT', '3004');
    const notificationServicePort = this.configService.get('NOTIFICATION_SERVICE_PORT', '3005');
    const analyticsServicePort = this.configService.get('ANALYTICS_SERVICE_PORT', '3006');

    this.serviceRoutes = [
      { prefix: '/auth', target: `http://localhost:${userServicePort}` },
      { prefix: '/users', target: `http://localhost:${userServicePort}` },
      { prefix: '/organizations', target: `http://localhost:${userServicePort}` },
      { prefix: '/events', target: `http://localhost:${eventServicePort}` },
      { prefix: '/categories', target: `http://localhost:${eventServicePort}` },
      { prefix: '/registrations', target: `http://localhost:${ticketServicePort}` },
      { prefix: '/tickets', target: `http://localhost:${ticketServicePort}` },
      { prefix: '/chat', target: `http://localhost:${chatServicePort}` },
      { prefix: '/notifications', target: `http://localhost:${notificationServicePort}` },
      { prefix: '/analytics', target: `http://localhost:${analyticsServicePort}` },
    ];
  }

  @Public()
  @All('*')
  async proxyRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path = req.path;
    const route = this.serviceRoutes.find((r) => path.startsWith(`/api/v1${r.prefix}`));

    if (!route) {
      res.status(HttpStatus.NOT_FOUND).json({
        status: 'error',
        error: {
          code: 'NOT_FOUND',
          message: `Route ${path} not found`,
        },
      });
      return;
    }

    this.logger.debug(`Proxying ${req.method} ${path} → ${route.target}`);

    // In production, use http-proxy-middleware or a proper reverse proxy.
    // This is a simplified proxy for development scaffolding.
    try {
      const targetUrl = `${route.target}${path}`;
      const headers: Record<string, string> = {
        'content-type': req.headers['content-type'] ?? 'application/json',
      };

      if (req.headers.authorization) {
        headers['authorization'] = req.headers.authorization;
      }

      if (req.headers['x-correlation-id']) {
        headers['x-correlation-id'] = req.headers['x-correlation-id'] as string;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      this.logger.error(`Proxy error for ${path}:`, error);
      res.status(HttpStatus.BAD_GATEWAY).json({
        status: 'error',
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'The requested service is currently unavailable',
        },
      });
    }
  }
}
