import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

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
}