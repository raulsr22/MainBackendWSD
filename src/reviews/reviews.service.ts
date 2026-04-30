import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
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
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['requester', 'service']
    });

    if (!request) throw new BadRequestException('Transaction not found');

    if (request.status !== 'COMPLETED') {
      throw new BadRequestException('Ratings must be linked to completed services only');
    }

    if (request.requester.id !== userId) {
      throw new ForbiddenException('Only the person who received the service can rate it');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { request: { id: requestId } }
    });
    if (existingReview) throw new BadRequestException('You have already rated this transaction');

    const review = this.reviewRepository.create({
      rating,
      comment,
      author: { id: userId } as any,
      service: request.service,
      request: request
    });

    const savedReview = await this.reviewRepository.save(review);

    request.review = savedReview;
    await this.requestRepository.save(request);

    return savedReview;
  }

  async findByService(serviceId: string) {
    return await this.reviewRepository.find({
      where: { service: { id: serviceId } },
      relations: ['author'],
      order: { createdAt: 'DESC' }
    });
  }

  async findAll() {
    return await this.reviewRepository.find({
      relations: ['author', 'service', 'request'],
      order: { createdAt: 'DESC' }
    });
  }

  async censorReview(id: string) {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    review.comment = '[CENSORED: This review text did not follow our community guidelines]';
    return await this.reviewRepository.save(review);
  }

  async deleteReview(id: string) {
    const review = await this.reviewRepository.findOne({ 
      where: { id }, 
      relations: ['request'] 
    });
    if (!review) throw new NotFoundException('Review not found');

    if (review.request) {
      review.request.review = null as any;
      await this.requestRepository.save(review.request);
    }

    await this.reviewRepository.remove(review);
  }
}