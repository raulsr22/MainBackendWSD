import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestStatus } from './enums/request-status.enum';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  createRequest(@Body('serviceId') serviceId: string, @Request() req) {
    return this.requestsService.createRequest(req.user.id, serviceId);
  }

  @Get('me')
  getMyRequests(@Request() req) {
    return this.requestsService.getMyRequests(req.user.id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: RequestStatus, @Request() req) {
    return this.requestsService.updateStatus(req.user.id, id, status);
  }
}