import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') 
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('login') 
  async login(@Body() loginDto: Record<string, any>) {
    return await this.authService.login(loginDto.email, loginDto.password);
  }
}