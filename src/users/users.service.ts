import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await this.hashPassword(createUserDto.password);
      
      const newUser = this.usersRepository.create({
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        passwordHash: hashedPassword,
      });

      return await this.usersRepository.save(newUser);

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      
      throw new InternalServerErrorException('Error al crear el usuario en la base de datos');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}