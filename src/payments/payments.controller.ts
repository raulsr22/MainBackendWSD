import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('payments')
@UseGuards(JwtAuthGuard) // Protegemos todo el controlador
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  async createCheckoutSession(@Request() req, @Body('amount') amount: number) {
    return this.paymentsService.createCheckoutSession(req.user.id, amount);
  }

  // Angular llamará aquí cuando vuelva de Stripe
  @Get('verify')
  async verifyPayment(@Request() req, @Query('session_id') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId, req.user.id);
  }
}