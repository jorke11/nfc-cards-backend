import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  private readonly logger = new Logger(SubscriptionsController.name);

  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get the current user subscription, if any' })
  getMySubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a MercadoPago checkout link for a plan' })
  createCheckout(@CurrentUser() user: User, @Body() dto: CreateCheckoutDto) {
    return this.subscriptionsService.createCheckout(user.id, user.email, dto.planId);
  }

  // MercadoPago calls this endpoint on subscription/payment events.
  // Signature verification (x-signature) is not implemented yet — sandbox only for now.
  @Post('webhook')
  async handleWebhook(@Body() body: { type?: string; action?: string; data?: { id?: string } }) {
    this.logger.log(`Webhook received: ${JSON.stringify(body)}`);

    if (body?.type === 'subscription_preapproval' && body.data?.id) {
      await this.subscriptionsService.syncFromProvider(body.data.id);
    }

    return { received: true };
  }
}
