import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ProfileView } from '../entities/profile-view.entity';
import { Profile } from '../entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProfileView, Profile])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
