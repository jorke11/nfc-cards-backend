import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProfileView } from '../entities/profile-view.entity';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ProfileView)
    private readonly profileViewRepository: Repository<ProfileView>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async trackView(
    profileId: string,
    ipAddress: string,
    userAgent?: string,
    referrer?: string,
  ): Promise<ProfileView> {
    // Detect device type from user agent
    const deviceType = this.detectDeviceType(userAgent);

    const view = this.profileViewRepository.create({
      profileId,
      ipAddress,
      userAgent,
      referrer,
      deviceType,
      // Country detection can be added using a service like ipapi.co
    });

    return await this.profileViewRepository.save(view);
  }

  async getProfileAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // Get user's profile
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      return null;
    }

    // Default to last 30 days if no date range provided
    if (!startDate) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    if (!endDate) {
      endDate = new Date();
    }

    // Get all views in date range
    const views = await this.profileViewRepository.find({
      where: {
        profileId: profile.id,
        viewedAt: Between(startDate, endDate),
      },
      order: {
        viewedAt: 'DESC',
      },
    });

    // Calculate total views
    const totalViews = views.length;

    // Calculate unique visitors (by IP)
    const uniqueIps = new Set(views.map((v) => v.ipAddress));
    const uniqueVisitors = uniqueIps.size;

    // Group views by date
    const viewsByDate = this.groupViewsByDate(views);

    // Group views by device type
    const viewsByDevice = this.groupViewsByDevice(views);

    // Group views by country
    const viewsByCountry = this.groupViewsByCountry(views);

    // Get recent views (last 10)
    const recentViews = views.slice(0, 10);

    return {
      totalViews,
      uniqueVisitors,
      viewsByDate,
      viewsByDevice,
      viewsByCountry,
      recentViews,
    };
  }

  async getProfileAnalyticsByProfileId(
    profileId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // Default to last 30 days if no date range provided
    if (!startDate) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    if (!endDate) {
      endDate = new Date();
    }

    // Get all views in date range
    const views = await this.profileViewRepository.find({
      where: {
        profileId,
        viewedAt: Between(startDate, endDate),
      },
      order: {
        viewedAt: 'DESC',
      },
    });

    // Calculate statistics
    const totalViews = views.length;
    const uniqueIps = new Set(views.map((v) => v.ipAddress));
    const uniqueVisitors = uniqueIps.size;

    const viewsByDate = this.groupViewsByDate(views);
    const viewsByDevice = this.groupViewsByDevice(views);
    const viewsByCountry = this.groupViewsByCountry(views);
    const recentViews = views.slice(0, 10);

    return {
      totalViews,
      uniqueVisitors,
      viewsByDate,
      viewsByDevice,
      viewsByCountry,
      recentViews,
    };
  }

  private detectDeviceType(userAgent?: string): 'mobile' | 'desktop' | 'tablet' {
    if (!userAgent) return 'desktop';

    const ua = userAgent.toLowerCase();

    // Check for tablet
    if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) {
      return 'tablet';
    }

    // Check for mobile
    if (
      ua.includes('mobile') ||
      ua.includes('iphone') ||
      ua.includes('ipod') ||
      ua.includes('android')
    ) {
      return 'mobile';
    }

    return 'desktop';
  }

  private groupViewsByDate(views: ProfileView[]): { date: string; count: number }[] {
    const grouped = new Map<string, number>();

    views.forEach((view) => {
      const date = view.viewedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      grouped.set(date, (grouped.get(date) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private groupViewsByDevice(
    views: ProfileView[],
  ): { device: string; count: number }[] {
    const grouped = new Map<string, number>();

    views.forEach((view) => {
      const device = view.deviceType || 'unknown';
      grouped.set(device, (grouped.get(device) || 0) + 1);
    });

    return Array.from(grouped.entries()).map(([device, count]) => ({
      device,
      count,
    }));
  }

  private groupViewsByCountry(
    views: ProfileView[],
  ): { country: string; count: number }[] {
    const grouped = new Map<string, number>();

    views.forEach((view) => {
      const country = view.country || 'Unknown';
      grouped.set(country, (grouped.get(country) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);
  }
}
