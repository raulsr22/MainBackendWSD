import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { User } from '../users/entities/user.entity';

@Module({
  // Importamos la entidad User para poder modificar el saldo
  imports: [TypeOrmModule.forFeature([User])], 
  providers: [PaymentsService],
  controllers: [PaymentsController]
})
export class PaymentsModule {}