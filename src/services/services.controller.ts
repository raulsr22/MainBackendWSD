import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, Delete, Query } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateServiceDto } from './dto/update-service.dto';

@UseGuards(JwtAuthGuard) // Solo para usuarios logeados
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // Ruta: POST /api/services/
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto, @Request() req) {
    return await this.servicesService.create(createServiceDto, req.user.id);
  }

  // Ruta: GET /api/services/
  @Get()
  async findAll(@Query('search') search?: string, @Query('maxPrice') maxPrice?: string) {
    return await this.servicesService.findAllActive(
      search, 
      maxPrice ? +maxPrice : undefined
    );
  }

  @Get('my-services')
  @UseGuards(JwtAuthGuard)
  async getMyServices(@Request() req) {
    return await this.servicesService.findMyServices(req.user.id);
  }

  // Ruta: GET /api/services/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.servicesService.findOne(id);
  }

  // Ruta: PATCH /api/services/:id
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateServiceDto: UpdateServiceDto, 
    @Request() req
  ) {
    return await this.servicesService.update(id, updateServiceDto, req.user.id);
  }

  // Ruta: DELETE /api/services/:id
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return await this.servicesService.remove(id, req.user.id, req.user.role);
  }
}