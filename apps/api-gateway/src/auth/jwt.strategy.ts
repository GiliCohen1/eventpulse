import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { CurrentUserPayload } from '@eventpulse/common';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  orgRoles: Record<string, string>;
  iat: number;
  exp: number;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): CurrentUserPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      orgRoles: payload.orgRoles ?? {},
    };
  }
}
