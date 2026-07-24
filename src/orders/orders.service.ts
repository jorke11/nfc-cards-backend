import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { CardOrder } from '../entities/card-order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { getPriceForShape } from './pricing';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly mpConfigured: boolean;
  private readonly frontendUrl: string;
  private preference: Preference | null = null;
  private payment: Payment | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CardOrder)
    private readonly orderRepository: Repository<CardOrder>,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const accessToken = this.configService.get('mercadopago.accessToken');

    if (accessToken) {
      const client = new MercadoPagoConfig({ accessToken });
      this.preference = new Preference(client);
      this.payment = new Payment(client);
      this.mpConfigured = true;
    } else {
      this.logger.warn('⚠️ MERCADOPAGO_ACCESS_TOKEN not configured — order checkout will not work yet');
      this.mpConfigured = false;
    }
  }

  async getMyOrders(userId: string): Promise<CardOrder[]> {
    return this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async createOrder(userId: string, userEmail: string, dto: CreateOrderDto): Promise<CardOrder> {
    const unitPrice = getPriceForShape(dto.shape);
    if (unitPrice === undefined) {
      throw new BadRequestException('Unknown shape');
    }

    if (dto.shape === 'custom' && !dto.imageUrl) {
      throw new BadRequestException('A custom design requires an uploaded image');
    }
    if (dto.shape !== 'custom' && !dto.color) {
      throw new BadRequestException('Color is required for this shape');
    }

    if (!this.mpConfigured || !this.preference) {
      throw new BadRequestException(
        'Payments are not configured yet. Set MERCADOPAGO_ACCESS_TOKEN to enable checkout.',
      );
    }

    const totalPrice = unitPrice * dto.quantity;

    let order = this.orderRepository.create({
      userId,
      shape: dto.shape,
      color: dto.color ?? null,
      title: dto.title ?? null,
      subtitle: dto.subtitle ?? null,
      imageUrl: dto.imageUrl ?? null,
      layout: dto.layout ?? null,
      quantity: dto.quantity,
      unitPrice,
      totalPrice,
      currency: 'USD',
      status: 'pending',
      shippingName: dto.shippingName,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingCountry: dto.shippingCountry,
      shippingPhone: dto.shippingPhone,
    });
    order = await this.orderRepository.save(order);

    const result = await this.preference.create({
      body: {
        items: [
          {
            id: order.id,
            title: `NFC ${dto.shape} card`,
            description: dto.title || `Custom NFC ${dto.shape} design`,
            quantity: dto.quantity,
            currency_id: 'USD',
            unit_price: unitPrice,
          },
        ],
        external_reference: order.id,
        payer: { name: dto.shippingName, email: userEmail },
        back_urls: {
          success: `${this.frontendUrl}/dashboard/orders`,
          pending: `${this.frontendUrl}/dashboard/orders`,
          failure: `${this.frontendUrl}/dashboard/orders`,
        },
        auto_return: 'approved',
      },
    });

    order.providerPreferenceId = result.id ?? null;
    order.initPoint = result.init_point ?? null;

    return this.orderRepository.save(order);
  }

  // Called from the webhook once we receive a "payment" notification.
  // Re-fetches the payment from MercadoPago rather than trusting the webhook
  // body directly, since the payload only carries the id.
  async syncPaymentFromProvider(paymentId: string): Promise<void> {
    if (!this.mpConfigured || !this.payment) {
      return;
    }

    const result = await this.payment.get({ id: paymentId });
    const orderId = result.external_reference;
    if (!orderId) {
      this.logger.warn(`Payment ${paymentId} has no external_reference`);
      return;
    }

    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`Webhook payment for unknown order ${orderId}`);
      return;
    }

    order.providerPaymentId = paymentId;
    if (result.status === 'approved') {
      order.status = 'paid';
    }
    await this.orderRepository.save(order);
  }
}
