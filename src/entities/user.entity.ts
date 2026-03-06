import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { VerificationToken } from './verification-token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'auth_provider', default: 'local' })
  authProvider: 'local' | 'google' | 'facebook' | 'linkedin' | 'apple';

  @Column({ name: 'provider_id', nullable: true })
  providerId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => VerificationToken, (token) => token.user)
  verificationTokens: VerificationToken[];
}
