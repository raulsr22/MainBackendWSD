import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard'; 
import { Roles } from '../auth/roles.decorator'; 
import { UserRole } from './entities/user.entity';
import { UsersService } from './users.service';
import { Patch, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me') // URL: GET http://localhost:3000/api/users/me
  async getProfile(@Request() req) {
    const user = await this.usersService.findOneByEmail(req.user.email);
    
    if (!user) {
      return null;
    }
    
    const { passwordHash, ...result } = user;
    return result; 
  }

  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @Get() // URL: GET http://localhost:3000/api/users
  async getAllUsers() {
    return this.usersService.findAll(); 
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status') // URL: PATCH http://localhost:3000/api/users/:id/status
  async toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleUserActiveStatus(id);
  }
}