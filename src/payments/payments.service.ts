import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>, 
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>
  ) {
    this.stripe = new Stripe('sk_test_51SIV1lI7tP0Sy3naQmhjJb9ktpoE8BEKf4ourw5g0r42ibYE5MqOfQbSHM8ze0T4t3G7I4UFw0YgJ4LKVFO6TTmf00SjaahalK', {
      apiVersion: '2026-04-22.dahlia', 
    });
  }

  async createCheckoutSession(userId: string, amountOfTC: number) {
    try {
      const amountInCents = amountOfTC * 100;
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
              currency: 'eur', 
              product_data: { name: `${amountOfTC} Time Credits` },
              unit_amount: amountInCents,
            },
            quantity: 1,
        }],
        mode: 'payment',
        // ATENCIÓN AQUÍ: Le decimos a Stripe que nos devuelva el ID de la sesión en la URL
        success_url: `http://localhost:4200/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4200/profile?payment=cancelled`,
        metadata: { userId, amountOfTC: amountOfTC.toString() }
      });
      return { checkoutUrl: session.url };
    } catch (error) {
      throw new InternalServerErrorException('Error al iniciar el pago');
    }
  }

  // Angular nos pasa el ID de la URL y verificamos si es real
  async verifyPayment(sessionId: string, userId: string) {
    try {
      // 1. Le preguntamos a Stripe por este ticket
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      // 2. Comprobamos si realmente está pagado
      if (session.payment_status === 'paid') {
        const amountToAdd = Number(session.metadata.amountOfTC);
        
        // 3. Buscamos al usuario y le sumamos el saldo
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        user.balance = Number(user.balance) + amountToAdd;
        await this.userRepository.save(user);

        const transaction = this.transactionRepository.create({
          amount: amountToAdd,
          concept: `Stripe Wallet Recharge (Ref: ${session.id.substring(0, 15)}...)`,
          sender: { id: userId } as any, // En recargas, el "emisor" técnico es el sistema o el propio user
          receiver: user,
          // relatedService se queda como null porque es una recarga, no un servicio
        });

        await this.transactionRepository.save(transaction);

        return { success: true, newBalance: user.balance, message: `Se han sumado ${amountToAdd} TC` };
      } else {
        throw new BadRequestException('El pago no se ha completado');
      }
    } catch (error) {
      throw new BadRequestException('Error al verificar el pago');
    }
  }
}