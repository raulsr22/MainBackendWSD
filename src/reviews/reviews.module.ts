import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ServiceRequest } from '../requests/entities/request.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [
    // Registramos las entidades que usa este módulo
    TypeOrmModule.forFeature([Review, ServiceRequest, Service])
  ],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService]
})
export class ReviewsModule {}