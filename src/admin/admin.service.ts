import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';

const EXPIRING_SOON_WINDOW_DAYS = 7;

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async listUsers() {
    const [users, subscriptions] = await Promise.all([
      this.userRepository.find({
        relations: ['profile'],
        order: { createdAt: 'DESC' },
      }),
      this.subscriptionRepository.find(),
    ]);

    const subscriptionByUserId = new Map(subscriptions.map((s) => [s.userId, s]));
    const expiringSoonThreshold = new Date();
    expiringSoonThreshold.setDate(expiringSoonThreshold.getDate() + EXPIRING_SOON_WINDOW_DAYS);

    return users.map((user) => {
      const subscription = subscriptionByUserId.get(user.id) ?? null;
      const isExpiringSoon =
        !!subscription &&
        subscription.status === 'authorized' &&
        !!subscription.nextPaymentDate &&
        subscription.nextPaymentDate <= expiringSoonThreshold;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        authProvider: user.authProvider,
        role: user.role,
        createdAt: user.createdAt,
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              username: user.profile.username,
              uniqueId: user.profile.uniqueId,
            }
          : null,
        subscription: subscription
          ? {
              planId: subscription.planId,
              status: subscription.status,
              nextPaymentDate: subscription.nextPaymentDate,
            }
          : null,
        isExpiringSoon,
      };
    });
  }
}
