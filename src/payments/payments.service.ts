import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private stripe: any;
  private endpointSecret = 'whsec_b86c343353500f49b4fa2d6746771c056164b05fce4cb1ea84fd5a532ef75938'; 

  
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>, 
    @InjectRepository(Transaction) private transactionRepository: Repository<Transaction>
  ) {
    this.stripe = new Stripe('sk_test_51SIV1H0VZT5n6PNK2NnkDPgDoWeEelRIF5gKevjpAf1MPzZZpTBkXZasZPBJwSYUyGQAnXzwMgwbLT8lRSovMT4n00UrSnnKqB', {
      apiVersion: '2020-08-27' as any,
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
        success_url: `http://localhost:4200/profile?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4200/profile?payment=cancelled`,
        metadata: { userId, amountOfTC: amountOfTC.toString() }
      });
      return { checkoutUrl: session.url };
    } catch (error) {
      throw new InternalServerErrorException('Error al iniciar el pago');
    }
  }

  private async processSuccessfulCheckout(session: any) {
    const userId = session.metadata.userId;
    const amountToAdd = Number(session.metadata.amountOfTC);
    const concept = `Stripe Wallet Recharge (Ref: ${session.id})`; 

    const existingTx = await this.transactionRepository.findOne({ where: { concept } });
    if (existingTx) return { success: true, message: 'Pago ya procesado previamente' };

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.balance = Number(user.balance) + amountToAdd;
    await this.userRepository.save(user);

    const transaction = this.transactionRepository.create({
      amount: amountToAdd,
      concept: concept,
      sender: { id: userId } as any, 
      receiver: user,
    });
    await this.transactionRepository.save(transaction);

    return { success: true, newBalance: user.balance, message: `Se han sumado ${amountToAdd} TC` };
  }

  async verifyPayment(sessionId: string, userId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        return await this.processSuccessfulCheckout(session);
      } else {
        throw new BadRequestException('El pago no se ha completado');
      }
    } catch (error) {
      throw new BadRequestException('Error al verificar el pago');
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.endpointSecret);
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      if (session.payment_status === 'paid') {
        await this.processSuccessfulCheckout(session);
      }
    }

    return { received: true };
  }
}