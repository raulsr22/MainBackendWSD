import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UsersModule,TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'WSD',
      password: 'WSD', // Contraseña obviamente no segura, pero como es un proyecto de laboratorio, no es un gran problema
      database: 'wsd',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
