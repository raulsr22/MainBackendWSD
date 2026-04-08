import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceStatus } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto, providerId: string): Promise<Service> {
    const newService = this.servicesRepository.create({
      ...createServiceDto,
      provider: { id: providerId }, 
    });
    
    return await this.servicesRepository.save(newService);
  }

  async findAllActive(): Promise<Service[]> {
    // Solo devolvemos los servicios activos y, además, incluimos los datos de quién lo ofrece
    return await this.servicesRepository.find({
      where: { status: ServiceStatus.ACTIVE },
      relations: ['provider'],
      select: {
        provider: {
          id: true,
          fullName: true, // Solo mandamos el ID y el nombre
        }
      }
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['provider'],
      select: { provider: { id: true, fullName: true, email: true } }
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }
    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string): Promise<Service> {
    const service = await this.findOne(id);

    if (service.provider.id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este servicio.');
    }

    Object.assign(service, updateServiceDto);
    
    return await this.servicesRepository.save(service);
  }

  async remove(id: string, userId: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.provider.id !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este servicio.');
    }

    // En lugar de usar .remove() y borrarlo físicamente de la base de datos, es mejor cambiar su estado a CANCELLED para mantener el historial.
    service.status = ServiceStatus.CANCELLED;
    await this.servicesRepository.save(service);
  }
}