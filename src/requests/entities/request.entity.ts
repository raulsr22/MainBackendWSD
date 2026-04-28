import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToOne, } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { RequestStatus } from '../enums/request-status.enum';
import { Review } from '../../reviews/entities/review.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  requester!: User;

  @ManyToOne(() => User)
  provider!: User;

  @ManyToOne(() => Service)
  service!: Service;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status!: RequestStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  agreedPrice!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Review, (review) => review.request, { eager: true })
  review!: Review;
}