import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Ruta: POST /api/transactions/transfer
  @Post('transfer')
  async transfer(@Body() dto: CreateTransferDto, @Request() req) {
    return await this.transactionsService.transferCredits(
      req.user.id, 
      dto.receiverId, 
      dto.amount, 
      dto.concept, 
      dto.serviceId
    );
  }

  // Ruta: GET /api/transactions/history
  @Get('history')
  async getHistory(@Request() req) {
    return await this.transactionsService.getUserHistory(req.user.id);
  }
}