import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest) private requestRepo: Repository<ServiceRequest>,
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
    private transactionsService: TransactionsService,
  ) {}

  async createRequest(requesterId: string, serviceId: string) {
    const service = await this.serviceRepo.findOne({ where: { id: serviceId }, relations: ['provider'] });
    if (!service) throw new NotFoundException('Servicio no encontrado');
    if (service.provider.id === requesterId) throw new BadRequestException('No puedes solicitar tu propio servicio');

    const request = this.requestRepo.create({
      requester: { id: requesterId },
      provider: { id: service.provider.id },
      service: { id: serviceId },
      agreedPrice: service.price,
      status: RequestStatus.PENDING
    });
    return await this.requestRepo.save(request);
  }

  async getMyRequests(userId: string) {
    return await this.requestRepo.find({
      where: [ { requester: { id: userId } }, { provider: { id: userId } } ],
      relations: ['requester', 'provider', 'service', 'review'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateStatus(userId: string, requestId: string, newStatus: RequestStatus) {
    const request = await this.requestRepo.findOne({ 
      where: { id: requestId }, 
      relations: ['requester', 'provider', 'service', 'review'] 
    });
    
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    // Seguridad: Solo el proveedor puede aceptar o rechazar
    if ((newStatus === RequestStatus.ACCEPTED || newStatus === RequestStatus.REJECTED) && request.provider.id !== userId) {
      throw new BadRequestException('Solo el proveedor puede aceptar o rechazar esta solicitud');
    }

    if (!request.requester?.id || !request.provider?.id || !request.service?.id) {
      throw new BadRequestException('Datos incompletos para procesar la notificación');
    }

    // --- SISTEMA DE NOTIFICACIONES DIFERENCIADAS ---

    // CASO: ACEPTAR
    if (newStatus === RequestStatus.ACCEPTED && request.status !== RequestStatus.ACCEPTED) {
      // 1. Al Cliente (Aviso importante)
      await this.transactionsService.transferCredits(
        request.provider.id, request.requester.id, 0, 
        `NOTIFICATION: Your request for "${request.service.title}" was ACCEPTED!`,
        request.service.id
      );
      
      const requesterName = request.requester?.fullName || 'the client';

      await this.transactionsService.transferCredits(
        request.requester.id, 
        request.provider.id, 
        0, 
        `SYSTEM: Success! You have accepted the request from ${requesterName}.`,
        request.service.id
      );
    }

    // CASO: RECHAZAR
    if (newStatus === RequestStatus.REJECTED && request.status !== RequestStatus.REJECTED) {
      // Solo notificamos al cliente (el proveedor ya sabe que ha rechazado)
      await this.transactionsService.transferCredits(
        request.provider.id, request.requester.id, 0, 
        `NOTIFICATION: Your request for "${request.service.title}" was REJECTED.`,
        request.service.id
      );
    }

    // CASO: COMPLETAR (Pago + Notificación)
    if (newStatus === RequestStatus.COMPLETED && request.status !== RequestStatus.COMPLETED) {
      // Pago real de créditos
      await this.transactionsService.transferCredits(
        request.requester.id, request.provider.id, request.agreedPrice,
        `Payment for completed service: ${request.service.title}`,
        request.service.id
      );

      // Confirmación final al cliente
      await this.transactionsService.transferCredits(
        request.provider.id, request.requester.id, 0, 
        `NOTIFICATION: Service "${request.service.title}" completed. Credits transferred.`,
        request.service.id
      );
    }

    request.status = newStatus;
    return await this.requestRepo.save(request);
  }

  async getAllRequests() {
    return await this.requestRepo.find({
      relations: ['requester', 'provider', 'service', 'review'],
      order: { createdAt: 'DESC' }
    });
  }
}