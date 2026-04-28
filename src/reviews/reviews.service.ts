import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ServiceRequest } from '../requests/entities/request.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ServiceRequest)
    private requestRepository: Repository<ServiceRequest>,
  ) {}

  async createReview(userId: string, requestId: string, rating: number, comment: string) {
    // 1. Buscamos la transacción (ServiceRequest) para verificar que existe
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['requester', 'service']
    });

    if (!request) throw new BadRequestException('Transaction not found');

    // 2. REGLA OBLIGATORIA: Solo si el estado es 'COMPLETED'
    if (request.status !== 'COMPLETED') {
      throw new BadRequestException('Ratings must be linked to completed services only');
    }

    // 3. SEGURIDAD: Solo el usuario que pidió el servicio puede valorarlo
    if (request.requester.id !== userId) {
      throw new ForbiddenException('Only the person who received the service can rate it');
    }

    // 4. EVITAR DUPLICADOS: ¿Ya valoró esta transacción?
    const existingReview = await this.reviewRepository.findOne({
      where: { request: { id: requestId } }
    });
    if (existingReview) throw new BadRequestException('You have already rated this transaction');

    // 5. Guardamos la reseña
    const review = this.reviewRepository.create({
      rating,
      comment,
      author: { id: userId } as any,
      service: request.service,
      request: request
    });

    return await this.reviewRepository.save(review);
  }

  // Para mostrar las estrellas en el Marketplace
  async findByService(serviceId: string) {
    return await this.reviewRepository.find({
      where: { service: { id: serviceId } },
      relations: ['author'],
      order: { createdAt: 'DESC' }
    });
  }
}