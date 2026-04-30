import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Service } from '../../services/entities/service.entity';

export enum UserRole {
  ADMIN = 'admin', 
  USER = 'user',      
}

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;
  
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole; 

  @Column({ default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;
  
  @OneToMany(() => Service, (service) => service.provider)
  services: Service[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}