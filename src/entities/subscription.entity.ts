import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  @Index()
  userId: string;

  @Column({ name: 'plan_id', length: 50 })
  planId: string;

  @Column({ length: 20, default: 'mercadopago' })
  provider: 'mercadopago';

  @Column({ name: 'provider_subscription_id', type: 'varchar', nullable: true })
  @Index()
  providerSubscriptionId: string | null;

  // pending: checkout created but not yet authorized by the payer
  // authorized: active, being billed
  // paused / cancelled: as reported by the provider webhook
  @Column({ length: 20, default: 'pending' })
  status: 'pending' | 'authorized' | 'paused' | 'cancelled';

  @Column({ name: 'init_point', nullable: true, type: 'text' })
  initPoint: string | null;

  @Column({ name: 'next_payment_date', type: 'timestamp', nullable: true })
  nextPaymentDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
