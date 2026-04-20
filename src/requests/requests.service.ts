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

  // 1. Crear la solicitud (NO COBRA NADA TODAVÍA)
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

  // 2. Ver mis solicitudes (Las que pido y las que me piden)
  async getMyRequests(userId: string) {
    return await this.requestRepo.find({
      where: [ { requester: { id: userId } }, { provider: { id: userId } } ],
      relations: ['requester', 'provider', 'service'],
      order: { createdAt: 'DESC' }
    });
  }

  // 3. Cambiar el estado (Aceptar, Rechazar, Completar)
  async updateStatus(userId: string, requestId: string, newStatus: RequestStatus) {
    const request = await this.requestRepo.findOne({ where: { id: requestId }, relations: ['requester', 'provider', 'service'] });
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    // Solo el dueño del servicio puede ACEPTAR o RECHAZAR
    if ((newStatus === RequestStatus.ACCEPTED || newStatus === RequestStatus.REJECTED) && request.provider.id !== userId) {
      throw new BadRequestException('Solo el proveedor puede aceptar o rechazar');
    }

    // SI SE COMPLETA EL TRABAJO -> ¡COBRAMOS! 💸
    if (newStatus === RequestStatus.COMPLETED && request.status !== RequestStatus.COMPLETED) {
      await this.transactionsService.transferCredits(
        request.requester.id, // El que paga
        request.provider.id,  // El que cobra
        request.agreedPrice,
        `Pago por servicio completado: ${request.service.title}`,
        request.service.id
      );
    }

    request.status = newStatus;
    return await this.requestRepo.save(request);
  }
}