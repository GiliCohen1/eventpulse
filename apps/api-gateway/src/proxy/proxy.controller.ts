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
    const userServiceUrl = this.configService.get('USER_SERVICE_URL', 'http://localhost:3001');
    const eventServiceUrl = this.configService.get('EVENT_SERVICE_URL', 'http://localhost:3002');
    const ticketServiceUrl = this.configService.get('TICKET_SERVICE_URL', 'http://localhost:3003');
    const chatServiceUrl = this.configService.get('CHAT_SERVICE_URL', 'http://localhost:3004');
    const notificationServiceUrl = this.configService.get(
      'NOTIFICATION_SERVICE_URL',
      'http://localhost:3005',
    );
    const analyticsServiceUrl = this.configService.get(
      'ANALYTICS_SERVICE_URL',
      'http://localhost:3006',
    );

    this.serviceRoutes = [
      { prefix: '/auth', target: userServiceUrl },
      { prefix: '/users', target: userServiceUrl },
      { prefix: '/organizations', target: userServiceUrl },
      { prefix: '/events', target: eventServiceUrl },
      { prefix: '/categories', target: eventServiceUrl },
      { prefix: '/registrations', target: ticketServiceUrl },
      { prefix: '/tickets', target: ticketServiceUrl },
      { prefix: '/chat', target: chatServiceUrl },
      { prefix: '/notifications', target: notificationServiceUrl },
      { prefix: '/analytics', target: analyticsServiceUrl },
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
