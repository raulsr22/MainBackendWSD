import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';
import { ServiceRequest } from '../../requests/entities/request.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string; 

  @Column({ type: 'int' })
  rating!: number; 

  @Column({ type: 'text' })
  comment!: string; 

  @CreateDateColumn()
  createdAt!: Date; 

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User; 

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service!: Service; 

  @OneToOne(() => ServiceRequest, (request) => request.review)
  @JoinColumn({ name: 'requestId' })
  request!: ServiceRequest; 
}