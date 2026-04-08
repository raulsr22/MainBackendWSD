import { ServiceStatus } from '../entities/service.entity';

export class UpdateServiceDto {
  title?: string;
  description?: string;
  price?: number;
  status?: ServiceStatus; // Permitimos cambiar el estado (ej. para pausarlo temporalmente)
}