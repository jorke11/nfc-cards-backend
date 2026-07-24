import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { SHAPE_PRICES } from './pricing';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Get('pricing')
  @ApiOperation({ summary: 'List NFC card shapes and their prices' })
  getPricing() {
    return SHAPE_PRICES;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my card orders' })
  getMyOrders(@CurrentUser() user: User) {
    return this.ordersService.getMyOrders(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a card order and a MercadoPago checkout link' })
  createOrder(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, user.email, dto);
  }

  // MercadoPago calls this endpoint on payment events.
  // Signature verification (x-signature) is not implemented yet — sandbox only for now.
  @Post('webhook')
  async handleWebhook(@Body() body: { type?: string; data?: { id?: string } }) {
    this.logger.log(`Webhook received: ${JSON.stringify(body)}`);

    if (body?.type === 'payment' && body.data?.id) {
      await this.ordersService.syncPaymentFromProvider(body.data.id);
    }

    return { received: true };
  }
}
