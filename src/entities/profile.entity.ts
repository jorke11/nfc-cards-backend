import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ProfileView } from './profile-view.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ unique: true, nullable: true, length: 50 })
  @Index()
  username: string;

  @Column({ name: 'unique_id', unique: true, length: 20 })
  @Index()
  uniqueId: string;

  // Required fields
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  // Optional fields — photo_url has explicit type so string | null is safe
  @Column({ name: 'photo_url', nullable: true, type: 'text' })
  photoUrl: string | null;

  @Column({ name: 'job_title', nullable: true, length: 150 })
  jobTitle: string;

  @Column({ nullable: true, length: 150 })
  company: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true, length: 50 })
  phone: string;

  @Column({ type: 'jsonb', default: [] })
  phones: { label: string; number: string }[];

  @Column({ name: 'email_public', nullable: true })
  emailPublic: string;

  @Column({ nullable: true })
  website: string;

  // JSON fields
  @Column({ name: 'social_links', type: 'jsonb', default: {} })
  socialLinks: Record<string, string>;

  @Column({ name: 'theme_settings', type: 'jsonb', default: {} })
  themeSettings: Record<string, any>;

  // Settings
  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ProfileView, (view) => view.profile)
  views: ProfileView[];
}
