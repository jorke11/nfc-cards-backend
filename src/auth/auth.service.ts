import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { VerificationToken } from '../entities/verification-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationToken)
    private readonly tokenRepository: Repository<VerificationToken>,
    private readonly jwtService: JwtService,
    private readonly profilesService: ProfilesService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = this.userRepository.create({
      email,
      passwordHash,
      authProvider: 'local',
    });

    await this.userRepository.save(user);

    // Auto-create a profile for the new user
    await this.profilesService.createProfile(user.id, { firstName, lastName });

    // Generate verification token
    const verificationToken = await this.createVerificationToken(
      user.id,
      'email_verification',
    );

    // TODO: Send verification email
    // await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.tokenRepository.findOne({
      where: { token, type: 'email_verification' },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    if (new Date() > verificationToken.expiresAt) {
      throw new BadRequestException('Verification token has expired');
    }

    // Update user
    verificationToken.user.emailVerified = true;
    await this.userRepository.save(verificationToken.user);

    // Delete used token
    await this.tokenRepository.remove(verificationToken);

    return {
      message: 'Email verified successfully',
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = await this.createVerificationToken(user.id, 'password_reset');

    // TODO: Send password reset email
    // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.tokenRepository.findOne({
      where: { token, type: 'password_reset' },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user
    resetToken.user.passwordHash = passwordHash;
    await this.userRepository.save(resetToken.user);

    // Delete used token
    await this.tokenRepository.remove(resetToken);

    return {
      message: 'Password reset successfully',
    };
  }

  async requestMagicLink(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If an account exists with this email, a magic link has been sent.',
      };
    }

    // Generate magic link token
    const magicToken = await this.createVerificationToken(user.id, 'magic_link');

    // TODO: Send magic link email
    // await this.emailService.sendMagicLinkEmail(user.email, magicToken);

    return {
      message: 'If an account exists with this email, a magic link has been sent.',
    };
  }

  async verifyMagicLink(token: string) {
    const magicToken = await this.tokenRepository.findOne({
      where: { token, type: 'magic_link' },
      relations: ['user'],
    });

    if (!magicToken) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    if (new Date() > magicToken.expiresAt) {
      throw new UnauthorizedException('Magic link has expired');
    }

    // Delete used token
    await this.tokenRepository.remove(magicToken);

    // Generate JWT token
    const accessToken = await this.generateToken(magicToken.user);

    return {
      accessToken,
      user: this.sanitizeUser(magicToken.user),
    };
  }

  async handleOAuth(oauthDto: OAuthDto) {
    const { provider, providerId, email, firstName, lastName } = oauthDto;

    // Check if user exists with this provider
    let user = await this.userRepository.findOne({
      where: { authProvider: provider as any, providerId },
    });

    if (!user) {
      // Check if user exists with this email
      user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        // User exists with different provider - link accounts
        throw new ConflictException(
          'An account with this email already exists. Please sign in with your original method.',
        );
      }

      // Create new user
      user = this.userRepository.create({
        email,
        authProvider: provider as any,
        providerId,
        emailVerified: true, // OAuth emails are pre-verified
      });

      await this.userRepository.save(user);
    }

    // Generate JWT token
    const accessToken = await this.generateToken(user);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async generateToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private async createVerificationToken(
    userId: string,
    type: 'email_verification' | 'password_reset' | 'magic_link',
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();

    // Set expiration based on type
    if (type === 'magic_link') {
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes
    } else {
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours
    }

    const verificationToken = this.tokenRepository.create({
      userId,
      token,
      type,
      expiresAt,
    });

    await this.tokenRepository.save(verificationToken);
    return token;
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
