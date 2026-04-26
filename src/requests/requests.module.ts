import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { ServiceRequest } from './entities/request.entity';
import { Service } from '../services/entities/service.entity';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest, Service]),
    TransactionsModule 
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}