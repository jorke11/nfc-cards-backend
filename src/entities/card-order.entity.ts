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

@Entity('card_orders')
export class CardOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 20 })
  shape: 'card' | 'square' | 'circle' | 'triangle' | 'custom';

  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  subtitle: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  // Percentage-based (0-100) positions of each draggable element within the design canvas
  @Column({ type: 'jsonb', nullable: true })
  layout: { title?: { x: number; y: number }; subtitle?: { x: number; y: number }; image?: { x: number; y: number } } | null;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  // pending: order created, awaiting payment
  // paid: payment confirmed by provider
  // shipped / cancelled: managed manually for now
  @Column({ length: 20, default: 'pending' })
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';

  @Column({ name: 'shipping_name', length: 150 })
  shippingName: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'shipping_city', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_country', length: 100 })
  shippingCountry: string;

  @Column({ name: 'shipping_phone', length: 50 })
  shippingPhone: string;

  @Column({ length: 20, default: 'mercadopago' })
  provider: 'mercadopago';

  @Column({ name: 'provider_preference_id', type: 'varchar', nullable: true })
  providerPreferenceId: string | null;

  @Column({ name: 'provider_payment_id', type: 'varchar', nullable: true })
  providerPaymentId: string | null;

  @Column({ name: 'init_point', type: 'text', nullable: true })
  initPoint: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
