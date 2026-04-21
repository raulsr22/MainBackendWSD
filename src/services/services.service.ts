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

  async findAllActive(searchTerm?: string, maxPrice?: number): Promise<Service[]> {
    const query = this.servicesRepository.createQueryBuilder('service')
      .leftJoin('service.provider', 'provider')
      .select([
        'service.id', 'service.title', 'service.description', 
        'service.price', 'service.status', 'service.createdAt',
        'provider.id', 'provider.fullName'
      ])
      .where('service.status = :status', { status: ServiceStatus.ACTIVE });

    if (searchTerm) {
      query.andWhere(
        '(LOWER(service.title) LIKE LOWER(:search) OR LOWER(service.description) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` }
      );
    }

    if (maxPrice) {
      query.andWhere('service.price <= :maxPrice', { maxPrice });
    }

    query.orderBy('service.createdAt', 'DESC');

    return await query.getMany();
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

  async remove(id: string, userId: string, role: string): Promise<void> {
    const service = await this.findOne(id);

    if (service.provider.id !== userId && role !== 'admin') {
      throw new ForbiddenException('No tienes permiso para eliminar este servicio.');
    }
    
    service.status = ServiceStatus.CANCELLED;
    await this.servicesRepository.save(service);
  }

  async findMyServices(userId: string): Promise<Service[]> {
  return await this.servicesRepository.find({
    where: { provider: { id: userId } },
  });
}
}