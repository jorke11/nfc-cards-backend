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

    const profileUrl = profile.username
      ? `${this.frontendUrl}/${profile.username}`
      : `${this.frontendUrl}/p/${profile.uniqueId}`;

    // If a custom redirect target is set and its link is present, use it instead
    const targetUrl = this.resolveRedirectTargetUrl(profile);
    return targetUrl || profileUrl;
  }

  private resolveRedirectTargetUrl(profile: Profile): string | null {
    switch (profile.redirectTarget) {
      case 'instagram':
        return profile.socialLinks?.instagram || null;
      case 'youtube':
        return profile.socialLinks?.youtube || null;
      case 'tiktok':
        return profile.socialLinks?.tiktok || null;
      case 'linkedin':
        return profile.socialLinks?.linkedin || null;
      case 'document':
        return profile.documentUrl || null;
      case 'menu_pdf':
        return profile.menuPdfUrl || null;
      case 'profile':
      default:
        return null;
    }
  }
}
