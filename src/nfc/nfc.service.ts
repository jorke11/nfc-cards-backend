import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NfcService {
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }

  async getRedirectUrl(uniqueId: string): Promise<string> {
    // Find profile by unique ID
    const profile = await this.profileRepository.findOne({
      where: { uniqueId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Check if profile is enabled
    if (!profile.isEnabled) {
      return `${this.frontendUrl}/profile-disabled`;
    }

    // Build redirect URL
    if (profile.username) {
      return `${this.frontendUrl}/${profile.username}`;
    } else {
      return `${this.frontendUrl}/p/${profile.uniqueId}`;
    }
  }
}
