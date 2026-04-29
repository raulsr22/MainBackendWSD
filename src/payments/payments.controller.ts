import { Controller, Post, Get, Body, UseGuards, Request, Query, Headers, Req, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createCheckoutSession(@Request() req, @Body('amount') amount: number) {
    return this.paymentsService.createCheckoutSession(req.user.id, amount);
  }

  // Angular llamará aquí cuando vuelva de Stripe
  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyPayment(@Request() req, @Query('session_id') sessionId: string) {
    return this.paymentsService.verifyPayment(sessionId, req.user.id);
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('El cuerpo de la petición (Raw Body) está vacío o no se ha podido leer');
    }

    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }
}