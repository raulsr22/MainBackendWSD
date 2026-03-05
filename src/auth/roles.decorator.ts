import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

export const ROLES_KEY = 'roles';
// Este decorador nos permitirá poner @Roles(UserRole.ADMIN) encima de las rutas
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);