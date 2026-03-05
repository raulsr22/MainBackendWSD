import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'TU_PALABRA_SECRETA_SUPER_SEGURA', // Debe ser la misma que pusiste en auth.module.ts
    });
  }

  // NestJS ejecutará esto automáticamente si el token es válido
  async validate(payload: any) {
    // Esto inyectará el 'user' en el objeto request (req.user)
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}