import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestStatus } from './enums/request-status.enum';

@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // POST /api/requests -> Para crear una solicitud a un servicio
  @Post()
  createRequest(@Body('serviceId') serviceId: string, @Request() req) {
    return this.requestsService.createRequest(req.user.id, serviceId);
  }

  // GET /api/requests/me -> Para que un usuario vea sus solicitudes (tanto como cliente como proveedor)
  @Get('me')
  getMyRequests(@Request() req) {
    return this.requestsService.getMyRequests(req.user.id);
  }

  // GET /api/requests/all -> Para que el admin vea todas las solicitudes
  @Get('all')
  getAllRequests(@Request() req) {
    // Bloqueo de seguridad: Solo admins
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Acceso denegado: Solo administradores');
    }
    return this.requestsService.getAllRequests();
  }

  // PATCH /api/requests/:id/status -> Para que el proveedor acepte/rechace y para que ambos marquen como completada
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: RequestStatus, @Request() req) {
    return this.requestsService.updateStatus(req.user.id, id, status);
  }
}