import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import { Subscription } from '../entities/subscription.entity';
import { getPlanById, PLANS } from './plans';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private readonly mpConfigured: boolean;
  private readonly frontendUrl: string;
  private preApproval: PreApproval | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const accessToken = this.configService.get('mercadopago.accessToken');

    if (accessToken) {
      const client = new MercadoPagoConfig({ accessToken });
      this.preApproval = new PreApproval(client);
      this.mpConfigured = true;
    } else {
      this.logger.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN not configured — checkout will not work yet');
      this.mpConfigured = false;
    }
  }

  getPlans() {
    return PLANS;
  }

  async getMySubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({ where: { userId } });
  }

  async createCheckout(userId: string, userEmail: string, planId: string): Promise<Subscription> {
    const plan = getPlanById(planId);
    if (!plan) {
      throw new BadRequestException('Unknown plan');
    }

    if (!this.mpConfigured || !this.preApproval) {
      throw new BadRequestException(
        'Payments are not configured yet. Set MERCADOPAGO_ACCESS_TOKEN to enable checkout.',
      );
    }

    const result = await this.preApproval.create({
      body: {
        reason: `${plan.name} subscription`,
        external_reference: userId,
        payer_email: userEmail,
        back_url: `${this.frontendUrl}/dashboard/billing`,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequencyType,
          transaction_amount: plan.price,
          currency_id: plan.currency,
        },
      },
    });

    let subscription = await this.subscriptionRepository.findOne({ where: { userId } });
    if (!subscription) {
      subscription = this.subscriptionRepository.create({ userId });
    }

    subscription.planId = plan.id;
    subscription.provider = 'mercadopago';
    subscription.providerSubscriptionId = result.id ?? null;
    subscription.status = 'pending';
    subscription.initPoint = result.init_point ?? null;
    subscription.nextPaymentDate = result.next_payment_date ? new Date(result.next_payment_date) : null;

    return this.subscriptionRepository.save(subscription);
  }

  // Called from the webhook once we receive a subscription_preapproval notification.
  // Re-fetches the subscription from MercadoPago rather than trusting the webhook
  // body directly, since the payload only carries the id.
  async syncFromProvider(providerSubscriptionId: string): Promise<void> {
    if (!this.mpConfigured || !this.preApproval) {
      return;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { providerSubscriptionId },
    });

    if (!subscription) {
      this.logger.warn(`Webhook for unknown subscription ${providerSubscriptionId}`);
      return;
    }

    const result = await this.preApproval.get({ id: providerSubscriptionId });
    subscription.status = (result.status as Subscription['status']) || subscription.status;
    subscription.nextPaymentDate = result.next_payment_date
      ? new Date(result.next_payment_date)
      : subscription.nextPaymentDate;
    await this.subscriptionRepository.save(subscription);
  }
}
