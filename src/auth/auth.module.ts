import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule, // Importamos el módulo de usuarios
    JwtModule.register({
      global: true,
      secret: 'timebank_jwt_token123456', 
      signOptions: { expiresIn: '24h' }, // El token caduca en 24 horas
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
