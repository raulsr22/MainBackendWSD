import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver!: User;

  @Column('int')
  amount!: number;

  @Column()
  concept!: string;

  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  relatedService!: Service;

  @CreateDateColumn()
  createdAt!: Date;
}