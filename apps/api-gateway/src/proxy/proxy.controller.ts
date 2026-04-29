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

  private resolveRoute(path: string): ServiceRoute | undefined {
    if (/^\/api\/v1\/events\/[^/]+\/(register|attendees)(\/.*)?$/i.test(path)) {
      return this.serviceRoutes.find((r) => r.prefix === '/registrations');
    }

    return this.serviceRoutes.find((r) => path.startsWith(`/api/v1${r.prefix}`));
  }

  @Public()
  @All('*')
  async proxyRequest(@Req() req: Request, @Res() res: Response): Promise<void> {
    const path = req.path;
    const route = this.resolveRoute(path);

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

    // Strip the /api/v1 prefix before forwarding — downstream services
    // register routes without a global prefix (e.g. /events, /users).
    const downstreamPath = path.replace(/^\/api\/v1/, '');
    this.logger.debug(`Proxying ${req.method} ${path} → ${route.target}${downstreamPath}`);

    // In production, use http-proxy-middleware or a proper reverse proxy.
    // This is a simplified proxy for development scaffolding.
    try {
      // Preserve original query string
      const qs = req.originalUrl.includes('?')
        ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
        : '';
      const targetUrl = `${route.target}${downstreamPath}${qs}`;
      const headers: Record<string, string> = {};

      if (req.headers['content-type']) {
        headers['content-type'] = req.headers['content-type'];
      }

      if (req.headers.authorization) {
        headers['authorization'] = req.headers.authorization;
      }

      if (req.headers['x-correlation-id']) {
        headers['x-correlation-id'] = req.headers['x-correlation-id'] as string;
      }

      const isBodylessMethod = ['GET', 'HEAD'].includes(req.method);
      const isMultipart =
        typeof req.headers['content-type'] === 'string' &&
        req.headers['content-type'].includes('multipart/form-data');

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: isBodylessMethod
          ? undefined
          : isMultipart
            ? (req as unknown as ReadableStream)
            : JSON.stringify(req.body),
        ...(isBodylessMethod || !isMultipart ? {} : { duplex: 'half' as const }),
      });

      const responseContentType = response.headers.get('content-type') ?? '';

      if (responseContentType.includes('application/json')) {
        const data = await response.json();
        res.status(response.status).json(data);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      if (responseContentType) {
        res.setHeader('content-type', responseContentType);
      }
      res.status(response.status).send(Buffer.from(arrayBuffer));
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
