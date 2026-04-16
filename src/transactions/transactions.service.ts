import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(private dataSource: DataSource) {}

  async transferCredits(senderId: string, receiverId: string, amount: number, concept: string, serviceId?: string) {
    if (amount <= 0) throw new BadRequestException('La cantidad debe ser mayor a cero.');
    if (senderId === receiverId) throw new BadRequestException('No puedes pagarte a ti mismo.');

    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sender = await queryRunner.manager.findOne(User, {
        where: { id: senderId },
        lock: { mode: 'pessimistic_write' },
      });
      const receiver = await queryRunner.manager.findOne(User, {
        where: { id: receiverId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sender || !receiver) throw new BadRequestException('Usuario no encontrado.');
      if (sender.balance < amount) throw new BadRequestException('Saldo insuficiente. Necesitas más Time Credits.');

      sender.balance -= amount;
      receiver.balance += amount;

      await queryRunner.manager.save(sender);
      await queryRunner.manager.save(receiver);

      const transaction = queryRunner.manager.create(Transaction, {
        sender: { id: senderId },
        receiver: { id: receiverId },
        amount,
        concept,
        relatedService: serviceId ? { id: serviceId } : undefined
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return transaction;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err instanceof Error ? err.message : 'Error al procesar la transferencia');
    } finally {
      await queryRunner.release();
    }
  }

  async getUserHistory(userId: string) {
    return await this.dataSource.getRepository(Transaction).find({
      where: [
        { sender: { id: userId } },
        { receiver: { id: userId } }
      ],
      relations: ['sender', 'receiver', 'relatedService'],
      order: { createdAt: 'DESC' },
      select: {
        sender: { id: true, fullName: true },
        receiver: { id: true, fullName: true }
      }
    });
  }
}