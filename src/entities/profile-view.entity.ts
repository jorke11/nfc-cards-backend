import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_views')
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id' })
  @Index()
  profileId: string;

  @CreateDateColumn({ name: 'viewed_at' })
  @Index()
  viewedAt: Date;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true, type: 'text' })
  userAgent: string;

  @Column({ nullable: true, type: 'text' })
  referrer: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column({ name: 'device_type', nullable: true, length: 50 })
  deviceType: 'mobile' | 'desktop' | 'tablet';

  // Relations
  @ManyToOne(() => Profile, (profile) => profile.views, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;
}
