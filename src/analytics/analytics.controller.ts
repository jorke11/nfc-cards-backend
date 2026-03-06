import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { TrackViewDto } from './dto/track-view.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('track/:profileId')
  @ApiOperation({
    summary: 'Track profile view',
    description: 'Records a view event for a specific profile. Captures visitor information including IP address, user agent, and referrer for analytics purposes.',
  })
  @ApiResponse({
    status: 201,
    description: 'View tracked successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async trackView(
    @Param('profileId') profileId: string,
    @Req() req: Request,
    @Body() trackViewDto: TrackViewDto,
  ) {
    const ipAddress = this.getClientIp(req);
    const userAgent = trackViewDto.userAgent || req.headers['user-agent'];
    const referrer = trackViewDto.referrer || req.headers.referer;

    const view = await this.analyticsService.trackView(
      profileId,
      ipAddress,
      userAgent,
      referrer,
    );

    return { message: 'View tracked successfully', viewId: view.id };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my analytics',
    description: 'Retrieves analytics data for the authenticated user profile including views, unique visitors, and trends. Supports optional date range filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or missing JWT token.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async getMyAnalytics(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getProfileAnalytics(user.id, start, end);
  }

  @Get('profile/:profileId')
  @ApiOperation({
    summary: 'Get profile analytics by ID',
    description: 'Retrieves analytics data for a specific profile by its ID. Includes views, unique visitors, and traffic patterns. Supports optional date range filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found.',
  })
  async getProfileAnalytics(
    @Param('profileId') profileId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.analyticsService.getProfileAnalyticsByProfileId(
      profileId,
      start,
      end,
    );
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
