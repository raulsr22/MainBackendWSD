import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
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

  @Get('all')
  getAllRequests(@Request() req) {
    // Bloqueo de seguridad: Solo admins
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Acceso denegado: Solo administradores');
    }
    return this.requestsService.getAllRequests();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: RequestStatus, @Request() req) {
    return this.requestsService.updateStatus(req.user.id, id, status);
  }
}