import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /api/reviews/:requestId -> Para crear una reseña
  @UseGuards(JwtAuthGuard)
  @Post(':requestId')
  async create(
    @Request() req,
    @Param('requestId') requestId: string,
    @Body() body: { rating: number; comment: string }
  ) {
    return this.reviewsService.createReview(
      req.user.id, 
      requestId, 
      body.rating, 
      body.comment
    );
  }

  // GET /api/reviews/service/:serviceId -> Para ver las reseñas en el marketplace
  @Get('service/:serviceId')
  async getByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }
}