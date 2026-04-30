import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException, Patch, Delete } from '@nestjs/common';
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

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllReviews(@Request() req) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.reviewsService.findAll();
  }

  @Patch(':id/censor')
  @UseGuards(JwtAuthGuard)
  async censorReview(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.reviewsService.censorReview(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Request() req, @Param('id') id: string) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admin only');
    return this.reviewsService.deleteReview(id);
  }
}